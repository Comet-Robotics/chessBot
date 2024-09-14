import { robotManager } from "../api/managers";
import { Move } from "../../common/game-types";
import { gameManager } from "../api/api";
import {
    Command,
    ParallelCommandGroup,
    SequentialCommandGroup,
} from "../command/command";
import {
    AbsoluteMoveCommand,
    RelativeRotateCommand,
} from "../command/move-command";
import { MovePiece } from "../command/move-piece";
import { Position } from "./position";
import { GridIndices } from "./grid-indices";
import { Square } from "chess.js";

function calcCollisionType(move: Move): number {
    const from: GridIndices = GridIndices.squareToGrid(move.from);
    const to: GridIndices = GridIndices.squareToGrid(move.to);

    // Horizontal
    if (from.i === to.i) {
        return 0;
        // Vertical
    } else if (from.j === to.j) {
        return 1;
    } else {
        // Diagonal
        if (Math.abs(from.i - to.i) === Math.abs(from.j - to.j)) {
            return 2;
            // Horse
        } else {
            return 3;
        }
    }
}

function detectCollisions(move: Move, collisionType: number): string[] {
    const from: GridIndices = GridIndices.squareToGrid(move.from);
    const to: GridIndices = GridIndices.squareToGrid(move.from);
    const collisions: string[] = [];
    switch (collisionType) {
        // Horizontal
        case 0: {
            if (to.i < from.i) {
                for (let i = from.i; i > to.i; i--) {
                    const square = new GridIndices(i, from.j);
                    const piece = robotManager.indicesToIds.get(square);
                    if (piece !== undefined) {
                        collisions.push(piece);
                    }
                }
            } else {
                for (let i = from.i; i < to.i; i++) {
                    const square = new GridIndices(i, from.j);
                    const piece = robotManager.indicesToIds.get(square);
                    if (piece !== undefined) {
                        collisions.push(piece);
                    }
                }
            }
            break;
        }
        // Vertical
        case 1: {
            if (to.j < from.j) {
                for (let j = from.j; j > to.j; j--) {
                    const square = new GridIndices(from.i, j);
                    const piece = robotManager.indicesToIds.get(square);
                    if (piece !== undefined) {
                        collisions.push(piece);
                    }
                }
            } else {
                for (let j = from.j; j < to.j; j++) {
                    const square = new GridIndices(from.i, j);
                    const piece = robotManager.indicesToIds.get(square);
                    if (piece !== undefined) {
                        collisions.push(piece);
                    }
                }
            }
            break;
        }
        // Diagonal
        case 2: {
            // Will be either positive or negative depending on direction
            const dx = to.i - from.i;
            const dy = to.j - from.j;
            // For diagonal, x and y offset by the same amount (not including signs)
            // thus, absolute value of either will be the same
            const distance = Math.abs(dx);
            // Normalized to 1 or -1 to get direction (dividing by absolute value of self)
            const nx = dx / distance;
            const ny = dy / distance;

            // Loop through the tiles along the diagonal excluding beginning and end
            // (Beginning is the moving piece, and end is capture piece. Capture handled separately)
            for (let off = 1; off < distance; off++) {
                // Finds the current coords of the diagonal tile that the loop is on
                const midx = from.i + off * nx;
                const midy = from.j + off * ny;

                // Above or below the tile, depends on direction
                const square1 = new GridIndices(midx, midy + ny);
                const piece1 = robotManager.indicesToIds.get(square1);
                if (piece1 !== undefined) {
                    collisions.push(piece1);
                }
                // Left or right of tile, depends on direction
                const square2 = new GridIndices(midx + nx, midy);
                const piece2 = robotManager.indicesToIds.get(square2);
                if (piece2 !== undefined) {
                    collisions.push(piece2);
                }
            }
            break;
        }
        // Horse
        case 3: {
            // Will be either positive or negative depending on direction
            const dx = to.i - from.i;
            const dy = to.j - from.j;
            // Normalized to 1 or -1 (can also be directly used to get first piece)
            const nx = dx / Math.abs(dx);
            const ny = dy / Math.abs(dy);
            // Shifted to get second piece, shift direction based on sign
            const sx = dx - nx;
            const sy = dy - ny;

            // Same sign horse moves share this square. Will always be 1 diagonal
            // of moving piece
            const square1 = new GridIndices(from.i + nx, from.j + ny);
            const piece1 = robotManager.indicesToIds.get(square1);
            if (piece1 !== undefined) {
                collisions.push(piece1);
            }
            // Same initial direction horse moves share this square. Will be directly
            // adjacent to moving piece.
            const square2 = new GridIndices(from.i + sx, from.j + sy);
            const piece2 = robotManager.indicesToIds.get(square2);
            if (piece2 !== undefined) {
                collisions.push(piece2);
            }
            break;
        }
    }
    return collisions;
}

function findShimmyLocation(
    pieceId: string,
    move: Move,
    collisionType: number,
): Position {}

function constructMoveCommand(
    pieceId: string,
    location: Position,
): AbsoluteMoveCommand {
    return new AbsoluteMoveCommand(pieceId, location);
}

function constructRotateCommand(
    pieceId: string,
    location: Position,
): RelativeRotateCommand {
    const robot = robotManager.getRobot(pieceId);
    const x = location.x - robot.position.x;
    const y = location.y - robot.position.y;
    const angle = Math.atan2(x, y);
    return new RelativeRotateCommand(pieceId, angle);
}

function constructFinalCommand(
    move: Move,
    moveCommands: AbsoluteMoveCommand[],
    rotateCommands: RelativeRotateCommand[],
): MovePiece {}

// Takes in a move, and generates the commands required to get the main piece to it's destination
// If there are pieces in the way, it shimmy's them out, and move them back after main piece passes
function moveMainPiece(move: Move): MovePiece {
    const moveCommands: AbsoluteMoveCommand[] = [];
    const rotateCommands: RelativeRotateCommand[] = [];
    const collisionType = calcCollisionType(move);
    const collisions: string[] = detectCollisions(move, collisionType);
    for (let i = 0; i < collisions.length; i++) {
        const pieceId = collisions[i];
        const location = findShimmyLocation(pieceId, move, collisionType);
        moveCommands.push(constructMoveCommand(pieceId, location));
        rotateCommands.push(constructRotateCommand(pieceId, location));
    }
    return constructFinalCommand(move, moveCommands, rotateCommands);
}

function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

//step1 find the empty row out
function returnToHome(from: Square, id: string): SequentialCommandGroup {
    let flagAbove = false;
    let flagBelow = false;
    let flagRight = false;
    let flagLeft = false;
    let flagPassedMiddle = false;

    const capturedPiece: GridIndices = GridIndices.squareToGrid(from);
    const home: GridIndices = robotManager.getRobot(id).homeIndices;

    for (let y = 2; y < 11; y++) {
        const checkedSquare: GridIndices = new GridIndices(capturedPiece.i, y);

        flagPassedMiddle =
            checkedSquare === capturedPiece ? true : flagPassedMiddle;
        const hasPiece =
            robotManager.indicesToIds.get(checkedSquare) !== undefined;

        flagAbove = !flagAbove ? true : hasPiece && !flagPassedMiddle;
        flagBelow = !flagBelow ? true : hasPiece && flagPassedMiddle;
    }

    flagPassedMiddle = false;

    for (let x = 2; x < 11; x++) {
        const checkedSquare: GridIndices = new GridIndices(x, capturedPiece.j);

        flagPassedMiddle =
            checkedSquare === capturedPiece ? true : flagPassedMiddle;
        const hasPiece =
            robotManager.indicesToIds.get(checkedSquare) !== undefined;

        flagLeft = !flagLeft ? true : hasPiece && !flagPassedMiddle;
        flagRight = !flagRight ? true : hasPiece && flagPassedMiddle;
    }

    if (flagAbove && flagBelow && flagRight && flagLeft) {
        //need to shimmy
    } else {
        //find shortest path to home
        //straight line to the padding, calc the shortest way
        let first = true;
        let shortestDistance = 0;
        let direction = 0;

        if (!flagAbove) {
            if (first) {
                shortestDistance = getDistance(
                    capturedPiece.i,
                    1,
                    home.i,
                    home.j,
                );
                first = false;
                direction = 1;
            } else {
                let d = getDistance(capturedPiece.i, 1, home.i, home.j);
                if (d < shortestDistance) {
                    shortestDistance = d;
                    direction = 1;
                }
            }
        }
        if (!flagBelow) {
            if (first) {
                shortestDistance = getDistance(
                    capturedPiece.i,
                    10,
                    home.i,
                    home.j,
                );
                first = false;
                direction = 2;
            } else {
                let d = getDistance(capturedPiece.i, 10, home.i, home.j);
                if (d < shortestDistance) {
                    shortestDistance = d;
                    direction = 2;
                }
            }
        }
        if (!flagLeft) {
            if (first) {
                shortestDistance = getDistance(
                    1,
                    capturedPiece.j,
                    home.i,
                    home.j,
                );
                first = false;
                direction = 3;
            } else {
                let d = getDistance(1, capturedPiece.j, home.i, home.j);
                if (d < shortestDistance) {
                    shortestDistance = d;
                    direction = 3;
                }
            }
        }
        if (!flagRight) {
            if (first) {
                shortestDistance = getDistance(
                    11,
                    capturedPiece.j,
                    home.i,
                    home.j,
                );
                first = false;
                direction = 4;
            } else {
                let d = getDistance(11, capturedPiece.j, home.i, home.j);
                if (d < shortestDistance) {
                    shortestDistance = d;
                    direction = 4;
                }
            }
        }
    }

    const goHome: SequentialCommandGroup = new SequentialCommandGroup([]);
    return goHome;
}

// Command structure
// No Capture: Sequential[ Parallel[Turn[all]], MovePiece[shimmys, main], Parallel[TurnToStart[all]] ]

// Home with shimmy: Sequential[ No_Capture[capture piece], Turn[capture piece], Move[capture piece], ... ]
// Home without shimmy: Sequential[ Turn[capture piece], Move[capture piece], ... ]
// Capture: Sequential[ Home with/without shimmy[capture piece], No_Capture[main piece] ]
export function materializePath(move: Move): Command {
    if (gameManager?.chess.isEnPassant(move)) {
    } else if (gameManager?.chess.isRegularCapture(move)) {
        const capturePiece = gameManager?.chess.getCapturedPieceId(move);
        if (capturePiece !== undefined) {
            const captureCommand = returnToHome(move.to, capturePiece);
            const mainCommand = moveMainPiece(move);
            const command = new SequentialCommandGroup([
                captureCommand,
                mainCommand,
            ]);
            return command;
        }
    } else if (gameManager?.chess.isQueenSideCastling(move)) {
    } else if (gameManager?.chess.isKingSideCastling(move)) {
    } else {
        return moveMainPiece(move);
    }
}
