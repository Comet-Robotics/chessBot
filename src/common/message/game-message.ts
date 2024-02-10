import { StopGameReason } from "../game-end";
import { GameType } from "../game-type";
import { Message, MessageType } from "./message";
import { PieceType } from "../types";

export class PositionMessage extends Message {
    constructor(public readonly position: string) {
        super();
    }

    protected type = MessageType.POSITION;

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

    protected type = MessageType.MOVE;

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

    protected type = MessageType.PROMOTION;

    protected toObj(): Object {
        return { ...super.toObj(), promotion: this.promotion };
    }
}

export class StartGameMessage extends Message {
    constructor(
        public readonly gameType: GameType,
        public readonly difficulty?: number,
    ) {
        super();
    }

    protected type = MessageType.START_GAME;

    protected toObj(): Object {
        return {
            ...super.toObj(),
            gameType: this.gameType,
            difficulty: this.difficulty,
        };
    }
}

export class StopGameMessage extends Message {
    constructor(public readonly reason: StopGameReason) {
        super();
    }

    protected type = MessageType.STOP_GAME;

    protected toObj(): Object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}
