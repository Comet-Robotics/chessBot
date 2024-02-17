import WebSocket from "ws";

export class ClientManager {
    private clientSockets: Record<string, WebSocket>;
    private player1: string;
    private player2: string;
    constructor() {
        this.clientSockets = {};
        this.player1 = "";
        this.player2 = "";
    }

    public registerClient(clientId: string, socket: WebSocket) {
        this.clientSockets[clientId] = socket;
    }

    public getClient(clientId: string): WebSocket {
        return this.clientSockets[clientId];
    }

    public assignConnection(clientId: string): number {
        if (this.player1 == "" || this.player1 == clientId) {
            this.player1 = clientId;
            return 0;
        } else if (this.player2 == "" || this.player2 == clientId) {
            this.player2 = clientId;
            return 1;
        }
        return 2;
    }
}
