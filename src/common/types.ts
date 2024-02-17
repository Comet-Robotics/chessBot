import { DEGREE } from "../server/utils/units";

export enum PieceType {
    PAWN = "",
    BISHOP = "B",
    KNIGHT = "N",
    ROOK = "R",
    QUEEN = "Q",
    KING = "K",
}

export enum Color {
    WHITE,
    BLACK,
}

export function getStartHeading(side: Color) {
    return side == Color.WHITE ? 90 * DEGREE : 270 * DEGREE;
}
