import { Square } from "chess.js";
import { Message, MessageType } from "./message";
import { PieceType, Side } from "../game-types";
import { GameType } from "../client-types";
import { GameInterruptedReason } from "../game-end-reasons";
import { Difficulty } from "../client-types";

export class PositionMessage extends Message {
    constructor(public readonly pgn: string) {
        super();
    }

    protected type = MessageType.POSITION;

    protected toObj(): object {
        return { ...super.toObj(), pgn: this.pgn };
    }
}

export class MoveMessage extends Message {
    constructor(
        public readonly from: Square,
        public readonly to: Square,
    ) {
        super();
    }

    protected type = MessageType.MOVE;

    protected toObj(): object {
        return { ...super.toObj(), from: this.from, to: this.to };
    }
}

export class PromotionMessage extends MoveMessage {
    constructor(
        from: Square,
        to: Square,
        public readonly promotion: PieceType,
    ) {
        super(from, to);
    }

    protected type = MessageType.PROMOTION;

    protected toObj(): object {
        return { ...super.toObj(), promotion: this.promotion };
    }
}

export class GameStartMessage extends Message {
    constructor(
        public readonly gameType: GameType,
        public readonly side: Side,
        public readonly difficulty?: Difficulty,
    ) {
        super();
    }

    protected type = MessageType.GAME_START;

    protected toObj(): object {
        return {
            ...super.toObj(),
            gameType: this.gameType,
            side: this.side,
            difficulty: this.difficulty,
        };
    }
}

export class GameInterruptedMessage extends Message {
    constructor(public readonly reason: GameInterruptedReason) {
        super();
    }

    protected type = MessageType.GAME_INTERRUPTED;

    protected toObj(): object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}
