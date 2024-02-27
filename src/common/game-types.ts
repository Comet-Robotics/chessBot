import { DEGREE } from "../server/utils/units";

/**
 * Defines a specific piece.
 */
export enum PieceType {
    PAWN = "",
    BISHOP = "B",
    KNIGHT = "N",
    ROOK = "R",
    QUEEN = "Q",
    KING = "K",
}

/**
 * Defines playing with the white or black pieces.
 */
export enum Side {
    WHITE = "w",
    BLACK = "b",
}

export function oppositeSide(side: Side) {
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
}

export function getStartHeading(side: Side) {
    return side === Side.WHITE ? 90 * DEGREE : 270 * DEGREE;
}
