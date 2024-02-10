// engine.ts

import { Chess, Square } from "chess.js";
import { GameFinishedReason } from "./game-end";

export class ChessEngine {
    private chess: Chess;

    constructor() {
        this.chess = new Chess();
    }

    reset() {
        this.chess.reset();
    }

    getMoves(passedSquare?: Square) {
        return this.chess.moves({ square: passedSquare, verbose: true });
    }

    get fen() {
        return this.chess.fen();
    }

    makeMove(from: string, to: string) {
        this.chess.move({ from, to });
        console.log("Chess engine updated:", this.chess.fen());
        // Additional logging as needed
    }

    getGameFinishedReason(): GameFinishedReason {
        if (this.chess.isCheckmate()) {
            // If it's your turn, you lost
            return this.chess.turn() === "w" ?
                    GameFinishedReason.WHITE_CHECKMATED
                :   GameFinishedReason.BLACK_CHECKMATED;
        } else if (this.chess.isStalemate()) {
            return GameFinishedReason.STALEMATE;
        } else if (this.chess.isThreefoldRepetition()) {
            return GameFinishedReason.THREEFOLD_REPETITION;
        } else if (this.chess.isDraw()) {
            return this.chess.isInsufficientMaterial() ?
                    GameFinishedReason.INSUFFICIENT_MATERIAL
                :   GameFinishedReason.FIFTY_MOVES;
        }
        throw new Error("Failed to find game over reason.");
    }

    // Add other methods with logging as necessary
}
