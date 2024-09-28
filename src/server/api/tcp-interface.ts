import * as net from "net";
import config from "./bot-server-config.json";
import {
    Packet,
    SERVER_PROTOCOL_VERSION,
    jsonToPacket,
    packetToJson,
} from "../utils/tcp-packet";
import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";

/**
 * The tunnel for handling communications to the robots
 */
export class BotTunnel {
    connected: boolean = false;
    dataBuffer: Buffer | undefined;
    address: string | undefined;
    id: string | undefined;
    emitter: EventEmitter;

    /**
     * take the robot socket and creates an emitter to notify dependencies
     *
     * @param socket - socket of the incoming connections
     * @param onHandshake - handshake handler
     */
    constructor(
        private socket: net.Socket,
        private onHandshake: (packetContent: string) => void,
    ) {
        this.emitter = new EventEmitter();
    }

    isActive() {
        return this.socket.readyState === "open";
    }

    /**
     * get the most relevant identifier possible
     *
     * @returns - a robot identifier
     */
    getIdentifier(): string {
        if (this.id !== undefined) {
            return "ID: " + this.id;
        } else if (this.address !== undefined) {
            return "MAC Address: " + this.address;
        } else if (this.socket.remoteAddress !== undefined) {
            return "IP: " + this.socket.remoteAddress;
        } else {
            return "Unnamed Robot";
        }
    }

    onData(data: Buffer) {
        console.log(
            "connection data from %s: %j",
            this.getIdentifier(),
            data.toString(),
        );
        this.handleData(data);
    }

    onError(err: Error) {
        console.error(
            "Connection error from %s: %s",
            this.getIdentifier(),
            err,
        );
        this.connected = false;
    }

    onClose() {
        console.log("Lost connection to %s", this.getIdentifier());
        this.connected = false;
    }

    /**
     * Sets up the data buffer for it to be handled by the queue
     *
     * @param data - data to be handled
     */
    handleData(data: Buffer) {
        if (this.dataBuffer !== undefined) {
            this.dataBuffer = Buffer.concat([this.dataBuffer, data]);
        } else {
            this.dataBuffer = data;
        }

        this.handleQueue();
    }

    /**
     * handles the incoming data and check if it is valid
     *
     * emits result for further handling
     *
     * @returns - nothing if nothing happened and nothing if something happened
     */
    handleQueue() {
        if (this.dataBuffer === undefined || this.dataBuffer.length < 3) {
            this.dataBuffer = undefined;
            return;
        }

        let str = this.dataBuffer.toString();
        const terminator = str.indexOf(";");

        if (terminator === -1) {
            if (str.length > 200) {
                // Invalid state, reset buf
                this.dataBuffer = undefined;
            }

            // Continue waiting for rest of packet
            return;
        }

        str = str.substring(0, terminator);

        if (this.dataBuffer.length > terminator) {
            this.dataBuffer = this.dataBuffer.subarray(terminator + 1);
        } else {
            this.dataBuffer = undefined;
        }

        try {
            const packet = jsonToPacket(str);

            // Parse packet based on type
            switch (packet.type) {
                //register new robot
                case "CLIENT_HELLO": {
                    this.onHandshake(packet.macAddress);
                    this.send({
                        type: "SERVER_HELLO",
                        protocol: SERVER_PROTOCOL_VERSION,
                    });
                    this.connected = true;
                    break;
                }
                case "PING_SEND": {
                    this.send({ type: "PING_RESPONSE" });
                    break;
                }
                case "ACTION_SUCCESS": {
                    this.emitter.emit("actionComplete", { success: true });
                    break;
                }
                case "ACTION_FAIL": {
                    this.emitter.emit("actionComplete", {
                        success: false,
                        reason: packet.reason,
                    });
                    break;
                }
            }
        } catch (e) {
            console.warn("Received invalid packet with error", e);
        }

        // Handle next message if the data buffer has another one
        if (
            this.dataBuffer !== undefined &&
            this.dataBuffer.indexOf(";") !== -1
        ) {
            this.handleQueue();
        }
    }

    send(packet: Packet) {
        const str = packetToJson(packet);
        const msg = str + ";";

        if (!this.isActive()) {
            console.error(
                "Connection to",
                this.getIdentifier(),
                "is inactive, failed to write",
                msg,
            );
            // throw new Error(
            //     "Cannot send packet to inactive connection: " +
            //         this.getIdentifier(),
            // );
        }

        console.log({ msg });
        this.socket.write(msg);
    }

    async waitForActionResponse(): Promise<void> {
        return new Promise((res, rej) => {
            this.emitter.once("actionComplete", (args) => {
                if (args.success) res();
                else rej(args.reason);
            });
        });
    }
}

export class TCPServer {
    private server: net.Server;

    /**
     * creates a tcp server on port from server config and registers passed in ids with their corresponding bot tunnels
     *
     * when a robot connects, bind it to the server
     *
     * @param connections - bot connections in a id:BotTunnel array
     */
    constructor(private connections: { [id: string]: BotTunnel } = {}) {
        this.server = net.createServer();
        this.server.on("connection", this.handleConnection.bind(this));
        this.server.listen(config["tcpServerPort"], () => {
            console.log(
                "TCP bot server listening to %j",
                this.server.address(),
            );
        });
    }

    /**
     * When a robot connects, add the tunnel to the robot connections at its id
     *
     * assign a random id to new robots
     *
     * @param socket - the incoming connection socket information
     */
    private handleConnection(socket: net.Socket) {
        const remoteAddress = socket.remoteAddress + ":" + socket.remotePort;
        console.log("New client connection from %s", remoteAddress);

        const tunnel = new BotTunnel(
            socket,
            ((mac: string) => {
                console.log("Adding robot with mac", mac, "to arr");
                let id: string;
                if (!(mac in config["bots"])) {
                    id = `unknown-robot-${randomUUID()}`;
                    console.log(
                        "Address not found in config! Assigning random ID: " +
                            id,
                    );
                } else {
                    id = config["bots"][mac];
                    console.log("Found address ID: " + id);
                }
                tunnel.id = id;
                tunnel.address = mac;
                this.connections[id] = tunnel;
            }).bind(this),
        );

        socket.on("data", tunnel.onData.bind(tunnel));
        socket.once("close", tunnel.onClose.bind(tunnel));
        socket.on("error", tunnel.onError.bind(tunnel));
    }

    public getTunnelFromId(id: string): BotTunnel {
        return this.connections[id];
    }

    public getConnectedIds(): string[] {
        return Object.keys(this.connections);
    }
}
