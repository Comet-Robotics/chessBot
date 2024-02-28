import { Chess, Square } from "chess.js";
import { aiMove } from "js-chess-engine";
import { FinishGameReason } from "./game-end-reason";
import { Difficulty } from "./client-types";
import { Move } from "./game-types";
import { PieceType } from "./game-types";
import { Side } from "./game-types";

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

    //returns the PieceType of the of the piece on the square or undefined
    getPiece(square: Square): PieceType | undefined {
        const piece = this.chess.get(square);
        if (piece !== null) {
            return piece.type as PieceType;
        } else {
            return undefined;
        }
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

    makeMove(move: Move) {
        this.chess.move(move);
    }

    /**
     * Returns true if a move is a promotion, and false otherwise.
     */
    isPromotionMove = (from: Square, to: Square) => {
        if (this.getPiece(from) !== PieceType.PAWN) {
            return false;
        } else if (this.chess.get(from).color === Side.WHITE) {
            return from[1] === "7" && to[1] === "8";
        }
        return from[1] === "2" && to[1] === "1";
    };

    makeAiMove(difficulty: Difficulty): Move {
        const val = Object.entries(aiMove(this.chess.fen(), difficulty))[0] as [
            string,
            string,
        ];
        const from = val[0].toLowerCase() as Square;
        const to = val[1].toLowerCase() as Square;

        if (this.isPromotionMove(from, to)) {
            this.makeMove({ from, to, promotion: PieceType.QUEEN });
        } else {
            this.makeMove({ from, to });
        }

        return { from, to, promotion: PieceType.QUEEN };
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
