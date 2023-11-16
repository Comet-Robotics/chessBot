abstract class Pair<T extends Pair<T>> {
  constructor(protected item1: number, protected item2: number) {}

  abstract create(item1: number, item2: number): T;

  toTuple(): [number, number] {
    return [this.item1, this.item2];
  }

  neg(): T {
    return this.create(-this.item1, -this.item2);
  }

  add(other: T): T {
    return this.create(this.item1 + other.item1, this.item2 + other.item2);
  }

  sub(other: T): T {
    return this.create(this.item1 - other.item1, this.item2 - other.item2);
  }

  mul(other: T): T {
    return this.create(this.item1 * other.item1, this.item2 * other.item2);
  }

  div(other: T): T {
    return this.create(this.item1 / other.item1, this.item2 / other.item2);
  }
}

export class Position extends Pair<Position> {
  constructor(public readonly x: number, public readonly y: number) {
    super(x, y);
  }

  create(x: number, y: number): Position {
    return new Position(x, y);
  }
}

export class Indices extends Pair<Indices> {
  constructor(public readonly i: number, public readonly j: number) {
    super(i, j);
  }

  create(i: number, j: number): Indices {
    return new Indices(i, j);
  }
}

export const ZERO_POSITION = new Position(0, 0);
export const ZERO_INDICES = new Indices(0, 0);
