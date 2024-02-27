import { Chess, Square } from "chess.js";
import { aiMove } from "js-chess-engine";
import { GameFinishedReason } from "./game-end-reason";
import { Difficulty } from "./client-types";

export class ChessEngine {
    private chess: Chess;

    /**
     * @param fen - The fen to use. If undefined, a new game is created.
     */
    constructor(fen?: string) {
        this.chess = new Chess(fen);
    }

    getLegalMoves(square?: Square) {
        return this.chess.moves({
            square,
            verbose: true,
        });
    }

    getLegalSquares(square?: Square): Square[] {
        return this.getLegalMoves(square).map((move) => move.to);
    }

    get fen() {
        return this.chess.fen();
    }

    /**
     * Makes a move on the chess engine.
     * Returns the move that was made.
     */
    makeMove(from: Square, to: Square): { from: Square; to: Square } {
        this.chess.move({
            from,
            to,
        });
        return { from, to };
    }

    makeAiMove(difficulty: Difficulty): { from: Square; to: Square } {
        const val = Object.entries(aiMove(this.chess.fen(), difficulty))[0] as [
            string,
            string,
        ];
        const from = val[0].toLowerCase() as Square;
        const to = val[1].toLowerCase() as Square;
        return this.makeMove(from, to);
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
