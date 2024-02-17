import { WebsocketRequestHandler } from "express-ws";
import { Router } from "express";
import { ChessEngine } from "../../common/chess-engine";

import { parseMessage } from "../../common/message/parse-message";
import {
    StartGameMessage,
    StopGameMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";

import { PieceManager } from "../robot/piece-manager";
import { CommandExecutor } from "../command/executor";
import { PacketType, TCPServer } from "./tcp-interface";
import { GameType } from "../../common/game-type";

const manager = new PieceManager([]);
const executor = new CommandExecutor();
const tcpServer = new TCPServer();

let chess: ChessEngine | null = null;
let difficulty = 0;

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

        if (message instanceof StartGameMessage) {
            chess = new ChessEngine();
            if (message.gameType === GameType.COMPUTER) {
                difficulty = message.difficulty!;
            }
        } else if (message instanceof StopGameMessage) {
            chess = null;
            // Notify clients of game abort
            ws.send(message.toJson());
        } else if (message instanceof MoveMessage) {
            if (chess == null) {
                throw new Error("Game must be started first.");
            }

            chess.makeMove(message.from, message.to);

            if (chess.getGameFinishedReason() != undefined) {
                // Game is naturally finished; we're done
                return;
            }

            const { from, to } = chess.makeAiMove(difficulty);
            ws.send(new MoveMessage(from, to).toJson());
        } else if (message instanceof DriveRobotMessage) {
            doDriveRobot(message);
        }
    });
};

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

function doMove(message: MoveMessage) {
    // chess.move({ from: message.from, to: message.to });
    // TODO: handle invalid moves, implement
    // const command = processMove(
    //   Square.fromString(move.from),
    //   Square.fromString(move.to)
    // );
    // executor.execute(command);
}

function doDriveRobot(message: DriveRobotMessage): boolean {
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
