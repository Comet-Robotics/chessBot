import { CommandBase, IndividualCommand, ReversibleCommand } from "./command";
import { Robot } from "./robot";
import { RobotManager } from "./robotmanager";

/**
 * Represents a rotation.
 */
export abstract class Rotate extends IndividualCommand {
  constructor(square: string, public heading: number) {
    super(square);
  }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotate extends Rotate implements ReversibleCommand {
  public async executeRobot(robot: Robot): Promise<void> {
    robot.relativeRotate(this.heading);
  }

  public reverse(): ReversibleCommand {
    return new RelativeRotate(this.square, -this.heading);
  }
}

/**
 * Rotates a robot to a given heading.
 */
export class AbsoluteRotate extends Rotate {
  public async executeRobot(robot: Robot): Promise<void> {
    robot.absoluteRotate(this.heading);
  }
}

/**
 * Resets a robot to its starting heading.
 */
export class RotateToStart extends IndividualCommand {
  public async executeRobot(robot: Robot): Promise<void> {
    robot.absoluteRotate(robot.startHeading);
  }
}

/**
 * Represents a robot translation in x and y.
 *
 * Note this may involve the robot turning first.
 * The orientation after the move is unspecified.
 */
export abstract class Move extends IndividualCommand {
  constructor(square: string, public x: number, public y: number) {
    super(square);
  }
}

/**
 * Shifts a robot a relative amount.
 */
export class RelativeMove extends Move implements ReversibleCommand {
  public async executeRobot(robot: Robot): Promise<void> {
    robot.relativeMove(this.x, this.y);
  }

  public reverse(): ReversibleCommand {
    return new RelativeMove(this.square, -this.x, -this.y);
  }
}

/**
 * Moves a robot to a global location.
 */
export class AbsoluteMove extends Move {
  public async executeRobot(robot: Robot): Promise<void> {
    robot.relativeMove(this.x - robot.x, this.y - robot.y);
  }
}
