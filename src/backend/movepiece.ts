import { RobotManager } from "./robotmanager";
import {
  Command,
  CommandBase,
  RobotCommand,
  ParallelCommandGroup,
  SequentialCommandGroup,
  Reversible,
} from "./command";
import { RotateToStart } from "./move";

type ReversibleRobotCommand = RobotCommand & Reversible<ReversibleRobotCommand>;

/**
 * Executes a set of setupMoves in parallel, followed by a mainMove.
 * The setupMoves are automatically undone afterwards.
 */
export class MovePiece extends CommandBase {
  constructor(
    public setupMoves: ReversibleRobotCommand[],
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
