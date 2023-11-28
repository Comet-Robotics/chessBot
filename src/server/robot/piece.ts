import { Robot } from "./robot";
import { Square } from "./square";
import { PieceType, Side } from "./types";

export class Piece {
  constructor(
    public readonly side: Side,
    public readonly pieceType: PieceType,
    public readonly robot: Robot,
    public square: Square
  ) {}
}
