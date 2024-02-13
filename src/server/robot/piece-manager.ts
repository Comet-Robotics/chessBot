import { Command } from "../command/command";
import { Piece } from "./piece";
import { Square } from "../utils/square";

/**
 * Stores the pieces used in the game of chess.
 */
export class PieceManager {
    constructor(public pieces: Piece[]) {}

    /**
     * Retrieves the robot on the given square.
     * Throws if the robot does not exist.
     */
    public getPiece(square: Square): Piece {
        const piece = this.pieces.find((piece) => square === piece.square);
        if (!piece) {
            throw new Error("Expected piece on square " + square);
        }
        return piece;
    }
}
