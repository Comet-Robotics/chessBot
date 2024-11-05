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

    /**
     * deletes the socket at the provided id
     * @param id - id to be deleted
     */
    public handleSocketClosed(id: string): void {
        delete this.sockets[id];
    }

    /**
     * gets the socket at the provided id
     * @param id - id of the desired socket
     */
    public getSocket(id: string): WebSocket {
        return this.sockets[id];
    }

    /**
     * Sends a message to a socket with the specified id.
     * Returns true if the message was sent successfully, and false otherwise.
     */
    public sendToSocket(id: string, message: Message): boolean {
        const socket = this.getSocket(id);
        if (socket !== undefined) {
            socket.send(message.toJson());
            return true;
        }
        return false;
    }

    /**
     * send a message to all current sockets
     * @param message - message to be sent
     * @returns isSuccessful
     */
    public sendToAll(message: Message): boolean {
        const sockets = Object.values(this.sockets);
        for (const socket of sockets) {
            socket.send(message.toJson());
        }
        return true;
    }
}
