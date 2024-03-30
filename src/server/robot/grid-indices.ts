import { Pair } from "../utils/pair";

/**
 * Defines a position on the 12x12 grid robots are allowed to be in.
 */
export class GridIndices extends Pair<GridIndices> {
    constructor(
        public readonly i: number,
        public readonly j: number,
    ) {
        super(i, j);
    }

    create(i: number, j: number): GridIndices {
        if (i < 0 || i > 12) {
            throw new Error("Index " + i + " is out of bounds.");
        }
        if (j < 0 || j > 11) {
            throw new Error("Index " + j + " is out of bounds.");
        }
        return new GridIndices(i, j);
    }

    toString(): string {
        return `${this.i}, ${this.j}`;
    }
}

export const ZERO_INDICES = new GridIndices(0, 0);
// export const MAX_INDICES = new GridIndices(11, 11);
