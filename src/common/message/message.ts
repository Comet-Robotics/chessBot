/**
 * Defines messages sent across web sockets between the server and the client (and/or the client and the server).
 *
 * To add a new message, first add a member to MessageType, then create a corresponding class which extends `Message` and implements the `type` method and the `toObj` method.
 * Finally, add a corresponding case to `parseMessage` in `./parse-message`.
 */

/**
 * A collection of WebSocket message types.
 */
export enum MessageType {
    /**
     * A client-server message used to register a websocket with the server.
     */
    REGISTER_WEBSOCKET = "register-websocket",
    /**
     * A server-client message defining the current position of a game.
     * Used to allow clients to reconnect.
     */
    POSITION = "position",
    /**
     * A two-way message containing a single move.
     */
    MOVE = "move",
    /**
     * A two-way message containing a promotion.
     * Like a move, but also indicates the piece being promoted to.
     */
    PROMOTION = "promotion",
    /**
     * A client-server message used to indicate the start of a game.
     */
    START_GAME = "start-game",
    /**
     * A server-client message indicating the stop of a game.
     *
     * Note this message is only used in cases where the game has stopped for a (possibly unexpected) reason.
     * It is not sent in cases where the normal flow of moves naturally ends the game.
     */
    STOP_GAME = "stop-game",
    /**
     * A client-server message containing instructions for manually driving a robot.
     */
    DRIVE_ROBOT = "drive-robot",
}

export abstract class Message {
    /**
     * Serializes the message as json.
     */
    public toJson(): string {
        return JSON.stringify(this.toObj());
    }

    protected abstract type: MessageType;

    /**
     * Sends this class to an object which can be serialized as json.
     * The only usage of this method is by `toJson`.
     */
    protected toObj(): object {
        return { type: this.type };
    }
}

export class RegisterWebsocketMessage extends Message {
    protected type = MessageType.REGISTER_WEBSOCKET;
}

/**
 * A function which can be used to send a message somewhere.
 */
export type SendMessage = (message: Message) => void;

/**
 * A function which receives messages and should do stuff with them.
 */
export type MessageHandler = (message: Message) => void;
