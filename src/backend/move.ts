import { CommandBase, ReversibleCommand } from "./command";
import { RobotManager } from "./robotmanager";

/**
 * Represents a rotation.
 */
export abstract class Rotate extends CommandBase {
  constructor(public square: string, public heading: number) {
    super();
  }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotate extends Rotate implements ReversibleCommand {
  public async execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
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
  public async execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
    robot.absoluteRotate(this.heading);
  }
}

/**
 * Resets a robot to its starting heading.
 */
export class RotateToStart extends CommandBase {
  constructor(public square: string) {
    super();
  }

  public async execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
    robot.absoluteRotate(robot.startHeading);
  }
}

/**
 * Represents a robot translation in x and y.
 *
 * Note this may involve the robot turning first.
 * The orientation after the move is unspecified.
 */
export abstract class Move extends CommandBase {
  constructor(public square: string, public x: number, public y: number) {
    super();
  }
}

/**
 * Shifts a robot a relative amount.
 */
export class RelativeMove extends Move implements ReversibleCommand {
  public async execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
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
  public async execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
    robot.relativeMove(this.x - robot.x, this.y - robot.y);
  }
}
