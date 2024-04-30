import { Move } from "../../common/game-types";
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

function detectCollisions(move: Move): string[] {}

function findShimmyLocation(pieceId: string, move: Move): Position {}

function constructMoveCommand(
    pieceId: string,
    location: Position,
): AbsoluteMoveCommand {}

function constructRotateCommand(
    pieceId: string,
    location: Position,
): RelativeRotateCommand {}

function constructFinalCommand(
    move: Move,
    moveCommands: AbsoluteMoveCommand[],
    rotateCommands: RelativeRotateCommand[],
): MovePiece {}

function generateCommands(move: Move) {
    const moveCommands: AbsoluteMoveCommand[] = [];
    const rotateCommands: RelativeRotateCommand[] = [];
    const collisions: string[] = detectCollisions(move);
    for (let i = 0; i < collisions.length; i++) {
        const pieceId = collisions[i];
        const location: Position = findShimmyLocation(pieceId, move);
        moveCommands.push(constructMoveCommand(pieceId, location));
        rotateCommands.push(constructRotateCommand(pieceId, location));
    }
    return constructFinalCommand(move, moveCommands, rotateCommands);
}

function returnToHome(): Move {
    const captureFrom: Square = ;
    const captureTo: Square = ;
    //val[0].toLowerCase() as Square;
    return { from: captureFrom, to: captureTo };
}


// Command structure
// No Capture: Sequential[ Parallel[turn], MovePiece[shimmys, main], Parallel[turn to start] ]
// Capture: Sequential[ No_Capture[capture piece], No_Capture[main piece] ]
export function materializePath(move: Move): Command {
    const to: GridIndices = GridIndices.squareToGrid(move.to);
    // Change to use chess engine instead
    if (RobotManager.isRobotAtIndices(to)) {
        let captureCommand: MovePiece;
        let mainCommand: MovePiece;
        const capturePiece = RobotManager.indicesToIds.get(to);
        captureCommand = generateCommands(move);
        mainCommand = generateCommands(move);
        const command: SequentialCommandGroup = new SequentialCommandGroup([captureCommand, mainCommand]);
        return command;
    } else {
        let command: MovePiece;
        command = generateCommands(move);
        return command;
    }
}
