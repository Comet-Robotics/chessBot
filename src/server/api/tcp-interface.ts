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

export class BotTunnel {
    connected: boolean = false;
    dataBuffer: Buffer | undefined;
    address: string | undefined;
    id: string | undefined;
    emitter: EventEmitter;

    constructor(
        private socket: net.Socket | null,
        private onHandshake: (packetContent: string) => void,
    ) {
        this.emitter = new EventEmitter();
    }

    isActive() {
        return this.socket!.readyState === "open";
    }

    getIdentifier(): string {
        if (this.id !== undefined) {
            return "ID: " + this.id;
        } else if (this.address !== undefined) {
            return "MAC Address: " + this.address;
        } else if (this.socket!.remoteAddress !== undefined) {
            return "IP: " + this.socket!.remoteAddress;
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

    handleData(data: Buffer) {
        if (this.dataBuffer !== undefined) {
            this.dataBuffer = Buffer.concat([this.dataBuffer, data]);
        } else {
            this.dataBuffer = data;
        }

        this.handleQueue();
    }

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
                case "CLIENT_HELLO": {
                    this.onHandshake(packet.macAddress);
                    this.send(this.makeHello(packet.macAddress));
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
        this.socket!.write(msg);
    }

    async waitForActionResponse(): Promise<void> {
        return new Promise((res, rej) => {
            this.emitter.once("actionComplete", (args) => {
                if (args.success) res();
                else rej(args.reason);
            });
        });
    }

    makeHello(mac: string): Packet {
        // Very ordered list of config nodes to send over
        // t: type, v: value
        const configEntries: [string, string][] = [];

        // Where a bot has a specific config changed, like moving a pin
        const overrides =
            (config[config.bots[mac]] ?? { attributes: {} })["attributes"] ??
            {};

        for (const i of config.botConfigSchema) {
            if (i.name in overrides) {
                configEntries.push([i.type, overrides[i.name]]);
            } else {
                configEntries.push([i.type, i.default_value.toString()]);
            }
        }

        const ret: Packet = {
            type: "SERVER_HELLO",
            protocol: SERVER_PROTOCOL_VERSION,
            config: configEntries,
        };

        console.error(JSON.stringify(ret));

        return ret;
    }
}

export class TCPServer {
    private server: net.Server;

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

    private handleConnection(socket: net.Socket) {
        const remoteAddress = socket.remoteAddress + ":" + socket.remotePort;
        console.log("New client connection from %s", remoteAddress);

        socket.setNoDelay(true);

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
                    config["bots"][mac] = id;
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
