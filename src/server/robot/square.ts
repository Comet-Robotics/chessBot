import { Position, Indices } from "./pair";

export class Square {
  static readonly FILE_LOOKUP = "abcdefgh";
  constructor(public readonly indices: Indices) {}

  static make(i: number, j: number): Square {
    return new Square(new Indices(i, j));
  }

  static fromString(square: string): Square {
    const i = Square.FILE_LOOKUP.indexOf(square.charAt(0));
    const j = parseInt(square.charAt(1)) - 1;
    return Square.make(i, j);
  }

  static fromPosition(position: Position) {
    return Square.make(Math.floor(position.x), Math.floor(position.y));
  }

  toString(): string {
    let letter = Square.FILE_LOOKUP[this.indices.i];
    let number = this.indices.j;
    return letter + number;
  }

  toPosition(): Position {
    return new Position(this.indices.i + 0.5, this.indices.j + 0.5);
  }
}
