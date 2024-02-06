import { WebsocketRequestHandler } from "express-ws";

import {
    parseMessage,
    MoveMessage,
    ManualMoveMessage,
} from "../../common/message";

import { Command } from "../command/command";
import { PieceManager } from "../robot/piece-manager";
import { CommandExecutor } from "../command/executor";
import { Square } from "../robot/square";
import { PacketType, TCPServer } from "./tcp-interface";
import { Router } from "express";
import { Chess } from "chess.js";

const manager = new PieceManager([]);
const executor = new CommandExecutor();
// const currentGame;
const tcpServer = new TCPServer();

const chess = new Chess();

export const apiRouter = Router();

apiRouter.get("/get-ids", (_, res) => {
    res.send({
        ids: ["10", "11"],
        // ids: tcpServer.getConnectedIds(),
    });
});

/**
 * Returns a list of available puzzles to play.
 */
apiRouter.get("/get-puzzles", (_, res) => {
    return {
        puzzles: [
            {
                name: "Puzzle 1",
                id: "puzzleId1",
                rating: "1200",
            },
            {
                name: "Puzzle 2",
                id: "puzzleId2",
                rating: "1400",
            },
        ],
    };
});

/**
 * An endpoint which can be used to start a game.
 */
apiRouter.post("/start-game", (req, res) => {
    res.send({ message: "Game started" });
});

/**
 * An endpoint used to establish a websocket connection with the server.
 *
 * The websocket is used to stream moves to and from the client.
 */
export const websocketHandler: WebsocketRequestHandler = (ws, req) => {
    ws.on("open", () => {
        console.log("WS opened!");
    });

    ws.on("close", () => {
        console.log("WS closed!");
    });

    ws.on("message", (data) => {
        const message = parseMessage(data.toString());
        console.log(message);

        if (message instanceof MoveMessage) {
            doMove(message);

            // Wait before sending next move
            setTimeout(() => {
                const moveStrings = chess.moves();
                const moveString =
                    moveStrings[Math.floor(Math.random() * moveStrings.length)];
                const move = chess.move(moveString);
                ws.send(new MoveMessage(move.from, move.to).toJson());
            }, 500);
        } else if (message instanceof ManualMoveMessage) {
            doManualMove(message);
        }
    });
};

function doMove(message: MoveMessage) {
    chess.move({ from: message.from, to: message.to });

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

function doManualMove(message: ManualMoveMessage): boolean {
    if (!tcpServer.getConnectedIds().includes(message.id)) {
        console.log(
            "attempted manual move for non-existent robot ID " + message.id,
        );
        return false;
    } else {
        const tunnel = tcpServer.getTunnelFromId(message.id);
        // if (leftPower == 0 && rightPower == 0) {
        //   tunnel.send(PacketType.ESTOP);
        // } else {
        tunnel.send(
            PacketType.DRIVE_TANK,

            message.rightPower.toString(),
        );
    }
    return true;
}

// function manualStop(robotId: number): boolean {
//   if (!tcpServer.getConnectedIds().includes(robotId.toString())) {
//     console.log(
//       "attempted manual stop for non-existent robot ID " + robotId.toString()
//     );
//     return false;
//   } else {
//     tcpServer.getTunnelFromId(robotId).send(PacketType.ESTOP);
//     return true;
//   }
// }
