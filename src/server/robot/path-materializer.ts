import { robotManager } from "../api/managers";
import { Move } from "../../common/game-types";
import { gameManager } from "../api/api";
import { Command, SequentialCommandGroup } from "../command/command";
import { DriveCommand, RelativeRotateCommand } from "../command/move-command";
import { MovePiece, ReversibleRobotCommand } from "../command/move-piece";
import { Position } from "./position";
import { GridIndices } from "./grid-indices";
import { Square } from "chess.js";

export interface GridMove {
    from: GridIndices;
    to: GridIndices;
}

function moveToGridMove(move: Move): GridMove {
    return {
        from: GridIndices.squareToGrid(move.from),
        to: GridIndices.squareToGrid(move.to),
    };
}

function calcCollisionType(gridMove: GridMove): number {
    const from = gridMove.from;
    const to = gridMove.to;

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

function detectCollisions(gridMove: GridMove, collisionType: number): string[] {
    const from = gridMove.from;
    const to = gridMove.to;
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
    move: GridMove,
    collisionType: number,
): Position {}

function constructDriveCommand(
    pieceId: string,
    location: Position,
): DriveCommand {
    const robot = robotManager.getRobot(pieceId);
    const offset = location.sub(robot.position);
    const distance = Math.hypot(offset.x, offset.y);
    return new DriveCommand(pieceId, distance);
}

function constructRotateCommand(
    pieceId: string,
    location: Position,
): RelativeRotateCommand {
    const robot = robotManager.getRobot(pieceId);
    const offset = location.sub(robot.position);
    const angle = Math.atan2(-offset.x, offset.y);
    return new RelativeRotateCommand(pieceId, angle);
}

function constructFinalCommand(
    move: GridMove,
    driveCommands: DriveCommand[],
    rotateCommands: RelativeRotateCommand[],
): MovePiece {
    const from = move.from;
    const mainPiece = robotManager.indicesToIds.get(from);
    if (mainPiece !== undefined) {
        const to = move.to;
        const pos = new Position(to.i + 0.5, to.j + 0.5);
        const mainDrive = constructDriveCommand(mainPiece, pos);
        const mainTurn = constructRotateCommand(mainPiece, pos);
        const setupCommands: ReversibleRobotCommand[] = [];
        setupCommands.push(...rotateCommands, mainTurn, ...driveCommands);
        return new MovePiece(setupCommands, mainDrive);
    } else {
        return new MovePiece(rotateCommands, new SequentialCommandGroup([]));
    }
}

// Takes in a move, and generates the commands required to get the main piece to it's destination
// If there are pieces in the way, it shimmy's them out, and move them back after main piece passes
function moveMainPiece(move: GridMove): MovePiece {
    const driveCommands: DriveCommand[] = [];
    const rotateCommands: RelativeRotateCommand[] = [];
    const collisionType = calcCollisionType(move);
    const collisions: string[] = detectCollisions(move, collisionType);
    for (let i = 0; i < collisions.length; i++) {
        const pieceId = collisions[i];
        const location = findShimmyLocation(pieceId, move, collisionType);
        driveCommands.push(constructDriveCommand(pieceId, location));
        rotateCommands.push(constructRotateCommand(pieceId, location));
    }
    return constructFinalCommand(move, driveCommands, rotateCommands);
}

/**
 * Te easiest move to get to the dead zone
 */
//TODO: Change the move to Grid that way we can move off the board.
function moveToDeadZone(origin: Square): GridMove {
    const aboveMove = moveToGridMove({
        from: origin,
        to: (origin[0] + "8") as Square,
    });
    const belowMove = moveToGridMove({
        from: origin,
        to: (origin[0] + "1") as Square,
    });
    const rightMove = moveToGridMove({
        from: origin,
        to: ("h" + origin[1]) as Square,
    });
    const leftMove = moveToGridMove({
        from: origin,
        to: ("a" + origin[1]) as Square,
    });

    const aboveCollision = detectCollisions(
        aboveMove,
        calcCollisionType(aboveMove),
    );
    const belowCollision = detectCollisions(
        belowMove,
        calcCollisionType(belowMove),
    );
    const leftCollision = detectCollisions(
        leftMove,
        calcCollisionType(leftMove),
    );
    const rightCollision = detectCollisions(
        rightMove,
        calcCollisionType(rightMove),
    );

    const collisionTuple: [GridMove, string[]][] = [
        [moveToGridMove({  from: origin, to: (origin[0] + "9") as Square }), aboveCollision],
        [moveToGridMove({ from: origin, to: (origin[0] + "1") as Square }), belowCollision],
        [moveToGridMove({ from: origin, to: ("9" + origin[1]) as Square }), rightCollision],
        [moveToGridMove({ from: origin, to: ("1" + origin[1]) as Square }), leftCollision],
    ];

    collisionTuple.sort((a, b) => a[1].length - b[1].length);
    return collisionTuple[0][0];
}

function directionToEdge(position: GridIndices) {
    let x = 0;
    let y = 0;

    if (position.i >= 6) {
        x = -1;
    } else {
        x = 1;
    }
    if (position.j >= 6) {
        y = -1;
    } else {
        y = 1;
    }
    const DirectionTuple: [number, number][] = [[x, y]];
    return DirectionTuple;
}

//step1 find the path of least resistance to the dead zone
//step2 shimmy pieces out of the way
//step3 move the piece to the dead zone
//step4 shimmy everything back
//step5 calculate the move to the home space
//step6 move the piece to the home space.
function returnToHome(from: Square, id: string): SequentialCommandGroup {
    const capturedPiece: GridIndices = GridIndices.squareToGrid(from);
    const home: GridIndices = robotManager.getRobot(id).homeIndices;
    const fastestMoveToDeadzone = moveToDeadZone(from);
    const toDeadzone = moveMainPiece(moveToGridMove(fastestMoveToDeadzone));

    const goHome: SequentialCommandGroup = new SequentialCommandGroup([
        toDeadzone,
    ]);
    return goHome;
}

// Command structure
// No Capture: Sequential[ Parallel[Turn[all]], MovePiece[shimmys, main], Parallel[TurnToStart[all]] ]

// Home with shimmy: Sequential[ No_Capture[capture piece], Turn[capture piece], Move[capture piece], ... ]
// Home without shimmy: Sequential[ Turn[capture piece], Move[capture piece], ... ]
// Capture: Sequential[ Home with/without shimmy[capture piece], No_Capture[main piece] ]
export function materializePath(move: Move): Command {
    if (gameManager?.chess.isEnPassant(move)) {
        null;
    } else if (gameManager?.chess.isRegularCapture(move)) {
        const capturePiece = gameManager?.chess.getCapturedPieceId(move);
        if (capturePiece !== undefined) {
            const captureCommand = returnToHome(move.to, capturePiece);
            const mainCommand = moveMainPiece(moveToGridMove(move));
            const command = new SequentialCommandGroup([
                captureCommand,
                mainCommand,
            ]);
            return command;
        }
    } else if (gameManager?.chess.isQueenSideCastling(move)) {
        null;
    } else if (gameManager?.chess.isKingSideCastling(move)) {
        null;
    } else {
        return moveMainPiece(moveToGridMove(move));
    }
}

export function debugPath(move: Move) {
    return moveMainPiece(moveToGridMove(move));
}
