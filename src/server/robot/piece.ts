import { Square } from "chess.js";
import { Robot } from "./robot";
import { PieceType, Side } from "../../common/game-types";

export class Piece {
    constructor(
        public readonly side: Side,
        public readonly pieceType: PieceType,
        public readonly robot: Robot,
        public square: Square,
    ) {}
}
