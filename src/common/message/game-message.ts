import { Message, MessageType } from "./message";
import { Move } from "../game-types";
import { GameInterruptedReason } from "../game-end-reasons";

/**
 * A message that includes a position and pgn
 */
export class PositionMessage extends Message {
    constructor(public readonly pgn: string) {
        super();
    }

    protected type = MessageType.POSITION;

    protected toObj(): object {
        return { ...super.toObj(), pgn: this.pgn };
    }
}

/**
 * A message that includes a move
 */
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

/**
 * A message for starting games
 */
export class GameStartedMessage extends Message {
    constructor() {
        super();
    }

    protected type = MessageType.GAME_STARTED;
}

/**
 * A message that contains why the game was interrupted
 */
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
