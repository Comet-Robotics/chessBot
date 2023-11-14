import { RobotManager } from "./robotmanager";

/**
 * An command which operates on one or more robots.
 */
export interface Command {
  execute(manager: RobotManager): Promise<void>;
}

/**
 * A command base class.
 * Used to circumvent TypeScript abstract/interface weirdness.
 */
export abstract class CommandBase implements Command {
  public abstract execute(manager: RobotManager): Promise<void>;
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
