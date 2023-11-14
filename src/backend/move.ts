import { CommandBase, ReversibleCommand } from "./command";
import { Robots } from "./robots";

export abstract class Rotate extends CommandBase {
  constructor(public square: string, public heading: number) {
    super();
  }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotate extends Rotate implements ReversibleCommand {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeRotate(this.heading);
  }

  public reverse(): ReversibleCommand {
    return new RelativeRotate(this.square, -this.heading);
  }
}

/**
 * Rotates a robot an absolute amount.
 */
export class AbsoluteRotate extends Rotate {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.absoluteRotate(this.heading);
  }
}

export class RotateToStart extends CommandBase {
  constructor(public square: string) {
    super();
  }

  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.absoluteRotate(robot.startHeading);
  }
}

export abstract class Move extends CommandBase {
  constructor(public square: string, public x: number, public y: number) {
    super();
  }
}

/**
 * Moves a robot a relative amount.
 */
export class RelativeMove extends Move implements ReversibleCommand {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeMove(this.x, this.y);
  }

  public reverse(): ReversibleCommand {
    return new RelativeMove(this.square, -this.x, -this.y);
  }
}

/**
 * Moves a robot an absolute amount.
 */
export class AbsoluteMove extends Move {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeMove(this.x - robot.x, this.y - robot.y);
  }
}
