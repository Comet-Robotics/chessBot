import { Pair } from "../utils/pair";

/**
 * Defines a position on the 12x12 grid robots are allowed to be in. 
 * Note that a standard chess board is an 8x8 grid. For the physical representation of a robot's location on the grid, we add an additional 2 'rings' of squares around the chess board, creating a 12x12 grid. 
 * These additional rings are used to store robots in a location off the chess board when captured, or for intermediary moves where robots need to be temporarily moved off the board to create a path for other robots to move. 
 */
export class GridIndices extends Pair<GridIndices> {
    constructor(
        public readonly i: number,
        public readonly j: number,
    ) {
        if (i < 0 || i > 11) {
            throw new Error("Index " + i + " is out of bounds.");
        }
        if (j < 0 || j > 11) {
            throw new Error("Index " + j + " is out of bounds.");
        }
        super(i, j);
    }

    protected create(i: number, j: number): GridIndices {
        return new GridIndices(i, j);
    }

    toString(): string {
        return `${this.i}, ${this.j}`;
    }
}

export const ZERO_INDICES = new GridIndices(0, 0);
// export const MAX_INDICES = new GridIndices(11, 11);
