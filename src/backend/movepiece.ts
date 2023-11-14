import { RobotManager } from "./robotmanager";
import {
  Command,
  CommandBase,
  ParallelCommandGroup,
  ReversibleCommand,
  SequentialCommandGroup,
  reverseCommands,
} from "./command";

/**
 * Executes a set of setupMoves in parallel, followed by a mainMove.
 * The setupMoves are automatically undone afterwards.
 */
export class MovePiece extends CommandBase {
  constructor(
    public setupMoves: ReversibleCommand[],
    public mainMove: Command
  ) {
    super();
  }

  public async execute(manager: RobotManager): Promise<void> {
    return new SequentialCommandGroup(
      new ParallelCommandGroup(...this.setupMoves),
      this.mainMove,
      new ParallelCommandGroup(...reverseCommands(this.setupMoves)),
    ).execute(manager);
  }
}
