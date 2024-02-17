import { DEGREE } from "../server/utils/units";

export enum PieceType {
    PAWN = "",
    BISHOP = "B",
    KNIGHT = "N",
    ROOK = "R",
    QUEEN = "Q",
    KING = "K",
}

export enum Side {
    WHITE = "w",
    BLACK = "b",
}

export function getStartHeading(side: Side) {
    return side == Side.WHITE ? 90 * DEGREE : 270 * DEGREE;
}
