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
  then(next: Command): SequentialCommandGroup;
}

/**
 * An interface for a command which can be reversed (undone).
 */
export interface ReversibleCommand extends Command {
  reverse(): ReversibleCommand;
}

/**
 * A helper which reverses elements in a set.
 */
// export function reverseCommands(commands: Reversible[]) {
//   return commands.map((command) => command.reverse());
// }

/**
 * A command base class.
 * Used to circumvent TypeScript abstract/interface weirdness.
 */
export abstract class CommandBase implements Command {
  public abstract execute(manager: RobotManager): Promise<void>;

  public then(next: Command): SequentialCommandGroup {
    return new SequentialCommandGroup([this, next]);
  }
}
/**
 * A command which operates on an individual Robot.
 * Note this class redirects the execute implementation to executeRobot.
 */
export abstract class RobotCommand extends CommandBase implements Command {
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
 * A type of command which groups other commands and runs them together.
 */
export abstract class GroupCommand extends CommandBase {
  constructor(public commands: Command[]) {
    super();
  }
}

/**
 * Executes one or more commands in parallel.
 */
export class ParallelCommandGroup extends GroupCommand {
  public async execute(manager: RobotManager): Promise<void> {
    const promises = this.commands.map((move) => move.execute(manager));
    return Promise.all(promises).then(null);
  }
}

/**
 * Executes one or more commands in sequence, one after another.
 */
export class SequentialCommandGroup extends GroupCommand {
  public async execute(manager: RobotManager): Promise<void> {
    let promise = Promise.resolve();
    for (const command of this.commands) {
      promise = promise.then(() => command.execute(manager));
    }
    return promise;
  }
}
