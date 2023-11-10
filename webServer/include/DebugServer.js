
// eslint-disable-next-line no-unused-vars
const WebSocketError = {
    DUPLICATED_CONNECTION: 1,
};

class DebugConnection {
    // We are very trusting right now
    #authenticated = true;

    #webSocket;
    #clientIp;

    #server;

    constructor(webSocket, clientIp, server) {
        this.#webSocket = webSocket;
        this.#clientIp = clientIp;
        this.#server = server;

        webSocket.on('message', this.onMessage.bind(this));
    }

    onMessage(msg) {
        msg = JSON.parse(msg);
        console.log(msg);

        const connections = this.#server.botServer.connections;
        if (msg.type === 'queryBotList') {
            const packet = {type: 'botList', bots: {}};

            for (const [key, bot] of Object.entries(connections)) {
                packet['bots'][key] = {};
                packet['bots'][key]['connected'] = bot.connected;
            }

            this.#webSocket.send(JSON.stringify(packet));
        } else if (msg.type === 'rawPacket') {
            const bot = connections[msg.target];
            if (bot) {
                bot.send(msg.contents);
            }
            const packet = {type: 'ackRawPacket', data: msg};
            this.#webSocket.send(JSON.stringify(packet));
        }
    }
};

// Maintains websocket connections with clients that can control individual bots
class DebugServer {
    #connections = [];

    // Reference back to whole server
    #server;

    constructor(server) {
        this.#server = server;
    }

    bindWebSocket(newSocket, request) {
        console.log('binding to new socket for debugServer');

        const addr = request.socket.remoteAddress;

        /* if (this.#connections[addr] !== undefined) {
            // Close existing connection
            this.#connections[addr].close(WebSocketError.DUPLICATED_CONNECTION);
            this.#connections[addr] = undefined;
        }*/
        this.#connections[addr] =
            new DebugConnection(newSocket, addr, this.#server);
    }
};

module.exports = DebugServer;
