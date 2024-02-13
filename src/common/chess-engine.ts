// engine.ts

import { Chess, Square } from "chess.js";
import { GameFinishedReason } from "./game-end";

export class ChessEngine {
    private chess: Chess;
    private static DEFAULT_POSITION = "start";

    constructor(fen?: string) {
        this.chess = new Chess(fen ?? ChessEngine.DEFAULT_POSITION);
    }

    reset() {
        this.chess.reset();
    }

    getMoves(square?: Square) {
        return this.chess.moves({
            square,
            verbose: true,
        });
    }

    getSquares(square?: Square): Square[] {
        const moves = this.getMoves(square);
        return moves.map((move) => move.to);
    }

    get fen() {
        return this.chess.fen();
    }

    makeMove(from: Square, to: Square) {
        this.chess.move({
            from: from,
            to,
        });
        console.log("Chess engine updated:", this.chess.fen());
        // Additional logging as needed
    }

    getGameFinishedReason(): GameFinishedReason | undefined {
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
        return undefined;
    }

    // This checks if getGameFinishedReason() is not undefined
    isGameOver(): boolean {
        return this.getGameFinishedReason() !== undefined;
    }
}
