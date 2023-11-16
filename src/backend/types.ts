import { DEGREE } from "./units";

export enum PieceType {
  PAWN = "",
  BISHOP = "B",
  KNIGHT = "N",
  ROOK = "R",
  QUEEN = "Q",
  KING = "K",
}

export enum Side {
  WHITE,
  BLACK,
}

export function getStartHeading(side: Side) {
  return side == Side.WHITE ? 90 * DEGREE : 270 * DEGREE;
}
