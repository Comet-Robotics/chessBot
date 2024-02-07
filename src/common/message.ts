/**
 * A collection of WebSocket message types.
 */
export enum MessageType {
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
    protected abstract get type(): MessageType;

    public toJson(): string {
        return JSON.stringify(this.toObj());
    }

    protected toObj(): Object {
        return { type: this.type };
    }
}
