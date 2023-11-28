import { Command } from "./command";
import { PieceManager } from "./piecemanager";

import { Router } from "express";

export const router = Router();

/**
 * TODO: Add express router and endpoints
 */

/**
 * The global manager.
 * In the future, this may need to move to a session token or main.
 */
let manager: PieceManager;

router.get("/reset", (req, res) => {
  // We'll eventually have a list of ips or something and a factory to init robots
  //   manager = new RobotManager();
  //   manager.reset();
});

router.get("/make-move", (req, res) => {});

function makeMove() {
  const start: string = "a1";
  const end: string = "a2";
  const command = processMove(start, end);
  command.execute();
}

router.get("/process-move", (req, res) => {});

function processMove(from: string, to: string): Command {
  throw new Error("Function not implemented");
}
