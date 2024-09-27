import { Chess, Square } from "chess.js";
import { aiMove } from "js-chess-engine";
import { GameFinishedReason } from "./game-end-reasons";
import { Difficulty } from "./client-types";
import { Move, PieceType, Side } from "./game-types";

/**
 * Creates the engine to manage chess game
 * 
 * includes movement, ai moves, castling, en passant, and game finished
 */
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

    /**
     * Copies the chess engine, optionally with an extra move on the copy.
     * @param move - A move to make.
     */
    copy(move?: Move): ChessEngine {
        const copy = new ChessEngine();
        copy.loadPgn(this.pgn);
        if (move !== undefined) {
            copy.makeMove(move);
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

    getLastMove() {
        const moves = this.chess.history({ verbose: true });
        return moves.length > 0 ? moves[moves.length - 1] : undefined;
    }

    /**
     * Takes a move argument and determines if the move is a King Side Castle.
     * Assumes that chess hasn't been updated yet
     * @returns true if the move is a King Side Castle
     */
    isKingSideCastling(move: Move) {
        if (this.getPieceTypeFromSquare(move.from) !== PieceType.KING) {
            return false;
        } else if (this.chess.get(move.from).color === Side.WHITE) {
            return move.from === "e1" && move.to === "g1";
        } else {
            return move.from === "e8" && move.to === "g8";
        }
    }

    /**
     * Takes a move argument and determines if the move is an En Passant Capture.
     * Assumes that chess hasn't been updated yet
     * @returns true if the move is an En Passant Capture
     */
    isEnPassant(move: Move) {
        if (
            move.from[0] !== move.to[0] &&
            this.getPieceTypeFromSquare(move.from) === PieceType.PAWN
        ) {
            return !this.hasPiece(move.to);
        } else {
            return false;
        }
    }

    /**
     * Takes a move argument and determines if the move results in a capture
     * Assumes that chess hasn't been updated yet
     * @returns true if the move is a Capture
     */
    isCapture(move: Move) {
        return this.hasPiece(move.to);
    }

    /**
     * Takes a move argument and determines if the move is a Queen Side Castle.
     * Assumes that chess hasn't been updated yet
     * @returns true if the move is a Queen Side Castle
     */
    isQueenSideCastling(move: Move) {
        if (this.getPieceTypeFromSquare(move.from) !== PieceType.KING) {
            return false;
        } else if (this.chess.get(move.from).color === Side.WHITE) {
            return move.from === "e1" && move.to === "c1";
        } else {
            return move.from === "e8" && move.to === "c8";
        }
    }

    /**
     * Takes in a Square argument and returns the piece on the square or undefined
     * @returns The current piece on the square as a PieceType enum or undefined if there is no piece
     */
    getPieceTypeFromSquare(square: Square): PieceType | undefined {
        const piece = this.chess.get(square);
        if (piece !== null) {
            return piece.type as PieceType;
        } else {
            return undefined;
        }
    }

    /**
     * Takes in a Square argument and returns the side of the piece on the square or undefined
     * @returns The current side of the piece on the square or undefined if there is no piece on the square
     */
    getPieceSide(square: Square): Side | undefined {
        const piece = this.chess.get(square);
        if (piece !== null) {
            return piece.color as Side;
        } else {
            return undefined;
        }
    }

    /**
     * Takes in a Square argument and returns if the square has a piece on it.
     * @returns true if the square has a piece on it.
     */
    hasPiece(square: Square) {
        return this.getPieceTypeFromSquare(square) !== undefined;
    }

    /**
     * Takes in a Move argument and returns the piece on the square
     * @returns The current piece on the square as a PieceType enum
     */
    getPieceTypeFromMove(move: Move) {
        return this.getPieceTypeFromSquare(move.from) as PieceType;
    }

    /**
     * gets ALL legal moves from the provided square
     * @param square - from square
     * @returns - possible to squares
     */
    getLegalMoves(square?: Square) {
        return this.chess.moves({
            square,
            verbose: true,
        });
    }

    /**
     * returns a square's legal moves as a map
     * @param square - from square
     * @returns - possible to squares
     */
    getLegalSquares(square?: Square): Square[] {
        return this.getLegalMoves(square).map((move) => move.to);
    }

    /**
     * Makes a move on the chessboard.
     * @returns the move that was made.
     */
    makeMove(move: Move): Move {
        this.chess.move(move);
        return move;
    }

    /**
     * Returns true if a move is a promotion, and false otherwise.
     * Assumes that chess hasn't been updated yet
     */
    checkPromotion(from: Square, to: Square): boolean {
        if (this.getPieceTypeFromSquare(from) !== PieceType.PAWN) {
            return false;
        } else if (this.chess.get(from).color === Side.WHITE) {
            return from[1] === "7" && to[1] === "8";
        }
        return from[1] === "2" && to[1] === "1";
    }

    /**
     * makes an ai move based on the selected difficulty
     * @param difficulty - a value from 0 to 4 for the ai
     * @returns - the move made
     */
    makeAiMove(difficulty: Difficulty): Move {
        // result is an object e.g. { "A1": "A2" }
        const result = aiMove(this.fen, difficulty);
        // val is an array e.g. ["A1", "A2"]
        const val = Object.entries(result)[0] as [string, string];
        const from = val[0].toLowerCase() as Square;
        const to = val[1].toLowerCase() as Square;

        if (this.checkPromotion(from, to)) {
            // ai always promotes to queen
            return this.makeMove({
                from,
                to,
                promotion: PieceType.QUEEN,
            });
        }
        return this.makeMove({ from, to });
    }

    /**
     * checks if and how the game has ended
     * @returns - a game finished reason from the enum
     */
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
