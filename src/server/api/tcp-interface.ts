import * as net from "net";
const config = require('./botServerConfig.json');

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType
export enum PacketType {
    NOTHING,
    CLIENT_HELLO,
    SERVER_HELLO,
    PING_SEND,
    PING_RESPONSE,
    QUERY_VAR,
    QUERY_RESPONSE,
    INFORM_VAR,
    SET_VAR,
    TURN_BY_ANGLE,
    DRIVE_TILES,
    ACTION_SUCCESS,
    ACTION_FAIL,
    DRIVE_TANK,
    ESTOP
}

export class BotTunnel {
    connected: boolean = false;
    dataBuffer: Buffer | undefined;
    address: string | undefined;
    id: number | undefined;

    constructor(private socket: net.Socket, private onHandshake: (packetContent: string) => void) {
    }

    isActive() {
        return (this.socket.readyState === 'open');
    }

    getIdentifier() {
        if (this.id !== undefined) {
            return "ID: " + this.id;
        } else if (this.address !== undefined) {
            return "MAC Address: " + this.address;
        } else if (this.socket.remoteAddress !== undefined) {
            return "IP: " + this.socket.remoteAddress;
        } else {
            return 'Unnamed Robot';
        }
    }

    onData(data: Buffer) {
        console.log('connection data from %s: %j', this.getIdentifier(), data.toString());
        this.handleData(data);
    }

    onError(err: Error) {
        console.log('Connection error from %s: %s', this.getIdentifier, err);
        this.connected = false;
    }

    onClose() {
        console.log('Lost connection to %s', this.getIdentifier);
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
        const terminator = str.indexOf(';');

        if (terminator == -1) {
            if (str.length > 200) {
                // Invalid state, reset buf
                this.dataBuffer = undefined;
            }

            // Continue waiting for rest of packet
            return;
        }

        if (str.at(0) !== ':') {
            this.dataBuffer = undefined;
            return;
        }

        str = str.substring(1, terminator);

        if (this.dataBuffer.length > terminator) {
            this.dataBuffer = this.dataBuffer.subarray(terminator + 1);
        } else {
            this.dataBuffer = undefined;
        }

        const type = parseInt(str.substring(0, 2), 16);
        const contents = str.substring(3);

        this.handlePacket(type, contents);

        if (this.dataBuffer !== undefined && this.dataBuffer.indexOf(';') != -1) {
            this.handleQueue();
        }
    }

    handlePacket(type: PacketType, contents: string) {
        switch (type) {
        case PacketType.NOTHING: {break;}
        case PacketType.CLIENT_HELLO: {
            this.onHandshake(contents);
            this.connected = true;
        }
        }
    }

    send(type: PacketType, contents?: string) {
        var msg = ':';
        msg += type.toString(16);
        if (contents !== undefined) {
            msg += ',' + contents;
        }
        msg += ';';
        this.sendRaw(msg);
    }

    sendRaw(contents: string) {
        if (this.isActive()) {
            this.socket.write(contents);
        } else {
            console.log('Connection to', this.getIdentifier(), 'is inactive, failed to write', contents);
        }
    }
}

export class TCPServer {
    connections: { [address: string] : BotTunnel} = {}; // Map of ID to BotConnection
    server: net.Server;

    constructor() {
        this.server = net.createServer();
        this.server.on('connection', this.handleConnection);
        this.server.listen(config['tcpServerPort'], () => {
            console.log('TCP bot server listening to %j',
                this.server.address());
        });
    }

    handleConnection(socket: net.Socket) {
        const remoteAddress = socket.remoteAddress + ':' + socket.remotePort;
        console.log('New client connection from %s', remoteAddress);

        const connectionsReference = this.connections;
        const tunnel = new BotTunnel(socket, (mac: string) => {
            console.log('Adding robot with mac ', mac, ' to arr');
            connectionsReference[config['bots'][mac]] = tunnel;
        });

        socket.on('data', tunnel.onData);
        socket.once('close', tunnel.onClose);
        socket.on('error', tunnel.onError);
    };

    getBotAddressFromID(id: number) {
        return this.connections[id.toString()];
    }
}