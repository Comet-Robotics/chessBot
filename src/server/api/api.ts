import { WebsocketRequestHandler } from "express-ws";
import { Router } from "express";

import { parseMessage } from "../../common/message/parse-message";
import {
    GameInterruptedMessage,
    MoveMessage,
} from "../../common/message/game-message";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";

import { TCPServer } from "./tcp-interface";
import { Difficulty } from "../../common/client-types";
import { RegisterWebsocketMessage } from "../../common/message/message";
import { clientManager, socketManager } from "./managers";
import {
    ComputerGameManager,
    GameManager,
    HumanGameManager,
    PuzzleGameManager,
} from "./game-manager";
import { ChessEngine } from "../../common/chess-engine";
import { Side } from "../../common/game-types";
import { IS_DEVELOPMENT } from "../utils/env";

const tcpServer = new TCPServer();

export let gameManager: GameManager | null = null;

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
        const message = parseMessage(data.toString());
        console.log("Received message: " + message.toJson());

        if (message instanceof RegisterWebsocketMessage) {
            socketManager.registerSocket(req.cookies.id, ws);
        } else if (
            message instanceof GameInterruptedMessage ||
            message instanceof MoveMessage
        ) {
            // TODO: Handle game manager not existing
            gameManager?.handleMessage(message, req.cookies.id);
        } else if (message instanceof DriveRobotMessage) {
            doDriveRobot(message);
        }
    });
};

export const apiRouter = Router();

apiRouter.get("/client-information", (req, res) => {
    const clientType = clientManager.getClientType(req.cookies.id);
    /**
     * Note the client currently redirects to home from the game over screen
     * So removing the isGameEnded check here results in an infinite loop
     */
    const isGameActive = gameManager !== null && !gameManager.isGameEnded();
    return res.send({
        clientType,
        isGameActive,
    });
});

apiRouter.get("/game-state", (req, res) => {
    if (gameManager === null) {
        console.warn("Invalid attempt to fetch game state");
        return res.status(400).send({ message: "No game is currently active" });
    }
    const clientType = clientManager.getClientType(req.cookies.id);
    return res.send(gameManager.getGameState(clientType));
});

apiRouter.post("/start-computer-game", (req, res) => {
    const side = req.query.side as Side;
    const difficulty = parseInt(req.query.difficulty as string) as Difficulty;
    gameManager = new ComputerGameManager(
        new ChessEngine(),
        socketManager,
        side,
        difficulty,
    );
    return res.send({ message: "success" });
});

apiRouter.post("/start-human-game", (req, res) => {
    const side = req.query.side as Side;
    gameManager = new HumanGameManager(
        new ChessEngine(),
        socketManager,
        side,
        clientManager,
    );
    return res.send({ message: "success" });
});

apiRouter.post("/start-puzzle-game", (req, res) => {
    const fen = req.query.fen as string;
    const moves = req.query.difficulty as string[];
    const difficulty = parseInt(req.query.difficulty as string);
    gameManager = new PuzzleGameManager(
        new ChessEngine(),
        socketManager,
        fen,
        moves,
        difficulty,
    );
    return res.send({ message: "success" });
});

apiRouter.get("/get-ids", (_, res) => {
    const ids = tcpServer.getConnectedIds();
    if (IS_DEVELOPMENT) {
        ids.push("dummy-id-1", "dummy-id-2");
    }
    return res.send({ ids });
});

export interface PuzzleComponents{
    fen:string,
    moves:string[],
    rating:number
}
/**
 * Returns a list of available puzzles to play.
 */
apiRouter.get("/get-puzzles", (_, res) => {
    const puzzles: Map<string, PuzzleComponents> = 
    new Map([
        ["Puzzle 1",
            {
                fen:"8/1p3p1k/8/p1p2Kr1/P2pP3/1P1P4/2P5/8 w HAha - 0 1",
                moves:["Kxg5"],
                rating:511
            }],
        ["Puzzle 2",
            {
                fen:"5rk1/p5pp/4q3/8/1P1P4/2P4P/P2p1RP1/5RK1 w HAha - 0 1",
                moves:["Rxf8#"],
                rating:514
            }],
        ["Puzzle 3",
            {
                fen:"8/3B4/2P2P2/1P1P1p2/3pP1p1/1pK5/2p4R/2k3r1 w HAha - 0 1",
                moves:["Rb6+","d6","Rd6#"],
                rating:1000
            }],
    ]);
    return res.send(puzzles);
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
                left: message.leftPower,
                right: message.rightPower,
            });
        }
    }
    return true;
}
