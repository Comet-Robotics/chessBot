import { Command } from "./command";
import { Robot } from "./robot";

/**
 * Represents the positions of one or more pieces on an 8x8 chess board.
 */
export class RobotManager {
  /**
   * @param robots A dict mapping squares to robots.
   */
  constructor(public robots: Record<string, Robot>) {}

  /**
   * Retrieves the robot on the given square.
   * Throws if the robot does not exist.
   */
  public getRobot(square: string): Robot {
    const robot = this.robots[square];
    if (!robot) {
      throw new Error("Expected robot on square " + square);
    }
    return robot;
  }

  public async executeCommand(command: Command): Promise<void> {
    command.execute(this);
  }
}
