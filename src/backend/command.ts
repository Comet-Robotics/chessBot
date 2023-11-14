import { Robots } from "./robots";

/**
 * An command which operates on one or more robots.
 */
export interface Command {
  execute(robots: Robots): Promise<void>;
}

export abstract class CommandBase implements Command {
  public abstract execute(robots: Robots): Promise<void>;
}

export interface ReversibleCommand extends Command {
  reverse(): ReversibleCommand;
}

export function reverseCommands(commands: ReversibleCommand[]) {
  return commands.map((command) => command.reverse());
}

export abstract class CommandGroup extends CommandBase {
  constructor(public commands: Command[]) {
    super();
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
