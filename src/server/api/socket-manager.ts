import WebSocket from "ws";
import { Message } from "../../common/message/message";

/**
 * A class which maps client ids to their corresponding sockets (if any).
 */
export class SocketManager {
    constructor(private sockets: Record<string, WebSocket>) {}

    public registerSocket(id: string, socket: WebSocket): void {
        this.sockets[id] = socket;
    }

    public handleSocketClosed(id: string): void {
        delete this.sockets[id];
    }

    public getSocket(id: string): WebSocket {
        return this.sockets[id];
    }

    public sendToSocket(id: string, message: Message): boolean {
        const socket = this.getSocket(id);
        if (socket !== undefined) {
            socket.send(message.toJson());
            return true;
        }
        return false;
    }
}
