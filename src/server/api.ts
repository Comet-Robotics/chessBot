import { Command } from "./command/command";
import { PieceManager } from "./robot/piecemanager";
import { CommandExecutor } from "./command/executor";

import { Router } from "express";
import { Square } from "./robot/square";

import { v4 as uuid } from "uuid";

export const router = Router();

const manager = new PieceManager([]);
const executor = new CommandExecutor();

router.get("/auth", (req, res) => {
  //pulls clientId cookie from client
  const clientIdCookie = req.cookies.clientId;

  // if cookie exists on client, return the cookie
  if (clientIdCookie) {
    res.json({ clientId: clientIdCookie });
  } else {
    const newId = uuid();
    //sets cookie to expire after 1 day from generation
    res.cookie("clientId", newId, { maxAge: 86400000 });
    res.json({ clientId: newId });
  }
});

router.post("/reset", (req, res) => {
  reset();
  return res.json({ message: "Success" });
});

function reset() {
  //   manager = new PieceManager([]);
  //   manager.reset();
}

router.post("/move", (req, res) => {
  if (!req.query) {
    return res.status(400).json({ message: "Expected a query" });
  } else if (!req.query.start || !req.query.end) {
    return res.status(400).json({ message: "'start' and 'end' are required" });
  }

  console.log("Start: " + req.query.start);
  console.log("End: " + req.query.end);

  return res.json({ message: "Success" });
});

function makeMove(start: string, end: string) {
  const command = processMove(Square.fromString(start), Square.fromString(end));
  executor.execute(command);
}

function processMove(from: Square, to: Square): Command {
  throw new Error("Function not implemented");
}
