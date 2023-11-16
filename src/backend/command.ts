import { Robot } from "./robot";

/**
 * An command which operates on one or more robots.
 */
export interface Command {
  execute(): Promise<void>;

  /**
   * Implicitly wraps a Command into a Sequential Command.
   * @param next: The command which is run next.
   */
  then(next: Command): SequentialCommandGroup;
}

/**
 * An interface for a command which can be reversed (undone).
 */
export interface Reversible<T extends Reversible<T>> {
  reverse(): T;
}

/**
 * A command base class.
 * Used to circumvent TypeScript abstract/interface weirdness by providing a version of Command
 * which can be extended with attributes and constructors.
 */
export abstract class CommandBase implements Command {
  public abstract execute(): Promise<void>;

  public then(next: Command): SequentialCommandGroup {
    return new SequentialCommandGroup([this, next]);
  }
}

/**
 * A command which operates on an individual Robot.
 * Note this class redirects the execute implementation to executeRobot.
 */
export abstract class RobotCommand extends CommandBase {
  constructor(public readonly robot: Robot) {
    super();
  }
}

/**
 * A type of command which groups other commands and runs them together.
 */
export abstract class CommandGroup extends CommandBase {
  constructor(public readonly commands: Command[]) {
    super();
  }
}

/**
 * Executes one or more commands in parallel.
 */
export class ParallelCommandGroup extends CommandGroup {
  public async execute(): Promise<void> {
    const promises = this.commands.map((move) => move.execute());
    return Promise.all(promises).then(null);
  }
}

/**
 * Executes one or more commands in sequence, one after another.
 */
export class SequentialCommandGroup extends CommandGroup {
  public async execute(): Promise<void> {
    let promise = Promise.resolve();
    for (const command of this.commands) {
      promise = promise.then(() => command.execute());
    }
    return promise;
  }
}
