import { Robots } from "./robots";
import {
  Command,
  ParallelCommandGroup,
  SequentialCommandGroup,
} from "./command";


/**
 * Encapsulates a grouping of moves.
 * The moves in each group are executed synchronously.
 */
export class MovePiece extends Command {
  constructor(public setupMoves: MoveCommand[] = [], public mainMove: Move) {
    super();
  }

  public async execute(robots: Robots): Promise<any> {
    return new SequentialCommandGroup(
      new ParallelCommandGroup(...this.setupMoves),
      this.mainMove
    ).execute(robots);
  }
}
