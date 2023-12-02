import { Command } from "../command/command";
import { PieceManager } from "../robot/piece-manager";
import { CommandExecutor } from "../command/executor";
import { Chess } from "chess.js";

import { Square } from "../robot/square";
import { WebsocketRequestHandler } from "express-ws";

const manager = new PieceManager([]);
const executor = new CommandExecutor();
const chess = new Chess();

/**
 * An endpoint used to establish a websocket connection with the server.
 *
 * The websocket is used to stream moves to and from the client.
 */
export const websocketHandler: WebsocketRequestHandler = (ws, req) => {
  ws.on("open", () => {
    console.log("WS created!");
  });

  ws.on("close", () => {
    console.log("WS closed!");
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    if (message.type == "restart") {
      chess.reset();
      ws.send(
        JSON.stringify({
          type: "reset",
        })
      );
    } else if (message.type == "move") {
      makeMove(message);

      // Wait before sending next move
      setTimeout(() => {
        const moves = chess.moves();
        const move = moves[Math.floor(Math.random() * moves.length)];
        chess.move(move);

        ws.send(
          JSON.stringify({
            type: "move",
            move,
          })
        );
      }, 500);
    }
  });
};

function makeMove(move: { from: string; to: string }) {
  chess.move(move);

  // TODO: handle invalid moves, implement
  // const command = processMove(
  //   Square.fromString(move.from),
  //   Square.fromString(move.to)
  // );
  // executor.execute(command);
}

function processMove(from: Square, to: Square): Command {
  throw new Error("Function not implemented");
}
