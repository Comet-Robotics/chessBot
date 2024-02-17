import { Square } from "chess.js";
import { Robot } from "./robot";
import { PieceType, Color } from "../../common/types";

export class Piece {
    constructor(
        public readonly side: Color,
        public readonly pieceType: PieceType,
        public readonly robot: Robot,
        public square: Square,
    ) {}
}
