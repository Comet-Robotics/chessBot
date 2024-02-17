import { Chess, Square } from "chess.js";
import { aiMove } from "js-chess-engine";
import { FinishGameReason } from "./game-end";

type MoveEntry = [string, string];

export class ChessEngine {
    private chess: Chess;

    /**
     * @param fen - The fen to use. If undefined, a new game is created.
     */
    constructor(fen?: string) {
        this.chess = new Chess(fen);
    }

    reset() {
        this.chess.reset();
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

    makeMove(from: Square, to: Square) {
        this.chess.move({
            from,
            to,
        });
        console.log("Chess engine updated:", this.chess.fen());
        // Additional logging as needed
    }

    makeAiMove(difficulty: number): { from: Square; to: Square } {
        const val = Object.entries(
            aiMove(this.chess.fen(), difficulty),
        )[0] as MoveEntry;
        const from = val[0].toLowerCase() as Square;
        const to = val[1].toLowerCase() as Square;

        this.makeMove(from, to);
        return {
            from,
            to,
        };
    }

    getGameFinishedReason(): FinishGameReason | undefined {
        if (this.chess.isCheckmate()) {
            // If it's your turn, you lost
            return this.chess.turn() === "w" ?
                    FinishGameReason.WHITE_CHECKMATED
                :   FinishGameReason.BLACK_CHECKMATED;
        } else if (this.chess.isStalemate()) {
            return FinishGameReason.STALEMATE;
        } else if (this.chess.isThreefoldRepetition()) {
            return FinishGameReason.THREEFOLD_REPETITION;
        } else if (this.chess.isDraw()) {
            return this.chess.isInsufficientMaterial() ?
                    FinishGameReason.INSUFFICIENT_MATERIAL
                :   FinishGameReason.FIFTY_MOVES;
        }
        return undefined;
    }

    // This checks if getGameFinishedReason() is not undefined
    isGameOver(): boolean {
        return this.getGameFinishedReason() !== undefined;
    }
}
