import { Command } from "./command";
import { PieceManager } from "./piecemanager";

/**
 * TODO: Add express router and endpoints
 */

/**
 * The global manager.
 * In the future, this may need to move to a session token or main.
 */
let manager: PieceManager;

function reset() {
  // We'll eventually have a list of ips or something and a factory to init robots
  //   manager = new RobotManager();
  //   manager.reset();
}

function makeMove() {
  const start: string = "a1";
  const end: string = "a2";
  const command = processMove(start, end);
  command.execute();
}

function processMove(from: string, to: string): Command {
  throw new Error("Function not implemented");
}
