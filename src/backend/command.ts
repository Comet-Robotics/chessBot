import { Robot } from "./robot";
import { RobotManager } from "./robotmanager";

/**
 * An command which operates on one or more robots.
 */
export interface Command {
  execute(manager: RobotManager): Promise<void>;

  /**
   * Implicitly wraps a Command into a Sequential Command.
   * @param next: The command which is run next.
   */
  then(next: Command): Command;
}

/**
 * A command base class.
 * Used to circumvent TypeScript abstract/interface weirdness.
 */
export abstract class CommandBase implements Command {
  public abstract execute(manager: RobotManager): Promise<void>;

  public then(next: Command): SequentialCommandGroup {
    return new SequentialCommandGroup([this, next]);
  }

  /**
   * The use case for this is command.then().
   * In this case, we want to attach the callbacks to the result of execute?
   */
  // public then<TResult1 = void, TResult2 = never>(
  //   onfulfilled?:
  //     | ((value: void) => TResult1 | PromiseLike<TResult1>)
  //     | null
  //     | undefined
  // ): PromiseLike<TResult1 | TResult2> {
  //   if (typeof onfulfilled == "function") {
  //     return new SequentialCommandGroup();
  //   }
  //   return Promise.resolve(null) as unknown as PromiseLike<TResult1 | TResult2>;
  //   // throw new Error("Commands must be thened with functions.");
  // }
}

/**
 * A command which can be reversed (undone).
 */
export interface ReversibleCommand extends Command {
  reverse(): ReversibleCommand;
}

/**
 * A helper which reverses commands in a set.
 */
export function reverseCommands(commands: ReversibleCommand[]) {
  return commands.map((command) => command.reverse());
}

/**
 * A command which operates on an individual Robot.
 */
export abstract class IndividualCommand extends CommandBase {
  constructor(public square: string) {
    super();
  }

  public execute(manager: RobotManager): Promise<void> {
    const robot = manager.getRobot(this.square);
    return this.executeRobot(robot);
  }

  public abstract executeRobot(robot: Robot): Promise<void>;
}

/**
 * Represents a group of commands.
 */
export abstract class CommandGroup extends CommandBase {
  constructor(public commands: Command[]) {
    super();
  }
}

/**
 * Executes one or more commands in parallel.
 */
export class ParallelCommandGroup extends CommandGroup {
  public async execute(manager: RobotManager): Promise<void> {
    const promises = this.commands.map((move) => move.execute(manager));
    return Promise.all(promises).then(null);
  }
}

/**
 * Executes one or more commands in sequence, one after another.
 */
export class SequentialCommandGroup extends CommandGroup {
  public async execute(manager: RobotManager): Promise<void> {
    let promise = Promise.resolve();
    for (const command of this.commands) {
      promise = promise.then(() => command.execute(manager));
    }
    return promise;
  }
}
