import { WebsocketRequestHandler } from "express-ws";
import { Router } from "express";

import { parseMessage } from "../../common/message/parse-message";
import {
    StartGameMessage,
    StopGameMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";

import { PacketType, TCPServer } from "./tcp-interface";
import { GameType } from "../../common/game-type";
import { RegisterWebsocketMessage } from "../../common/message/message";
import { clientManager, socketManager } from "./managers";
import {
    ComputerGameManager,
    GameManager,
    HumanGameManager,
} from "./game-manager";
import { ChessEngine } from "../../common/chess-engine";

const tcpServer = new TCPServer();
let gameManager: GameManager | null = null;

/**
 * An endpoint used to establish a websocket connection with the server.
 *
 * The websocket is used to stream moves to and from the client.
 */
export const websocketHandler: WebsocketRequestHandler = (ws, req) => {
    ws.on("close", () => {
        console.log("WS closed!");
        socketManager.handleSocketClosed(req.cookies.id);
    });

    ws.on("message", (data) => {
        const message = parseMessage(data.toString());
        console.log("Received message: " + message.toJson());

        if (message instanceof RegisterWebsocketMessage) {
            socketManager.registerSocket(req.cookies.id, ws);
        } else if (message instanceof StartGameMessage) {
            if (message.gameType === GameType.COMPUTER) {
                gameManager = new ComputerGameManager(
                    new ChessEngine(),
                    socketManager,
                    message.difficulty!,
                );
            } else {
                gameManager = new HumanGameManager(
                    new ChessEngine(),
                    socketManager,
                    clientManager,
                );
            }
            gameManager?.handleMessage(message, req.cookies.id);
        } else if (message instanceof StopGameMessage) {
            gameManager?.handleMessage(message, req.cookies.id);
            gameManager = null;
        } else if (message instanceof DriveRobotMessage) {
            doDriveRobot(message);
        } else {
            gameManager?.handleMessage(message, req.cookies.id);
        }
    });
};

export const apiRouter = Router();

apiRouter.get("/get-ids", (_, res) => {
    return res.send({
        ids: ["10", "11"],
        // ids: tcpServer.getConnectedIds(),
    });
});

/**
 * Returns a list of available puzzles to play.
 */
apiRouter.get("/get-puzzles", (_, res) => {
    return res.send({
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
    });
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
