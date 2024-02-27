import { Chess, Square } from "chess.js";
import { aiMove } from "js-chess-engine";
import { GameFinishedReason } from "./game-end-reasons";
import { Difficulty } from "./client-types";

export class ChessEngine {
    private chess: Chess;

    /**
     * @param pgn - The pgn to use. If undefined, a new game is created.
     */
    constructor(pgn?: string) {
        this.chess = new Chess();
        if (pgn !== undefined) {
            this.chess.loadPgn(pgn);
        }
    }

    copy(move?: { from: Square; to: Square }): ChessEngine {
        const copy = new ChessEngine();
        copy.loadPgn(this.pgn);
        if (move !== undefined) {
            copy.makeMove(move.from, move.to);
        }
        return copy;
    }

    get fen(): string {
        return this.chess.fen();
    }

    get pgn(): string {
        return this.chess.pgn();
    }

    loadPgn(pgn: string) {
        this.chess.loadPgn(pgn);
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
        const val = Object.entries(aiMove(this.fen, difficulty))[0] as [
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

    /**
     * Returns true if `getGameFinishedReason` does not return undefined.
     */
    isGameFinished(): boolean {
        return this.getGameFinishedReason() !== undefined;
    }
}
