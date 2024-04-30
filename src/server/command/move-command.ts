import { RobotCommand, Reversible } from "./command";
import { Position } from "../robot/position";
import { robotManager } from "../api/managers";

/**
 * Represents a rotation.
 */
export abstract class RotateCommand extends RobotCommand {
    constructor(
        robotId: string,
        public heading: number,
    ) {
        super(robotId);
    }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotateCommand
    extends RotateCommand
    implements Reversible<RelativeRotateCommand>
{
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.relativeRotate(this.heading);
    }

    public reverse(): RelativeRotateCommand {
        return new RelativeRotateCommand(this.robotId, -this.heading);
    }
}

/**
 * Rotates a robot to a given heading.
 */
export class AbsoluteRotateCommand extends RotateCommand {
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.absoluteRotate(this.heading);
    }
}

/**
 * Resets a robot to its starting heading.
 */
export class RotateToStartCommand extends RobotCommand {
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.absoluteRotate(robot.startHeading);
    }
}

/**
 * Represents a robot translation in x and y.
 *
 * Note this may involve the robot turning first.
 * The orientation after the move is unspecified.
 */
export abstract class MoveCommand extends RobotCommand {
    constructor(
        robotId: string,
        protected position: Position,
    ) {
        super(robotId);
    }
}

/**
 * Shifts a robot a relative amount.
 * The heading of the robot after the move is arbitrary.
 */
export class RelativeMoveCommand
    extends MoveCommand
    implements Reversible<RelativeMoveCommand>
{
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.relativeMove(this.position);
    }

    public reverse(): RelativeMoveCommand {
        return new RelativeMoveCommand(this.robotId, this.position.neg());
    }
}

/**
 * Moves a robot to a global location.
 */
export class AbsoluteMoveCommand extends MoveCommand {
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.relativeMove(this.position.sub(robot.position));
    }
}
