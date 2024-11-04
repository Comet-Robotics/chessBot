import { Message, MessageType } from "./message";
import { Move } from "../game-types";
import {
    GameInterruptedReason,
    GameHoldReason,
    GameEndReason,
} from "../game-end-reasons";

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
    constructor(public readonly move: Move) {
        super();
    }

    protected type = MessageType.MOVE;

    protected toObj(): object {
        return {
            ...super.toObj(),
            move: this.move,
        };
    }
}
export class SetChessMessage extends Message {
    constructor(public readonly chess: string) {
        super();
    }

    protected type = MessageType.SET_CHESS;

    protected toObj(): object {
        return {
            ...super.toObj(),
            chess: this.chess,
        };
    }
}
export class GameStartedMessage extends Message {
    constructor() {
        super();
    }

    protected type = MessageType.GAME_STARTED;
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

export class GameHoldMessage extends Message {
    constructor(public readonly reason: GameHoldReason) {
        super();
    }

    protected type = MessageType.GAME_HELD;

    protected toObj(): object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}

export class GameEndMessage extends Message {
    constructor(public readonly reason: GameEndReason) {
        super();
    }

    protected type = MessageType.GAME_ENDED;

    protected toObj(): object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}
