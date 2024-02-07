import { GameStoppedReason } from "./game-end";
import { GameType } from "./game-type";
import { Message, MessageType } from "./message";
import { PieceType } from "./types";

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

export class StartGameMessage extends Message {
    constructor(
        public readonly gameType: GameType,
        public readonly difficulty?: number,
    ) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.START_GAME;
    }

    protected toObj(): Object {
        return {
            ...super.toObj(),
            gameType: this.gameType,
            difficulty: this.difficulty,
        };
    }
}

export class StopGameMessage extends Message {
    constructor(public readonly reason: GameStoppedReason) {
        super();
    }

    protected get type(): MessageType {
        return MessageType.STOP_GAME;
    }

    protected toObj(): Object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}
