import { Square } from "chess.js";
import { Robot } from "../server/robot/robot";
import { DEGREE } from "../server/utils/units";

export enum PieceType {
    PAWN = "p",
    BISHOP = "b",
    KNIGHT = "n",
    ROOK = "r",
    QUEEN = "q",
    KING = "k",
}

export enum Side {
    WHITE = "w",
    BLACK = "b",
}

export function getStartHeading(side: Side) {
    return side == Side.WHITE ? 90 * DEGREE : 270 * DEGREE;
}
export class Piece {
    constructor(
        public readonly side: Side,
        public readonly pieceType: PieceType,
        public readonly robot: Robot,
        public square: Square,
    ) {}
}

export enum GameType {
    COMPUTER = "computer",
    HUMAN = "human",
}
