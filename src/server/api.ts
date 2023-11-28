import { Command } from "./command/command";
import { PieceManager } from "./robot/piecemanager";
import { CommandExecutor } from "./command/executor";

import { Router } from "express";
import { Square } from "./robot/square";

export const router = Router();

const manager = new PieceManager([]);
const executor = new CommandExecutor();

router.get("/auth", (req, res) => {
  //pulls clientID cookie from client
  const clientIDCookie = req.cookies.clientID;

  // if cookie exists on client, return the cookie
  if (clientIDCookie) {
    res.status(200).json({ clientID: clientIDCookie });
  }
  else {
    const newID = "test";
    //sets cookie to expire after 1 day from generation
    res.cookie('clientID', newID, { maxAge: 86400000 })
    res.status(200).json({ clientID: newID });
  }
})

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
