// message.ts
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
     * A client-server message indicating the start of a human game.
     */
    HUMAN_GAME_START = "human-game-start",
    /**
     * A client-server message indicating the start of a computer game.
     */
    COMPUTER_GAME_START = "computer-game-start",
    /**
     * A two-way message indicating a game has been interrupted.
     *
     * Note this does not include the game ending as a part of the normal flow of moves.
     */
    GAME_INTERRUPTED = "game-interrupted",
    /**
     * A client-server message containing instructions for manually driving a robot.
     */
    DRIVE_ROBOT = "drive-robot",
    GAME_START = "GAME_START",
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

// Abstract class for starting a game
export abstract class GameStartMessage extends Message {
    constructor(
        public readonly gameType: string,
        public readonly side: string,
    ) {
        super();
    }

    protected toObj(): object {
        return {
            ...super.toObj(),
            gameType: this.gameType,
            side: this.side,
        };
    }
}

// Message for starting a human game
export class HumanGameStartMessage extends GameStartMessage {
    protected type = MessageType.HUMAN_GAME_START;
}

// Message for starting a computer game
export class ComputerGameStartMessage extends GameStartMessage {
    public readonly difficulty: string;

    constructor(gameType: string, side: string, difficulty: string) {
        super(gameType, side);
        this.difficulty = difficulty;
    }

    protected type = MessageType.COMPUTER_GAME_START;

    protected toObj(): object {
        return {
            ...super.toObj(),
            difficulty: this.difficulty,
        };
    }
}

/**
 * A function which can be used to send a message somewhere.
 */
export type SendMessage = (message: Message) => void;

/**
 * A function which receives messages and should do stuff with them.
 */
export type MessageHandler = (message: Message) => void;
