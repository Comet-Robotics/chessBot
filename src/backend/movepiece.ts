import { Robots } from "./robots";
import {
  Command,
  ParallelCommandGroup,
  ReversibleCommand,
  SequentialCommandGroup,
  reverseCommands,
} from "./command";

export class MovePiece implements Command {
  constructor(
    public setupMoves: ReversibleCommand[],
    public mainMove: Command
  ) {}

  public async execute(robots: Robots): Promise<void> {
    return new SequentialCommandGroup([
      new ParallelCommandGroup(this.setupMoves),
      this.mainMove,
      new ParallelCommandGroup(reverseCommands(this.setupMoves)),
    ]).execute(robots);
  }
}
