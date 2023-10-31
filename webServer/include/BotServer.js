const net = require('net');

const config = require('../config.json');

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType
const PacketType =
{
    NOTHING: 0,
    CLIENT_HELLO: 1,
    SERVER_HELLO: 2,
    PING_SEND: 3,
    PING_RESPONSE: 4,
    QUERY_VAR: 5,
    QUERY_RESPONSE: 6,
    INFORM_VAR: 7,
    SET_VAR: 8,
    MOVE_TO_SPACE: 9,
    MOVE_TO_POS: 10,
    DRIVE: 11,
};

class PacketParser {
    #buf;
    #handler;

    constructor(handler) {
        this.#handler = handler;
    }

    handlePacket(str) {
        const type = parseInt(str.substring(0, 2), 16);
        const contents = str.substring(3);

        this.#handler(type, contents);
    }

    handleQueue() {
        if (this.#buf === undefined || this.#buf.length < 3) {
            this.#buf = undefined;
            console.log('p2');

            return;
        }

        let str = this.#buf.toString();
        const terminator = str.indexOf(';');

        console.log('p2 ', str, terminator);

        if (terminator == -1) {
            if (str.length > 200) {
                // Invalid state, reset buf
                this.#buf = undefined;
            } else {
                // Continue waiting for rest of packet
            }

            return;
        }

        if (str.at(0) !== ':') {
            this.#buf = undefined;
            return;
        }

        str = str.substring(1, terminator);

        if (this.#buf.length > terminator) {
            this.#buf = this.#buf.slice(terminator + 1);
        } else {
            this.#buf = undefined;
        }

        this.handlePacket(str);

        if (this.#buf.indexOf(';') != -1) {
            this.handleQueue();
        }
    }

    handleData(buf /* Buffer */) {
        if (this.#buf !== undefined) {
            console.log('p1');
            this.#buf.concat(buf);
        } else {
            this.#buf = buf;
        }

        this.handleQueue();
    }
}

class BotConnection {
    #conn; // Socket
    #parser;

    #onBindMac;

    id; // Bot ID from 1-32
    address; // MAC address of microcontroller

    connected;

    constructor(conn) {
        this.#conn = conn;
        this.#parser = new PacketParser(this.handlePacket.bind(this));
    }

    onConnData(data) {
        console.log('connection data from %s: %j',
            this.#conn.remoteAddress, data.toString());
        this.#parser.handleData(data);
    }
    onConnClose() {
        console.log('Lost connection to %s', this.#conn.remoteAddress);

        this.connected = false;
    }
    onConnError(err) {
        console.log('Connection error on %s: %s',
            this.#conn.remoteAddress, err);

        this.connected = false;
    }

    handlePacket(type, contents) {
        switch (type) {
        case PacketType.NOTHING: {break;}
        case PacketType.CLIENT_HELLO: {
            this.#onBindMac(contents);
            this.connected = true;
        }
        }
    }

    setOnBindMac(func /* string macaddress => void */) {
        this.#onBindMac = func;
    }

    identity() {
        if (this.id !== undefined) {
            return this.id;
        } else if (this.address !== undefined) {
            return this.address;
        } else if (socket !== undefined) {
            return socket.remoteAddress;
        } else {
            return 'Unnamed Robot';
        }
    }

    isActive() {
        return (this.#conn != undefined) && (this.#conn.readyState === 'open');
    }

    send(contents) {
        if (this.isActive()) {
            this.#conn.write(contents);
        } else {
            console.log('Connection to', this.identity(),
                'is inactive, failed to write', contents);
        }
    }
}

class BotServer {
    connections = {}; // Map of ID to BotConnection
    #socket;

    // Reference back to whole server
    #server;

    constructor(server) {
        this.#server = server;

        this.#socket = net.createServer();
        this.#socket.on('connection', this.handleConnection.bind(this));
        this.#socket.listen(3001, () => {
            console.log('TCP bot server listening to %j',
                this.#socket.address());
        });
    }

    handleConnection(conn) {
        const remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
        console.log('new client connection from %s', remoteAddress);

        const robotConn = new BotConnection(conn);
        const connectionsTable = this.connections;

        robotConn.setOnBindMac((mac) => {
            console.log('Adding robot at', mac, 'to arr');
            connectionsTable[config['bots'][mac]] = robotConn;
        });

        conn.on('data', robotConn.onConnData.bind(robotConn));
        conn.once('close', robotConn.onConnClose.bind(robotConn));
        conn.on('error', robotConn.onConnError.bind(robotConn));
    }

    getBot(id) {
        return this.connections[id.toString()];
    }
}

module.exports = BotServer;
