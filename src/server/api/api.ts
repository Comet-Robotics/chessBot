import { WebsocketRequestHandler } from "express-ws";
import { Router } from "express";

import { TCPServer } from "./tcp-interface";
import { jsonToMessage, messageToJson } from "../../common/message/message";
import { clientManager, socketManager } from "./managers";
import {
    ComputerGameManager,
    GameManager,
    HumanGameManager,
} from "./game-manager";
import { ChessEngine } from "../../common/chess-engine";
import {
    ClientToServerMessage,
    DriveRobotMessage,
} from "../../common/message/client-server";
import { GameType } from "../../common/game-types";

const tcpServer = new TCPServer();
let gameManager: GameManager | null = null;

/**
 * An endpoint used to establish a websocket connection with the server.
 *
 * The websocket is used to stream moves to and from the client.
 */
export const websocketHandler: WebsocketRequestHandler = (ws, req) => {
    ws.on("close", () => {
        socketManager.handleSocketClosed(req.cookies.id);
    });

    ws.on("message", (data) => {
        const message = jsonToMessage(data.toString(), ClientToServerMessage);
        console.log("Received message: " + messageToJson(message));

        if (message.type === "REGISTER_WEBSOCKET") {
            socketManager.registerSocket(req.cookies.id, ws);
        } else if (message.type === "GAME_START") {
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
        } else if (message.type === "GAME_INTERRUPTED") {
            gameManager?.handleMessage(message, req.cookies.id);
            gameManager = null;
        } else if (message.type === "DRIVE_ROBOT") {
            doDriveRobot(message);
        } else {
            gameManager?.handleMessage(message, req.cookies.id);
        }
    });
};

export const apiRouter = Router();

apiRouter.get("/get-ids", (_, res) => {
    return res.send({
        // ids: ["10", "11"],
        ids: tcpServer.getConnectedIds(),
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

function doDriveRobot(message: DriveRobotMessage): boolean {
    if (!tcpServer.getConnectedIds().includes(message.id)) {
        console.warn(
            "attempted manual move for non-existent robot ID " + message.id,
        );
        return false;
    } else {
        const tunnel = tcpServer.getTunnelFromId(message.id);
        if (!tunnel.connected) {
            console.warn(
                "attempted manual move for disconnected robot ID " + message.id,
            );
            return false;
        } else {
            tunnel.send({
                type: "DRIVE_TANK",
                left: message.power.left,
                right: message.power.right,
            });
        }
    }
    return true;
}
