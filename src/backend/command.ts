import { Robots } from "./robots";

/**
 * An command which operates on one or more robots.
 */
export abstract class Command {
  public abstract execute(robots: Robots): Promise<void>;
}

export abstract class ReversibleCommand extends Command {
  public abstract executeReverse(robots: Robots): Promise<void>;
}

export abstract class CommandGroup extends Command {
  public commands: Command[];
  constructor(...commands: Command[]) {
    super();
    this.commands = commands;
  }
}

/**
 * Executes one or more commands in parallel.
 */
export class ParallelCommandGroup extends CommandGroup {
  public async execute(robots: Robots): Promise<void> {
    const promises = this.commands.map((move) => move.execute(robots));
    return Promise.all(promises).then(null);
  }
}

/**
 * Executes one or more commands in sequence, one after another.
 */
export class SequentialCommandGroup extends CommandGroup {
  public async execute(robots: Robots): Promise<void> {
    let promise = Promise.resolve();
    for (const command of this.commands) {
      promise = promise.then(() => command.execute(robots));
    }
    return promise;
  }
}

export abstract class Rotate extends ReversibleCommand {
  constructor(public square: string, public heading: number) {
    super();
  }
}

/**
 * Rotates a robot a relative amount.
 */
export class RelativeRotate extends Rotate {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeRotate(this.heading);
  }

  public async executeReverse(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeRotate(-this.heading);
  }
}

/**
 * Rotates a robot an absolute amount.
 */
export class AbsoluteRotate extends Rotate {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    // TODO: Handle 0 and stuff and rotate the shortest way
    robot.relativeRotate(this.heading - robot.heading);
  }

  public async executeReverse(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeRotate(this.heading + robot.heading);
  }
}

export abstract class Move extends Command {
  constructor(
    public square: string,
    public x: number,
    public y: number,
    public reorient = false
  ) {
    super();
  }
}

/**
 * Moves a robot a relative amount.
 */
export class RelativeMove extends Move {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeMove(this.x, this.y, this.reorient);
  }
}

/**
 * Moves a robot an absolute amount.
 */
export class AbsoluteMove extends Move {
  public async execute(robots: Robots): Promise<void> {
    const robot = robots.getRobot(this.square);
    robot.relativeMove(this.x - robot.x, this.y - robot.y, this.reorient);
  }
}
