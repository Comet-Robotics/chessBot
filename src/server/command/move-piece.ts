import {
    Command,
    RobotCommand,
    ParallelCommandGroup,
    SequentialCommandGroup,
    Reversible,
} from "./command";
import { RotateToStartCommand } from "./move-command";

type ReversibleRobotCommand = RobotCommand & Reversible<ReversibleRobotCommand>;

/**
 * Executes a set of setupMoves in parallel, followed by a mainMove.
 * The setupMoves are automatically undone afterwards.
 */
export class MovePiece extends SequentialCommandGroup {
    constructor(
        public setupMoves: ReversibleRobotCommand[],
        public mainMove: Command,
    ) {
        super([
            new ParallelCommandGroup(setupMoves),
            mainMove,
            new ParallelCommandGroup(
                setupMoves.map((command) =>
                    command
                        .reverse()
                        .then(new RotateToStartCommand(command.robotId)),
                ),
            ),
        ]);
    }
}
