import { Command } from "./command";
import { AbsoluteMove } from "./move";
import { RobotManager } from "./robotmanager";

/**
 * TODO: Add express router and endpoints
 */

/**
 * The global manager.
 * In the future, this may need to move to a session token or main.
 */
let manager: RobotManager | any;

function reset() {
  // We'll eventually have a list of ips or something and a factory to init robots
  //   manager = new RobotManager();
  //   manager.reset();
}

function makeMove() {
  const start: string = "a1";
  const end: string = "a2";
  const command = processMove(start, end);
  command.execute(manager);
}

function processMove(from: string, to: string): Command {
  return new AbsoluteMove("a1", 0, 0);
}
