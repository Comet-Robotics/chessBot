import { Position } from "../robot/pair";
import { Square } from "chess.js";

const FILE_LOOKUP = "abcdefgh";

export function positionToSquare(position: Position): Square {
    const letter = FILE_LOOKUP[Math.floor(position.x)];
    const number = Math.floor(position.y) + 1;
    return (letter + number) as Square;
}

export function squareToPosition(square: Square): Position {
    const i = FILE_LOOKUP.indexOf(square.charAt(0));
    const j = parseInt(square.charAt(1)) - 1;
    return new Position(i + 0.5, j + 0.5);
}
