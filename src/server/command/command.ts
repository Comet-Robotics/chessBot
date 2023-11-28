import { Robot } from "../robot/robot";

/**
 * An command which operates on one or more robots.
 */
export interface Command {
  /**
   * The set of objects that this command requires to execute. Used to place mutexes on
   * common resources to ensure they don't receive multiple inputs at once.
   */
  requirements: Set<Object>;

  /**
   * Executes the command.
   */
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
  protected _requirements: Set<Object> = new Set();

  public abstract execute(): Promise<void>;

  public then(next: Command): SequentialCommandGroup {
    return new SequentialCommandGroup([this, next]);
  }

  public get requirements(): Set<Object> {
    return this._requirements;
  }

  /**
   * A utility method for adding multiple requirements at once.
   */
  protected addRequirements(reqs: Object[]) {
    reqs.forEach((req) => this._requirements.add(req));
  }
}

/**
 * A command which operates on an individual Robot.
 * Note this class redirects the execute implementation to executeRobot.
 */
export abstract class RobotCommand extends CommandBase {
  constructor(public readonly robot: Robot) {
    super();
    this.addRequirements([robot]);
  }
}

/**
 * A type of command which groups other commands and runs them together.
 */
export abstract class CommandGroup extends CommandBase {
  constructor(public readonly commands: Command[]) {
    super();
    this.addRequirements(commands.map((c) => [...c.requirements]).flat());
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
