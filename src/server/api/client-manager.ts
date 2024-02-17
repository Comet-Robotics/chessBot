import WebSocket from "ws";

export class ClientManager {
    constructor(
        private clientSockets: Record<string, WebSocket>,
        private hostId?: string,
        private clientId?: string,
    ) {}

    public registerSocket(clientId: string, socket: WebSocket) {
        console.log("Register socket");
        this.clientSockets[clientId] = socket;
    }

    public closeSocket(clientId: string) {
        delete this.clientSockets[clientId];
    }

    public getSocket(clientId: string): WebSocket {
        return this.clientSockets[clientId];
    }

    public getClientSocket(): WebSocket | undefined {
        if (this.clientId) {
            return this.getSocket(this.clientId);
        }
        return undefined;
    }

    public registerPlayer(id: string): number {
        if (this.hostId === undefined || this.hostId === id) {
            console.log("Register host");
            this.hostId = id;
            return 0;
        } else if (this.clientId === undefined || this.clientId === id) {
            console.log("Register client");
            this.clientId = id;
            return 1;
        }
        return 2;
    }
}

export function makeClientManager(): ClientManager {
    return new ClientManager({}, undefined, undefined);
}
