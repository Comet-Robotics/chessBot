import WebSocket from "ws";

export class ClientManager {
    constructor(
        private clientSockets: Record<string, WebSocket>,
        private player1?: string,
        private player2?: string,
    ) {}

    public registerSocket(clientId: string, socket: WebSocket) {
        this.clientSockets[clientId] = socket;
    }

    public closeSocket(clientId: string) {
        delete this.clientSockets[clientId];
    }

    public getSocket(clientId: string): WebSocket {
        return this.clientSockets[clientId];
    }

    public player2Socket(): WebSocket | undefined {
        if (this.player2) {
            return this.getSocket(this.player2);
        }
        return undefined;
    }

    public registerPlayer(clientId: string): number {
        if (this.player1 === undefined || this.player1 === clientId) {
            this.player1 = clientId;
            return 0;
        } else if (this.player2 === undefined || this.player2 === clientId) {
            this.player2 = clientId;
            return 1;
        }
        return 2;
    }
}

export function makeClientManager(): ClientManager {
    return new ClientManager({}, undefined, undefined);
}
