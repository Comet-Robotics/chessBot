import { Pair } from "../utils/pair";

export class Position extends Pair<Position> {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) {
        super(x, y);
    }

    protected create(x: number, y: number): Position {
        return new Position(x, y);
    }
}

export const ZERO_POSITION = new Position(0, 0);
