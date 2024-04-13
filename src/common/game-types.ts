import { Square } from "chess.js";
import { Robot } from "../server/robot/robot";
import { DEGREE } from "../server/utils/units";

/**
 * Defines a specific piece.
 * Values are defined to be consistent with the chess.js library.
 */
export enum PieceType {
    PAWN = "p",
    BISHOP = "b",
    KNIGHT = "n",
    ROOK = "r",
    QUEEN = "q",
    KING = "k",
}

/**
 * Defines playing with the white or black pieces.
 * Values are defined to be consistent with the chess.js library.
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
export class Piece {
    constructor(
        public readonly side: Side,
        public readonly pieceType: PieceType,
        public readonly robot: Robot,
        public square: Square,
    ) {}
}

export interface Move {
    from: Square;
    to: Square;
    promotion?: PieceType;
}
