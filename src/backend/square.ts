const ABC_LOOKUP = "abcdefgh";

export function xyToSquare(x: number, y: number): string {
  let nearestLetter = ABC_LOOKUP[Math.floor(x)];
  let nearestNumber = Math.floor(y);
  return nearestLetter + nearestNumber;
}

export function squareToIndices(square: string) {
  let x = ABC_LOOKUP.indexOf(square.charAt(0));
  let y = parseInt(square.charAt(1)) - 1;
  return [x, y];
}

export function squareToXyPos(square: string) {
  let xy = squareToIndices(square);
  return [xy[0] + 0.5, xy[1] + 0.5];
}
