import { Square } from "chess.js";
import { Message, MessageType } from "./message";
import { PieceType } from "../types";
import { GameType } from "../types";
import { StopGameReason } from "../game-end";

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
        public readonly from: Square,
        public readonly to: Square,
        public readonly promotionPiece?: PieceType,
    ) {
        super();
    }

    protected type = MessageType.MOVE;

    protected toObj(): Object {
        return {
            ...super.toObj(),
            from: this.from,
            to: this.to,
            promotionPiece: this.promotionPiece,
        };
    }
}

export class StartGameMessage extends Message {
    constructor(
        public readonly gameType: GameType,
        public readonly isWhite: boolean,
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
            isWhite: this.isWhite,
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
