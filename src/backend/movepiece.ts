import { RobotManager } from "./robotmanager";
import {
  Command,
  CommandBase,
  IndividualCommand,
  ParallelCommandGroup,
  ReversibleCommand,
  SequentialCommandGroup,
  reverseCommands,
} from "./command";
import { Move, RelativeMove, RelativeRotate, RotateToStart } from "./move";

/**
 * Executes a set of setupMoves in parallel, followed by a mainMove.
 * The setupMoves are automatically undone afterwards.
 */
export class MovePiece extends CommandBase {
  constructor(
    public setupMoves: (ReversibleCommand & IndividualCommand)[],
    public mainMove: Command
  ) {
    super();
  }

  public async execute(manager: RobotManager): Promise<void> {
    return new SequentialCommandGroup([
      new ParallelCommandGroup(this.setupMoves),
      this.mainMove,
      new ParallelCommandGroup(
        this.setupMoves.map((command) =>
          command.reverse().then(new RotateToStart(command.square))
        )
      ),
    ]).execute(manager);
  }
}
