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
 * Rotates a robot to a given heading. Implements Reversible through a
 * heading supplier to return to the previous heading.
 */
export class ReversibleAbsoluteRotateCommand
    extends RobotCommand
    implements Reversible<ReversibleAbsoluteRotateCommand>
{
    private previousHeading: number | undefined;

    constructor(
        robotId: string,
        protected headingSupplier: () => number,
    ) {
        super(robotId);
    }

    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        this.previousHeading = robot.heading;
        return robot.absoluteRotate(this.headingSupplier());
    }

    public reverse(): ReversibleAbsoluteRotateCommand {
        return new ReversibleAbsoluteRotateCommand(
            this.robotId,
            (() => this.previousHeading!).bind(this),
        );
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
 * Moves a robot to a global location. WARNING: Only moves in a straight line
 */
export class AbsoluteMoveCommand extends MoveCommand {
    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        return robot.relativeMove(this.position.sub(robot.position));
    }
}

/**
 * Moves a robot to a global location. Implements Reversible through a
 * position supplier to return to the previous position.
 */
export class ReversibleAbsoluteMoveCommand
    extends RobotCommand
    implements Reversible<ReversibleAbsoluteMoveCommand>
{
    private previousPosition: Position | undefined;

    constructor(
        robotId: string,
        protected positionSupplier: () => Position,
    ) {
        super(robotId);
    }

    public async execute(): Promise<void> {
        const robot = robotManager.getRobot(this.robotId);
        this.previousPosition = robot.position;
        return robot.relativeMove(this.positionSupplier().sub(robot.position));
    }

    public reverse(): ReversibleAbsoluteMoveCommand {
        return new ReversibleAbsoluteMoveCommand(
            this.robotId,
            (() => this.previousPosition!).bind(this),
        );
    }
}
