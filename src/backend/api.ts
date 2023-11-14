import { AbsoluteMove, Command } from "./command";
import { Robots } from "./robots";

/**
 * TODO: Add express router and endpoints
 */

let robots: Robots | any;

function reset() {
  // We'll eventually have a list of ips or something and a factory to init robots
  //   robots = new Robots();
  //   robots.reset();
}

function makeMove() {
  const start: string = "ahh";
  const end: string = "ahh";
  const command = processMove(start, end);
  command.execute(robots);
}

function processMove(from: string, to: string): Command {
  return new AbsoluteMove("ahhhh", 0, 0);
}
