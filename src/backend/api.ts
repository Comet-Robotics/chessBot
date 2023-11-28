import { Command } from "./command";
import { PieceManager } from "./piecemanager";
import { CommandExecutor } from "./executor";

import { Router } from "express";

export const router = Router();

/**
 * TODO: Add express router and endpoints
 */

const manager = new PieceManager([]);
const executor = new CommandExecutor();

router.post("/reset", (req, res) => {
  console.log("Hello!");
  reset();
});

function reset() {
  //   manager = new PieceManager([]);
  //   manager.reset();
}

router.post("/make-move", (req, res) => {});

function makeMove() {
  const start: string = "a1";
  const end: string = "a2";
  const command = processMove(start, end);
  executor.execute(command);
}

function processMove(from: string, to: string): Command {
  throw new Error("Function not implemented");
}
