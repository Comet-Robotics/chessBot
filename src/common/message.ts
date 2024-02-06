import { GameOverReason } from "./game-over-reason";
import { PieceType } from "./types";

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
     * A server-client message indicating the game was ended. Used to notify all clients of game end.
     */
    GAME_OVER = "game-over",
    /**
     * A client-server message containing instructions for manually driving a robot.
     */
    DRIVE_ROBOT = "drive-robot",
}

export enum ClientServerMessage {}

export function parseMessage(text: string): Message {
    const obj = JSON.parse(text);
    switch (obj.type) {
        case MessageType.POSITION:
            return new PositionMessage(obj.position);
        case MessageType.MOVE:
            return new MoveMessage(obj.from, obj.to);
        case MessageType.PROMOTION:
            return new PromotionMessage(obj.from, obj.to, obj.promotion);
        case MessageType.DRIVE_ROBOT:
            return new DriveRobotMessage(
                obj.id,
                parseFloat(obj.leftPower),
                parseFloat(obj.rightPower),
            );
    }
    throw new Error("Failed to parse message.");
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

export class PositionMessage extends Message {
    constructor(public readonly position: string) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.POSITION;
    }

    protected toObj(): Object {
        return { ...super.toObj(), position: this.position };
    }
}

export class MoveMessage extends Message {
    constructor(
        public readonly from: string,
        public readonly to: string,
    ) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.MOVE;
    }

    protected toObj(): Object {
        return { ...super.toObj(), from: this.from, to: this.to };
    }
}

export class PromotionMessage extends MoveMessage {
    constructor(
        from: string,
        to: string,
        public readonly promotion: PieceType,
    ) {
        super(from, to);
    }

    protected get type(): MessageType {
        return MessageType.PROMOTION;
    }

    protected toObj(): Object {
        return { ...super.toObj(), promotion: this.promotion };
    }
}

export class GameOverMessage extends Message {
    constructor(public readonly reason: GameOverReason) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.GAME_OVER;
    }

    protected toObj(): Object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}

export class DriveRobotMessage extends Message {
    constructor(
        public readonly id: string,
        public readonly leftPower: number,
        public readonly rightPower: number,
    ) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.DRIVE_ROBOT;
    }

    protected toObj(): Object {
        return {
            ...super.toObj(),
            id: this.id,
            leftPower: this.leftPower,
            rightPower: this.rightPower,
        };
    }
}

/**
 * An abstract message used to stop a robot.
 * This message looks to the server like a DriveRobotMessage with power set to 0.
 */
export class StopRobotMessage extends DriveRobotMessage {
    constructor(public readonly id: string) {
        super(id, 0, 0);
    }
}
