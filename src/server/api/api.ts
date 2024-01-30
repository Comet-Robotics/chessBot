import { Command } from "../command/command";
import { PieceManager } from "../robot/piece-manager";
import { CommandExecutor } from "../command/executor";
import { Chess } from "chess.js";

import { Square } from "../robot/square";
import { WebsocketRequestHandler } from "express-ws";
import { PacketType, TCPServer } from "./tcp-interface";

const manager = new PieceManager([]);
const executor = new CommandExecutor();
const chess = new Chess();
const tcpServer = new TCPServer();

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
    console.log({ message })
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
    } else if (message.type == "get_ids") {
      ws.send(
        JSON.stringify({
          type: "id_list",
          ids: tcpServer.getConnectedIds()
          // ids: ['11', '22']
        })
      );
    } else if (message.type == "_drive_tank") {
      // TODO: message argument/schema validation
      if (!("id" in message && "left" in message && "right" in message)) {
        ws.send(
          JSON.stringify({
            type: "argument_error",
            message: "ID or Left or Right power values not in message!"
          })
        );
      } else {
        if (manualMove(parseInt(message.id), parseFloat(message.left), parseFloat(message.right))) {
          ws.send(
            // TODO: store MESSAGE_SUCCESS and MESSAGE_FAILURE in common messages file
            JSON.stringify({
              type: "success"
            })
          );
        } else {
          ws.send(
            JSON.stringify({
              type: "failure"
            })
          );
        }

      }
    } else if (message.type == "_stop") {
      if (!("id" in message)) {
        ws.send(
          JSON.stringify({
            type: "argument_error",
            message: "ID not in message!"
          })
        );
      } else {
        if (manualStop(parseInt(message.id))) {
          ws.send(
            // TODO: store MESSAGE_SUCCESS and MESSAGE_FAILURE in common messages file
            JSON.stringify({
              type: "success"
            })
          );
        } else {
          ws.send(
            JSON.stringify({
              type: "failure"
            })
          );
        }
      }
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

function manualMove(robotId: number, leftPower: number, rightPower: number): boolean {
  if (!(tcpServer.getConnectedIds().includes(robotId.toString()))) {
    console.log("attempted manual move for non-existent robot ID " + robotId.toString());
    return false;
  } else {
    const tunnel = tcpServer.getTunnelFromId(robotId)
    tunnel.send(PacketType.DRIVE_TANK, `${leftPower},${rightPower}`);
    return true;
  }
}

function manualStop(robotId: number): boolean {
  if (!(tcpServer.getConnectedIds().includes(robotId.toString()))) {
    console.log("attempted manual stop for non-existent robot ID " + robotId.toString());
    return false;
  } else {
    tcpServer.getTunnelFromId(robotId).send(PacketType.ESTOP);
    return true;
  }
}
