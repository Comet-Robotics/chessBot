import { RobotCommand, Reversible } from "./command";
import { Position } from "./pair";
import { Robot } from "./robot";

/**
 * Represents a rotation.
 */
export abstract class Rotate extends RobotCommand {
  constructor(robot: Robot, public heading: number) {
    super(robot);
  }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotate
  extends Rotate
  implements Reversible<RelativeRotate>
{
  public async execute(): Promise<void> {
    this.robot.relativeRotate(this.heading);
  }

  public reverse(): RelativeRotate {
    return new RelativeRotate(this.robot, -this.heading);
  }
}

/**
 * Rotates a robot to a given heading.
 */
export class AbsoluteRotate extends Rotate {
  public async execute(): Promise<void> {
    this.robot.absoluteRotate(this.heading);
  }
}

/**
 * Resets a robot to its starting heading.
 */
export class RotateToStart extends RobotCommand {
  public async execute(): Promise<void> {
    this.robot.absoluteRotate(this.robot.startHeading);
  }
}

/**
 * Represents a robot translation in x and y.
 *
 * Note this may involve the robot turning first.
 * The orientation after the move is unspecified.
 */
export abstract class Move extends RobotCommand {
  constructor(robot: Robot, protected position: Position) {
    super(robot);
  }
}

/**
 * Shifts a robot a relative amount.
 * The heading of the robot after the move is arbitrary.
 */
export class RelativeMove extends Move implements Reversible<RelativeMove> {
  public async execute(): Promise<void> {
    this.robot.relativeMove(this.position);
  }

  public reverse(): RelativeMove {
    return new RelativeMove(this.robot, this.position.neg());
  }
}

/**
 * Moves a robot to a global location.
 */
export class AbsoluteMove extends Move {
  public async execute(): Promise<void> {
    this.robot.relativeMove(this.position.sub(this.robot._position));
  }
}
