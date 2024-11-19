import { WebsocketRequestHandler } from "express-ws";
import { Router } from "express";

import { parseMessage } from "../../common/message/parse-message";
import {
    GameFinishedMessage,
    GameHoldMessage,
    GameInterruptedMessage,
    MoveMessage,
} from "../../common/message/game-message";
import {
    DriveRobotMessage,
    SetRobotVariableMessage,
} from "../../common/message/robot-message";

import { TCPServer } from "./tcp-interface";
import { Difficulty } from "../../common/client-types";
import { RegisterWebsocketMessage } from "../../common/message/message";
import { clientManager, robotManager, socketManager } from "./managers";
import {
    ComputerGameManager,
    GameManager,
    HumanGameManager,
} from "./game-manager";
import { ChessEngine } from "../../common/chess-engine";
import { Side } from "../../common/game-types";
import { USE_VIRTUAL_ROBOTS } from "../utils/env";
import { SaveManager } from "./save-manager";

import { CommandExecutor } from "../command/executor";
import { VirtualBotTunnel, virtualRobots } from "../simulator";
import { Position } from "../robot/position";
import { DEGREE } from "../utils/units";

export const tcpServer: TCPServer | null =
    USE_VIRTUAL_ROBOTS ? null : new TCPServer();
export const executor = new CommandExecutor();

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

    ws.on("message", async (data) => {
        const message = parseMessage(data.toString());
        console.log("Received message: " + message.toJson());

        if (message instanceof RegisterWebsocketMessage) {
            socketManager.registerSocket(req.cookies.id, ws);
        } else if (
            message instanceof GameInterruptedMessage ||
            message instanceof MoveMessage ||
            message instanceof GameHoldMessage ||
            message instanceof GameFinishedMessage
        ) {
            // TODO: Handle game manager not existing
            await gameManager?.handleMessage(message, req.cookies.id);
        } else if (message instanceof DriveRobotMessage) {
            doDriveRobot(message);
        } else if (message instanceof SetRobotVariableMessage) {
            doSetRobotVariable(message);
        }
    });
};

export const apiRouter = Router();

apiRouter.get("/client-information", (req, res) => {
    const clientType = clientManager.getClientType(req.cookies.id);
    //loading saves from file if found
    const oldSave = SaveManager.loadGame(req.cookies.id);
    if (oldSave) {
        if (oldSave.aiDifficulty !== -1) {
            gameManager = new ComputerGameManager(
                new ChessEngine(oldSave.game),
                socketManager,
                oldSave.host === req.cookies.id ?
                    oldSave.hostWhite ?
                        Side.WHITE
                    :   Side.BLACK
                : oldSave.hostWhite ? Side.BLACK
                : Side.WHITE,
                oldSave.aiDifficulty,
                oldSave.host !== req.cookies.id,
            );
        } else {
            gameManager = new HumanGameManager(
                new ChessEngine(oldSave.game),
                socketManager,
                oldSave.hostWhite ? Side.WHITE : Side.BLACK,
                clientManager,
                oldSave.host !== req.cookies.id,
            );
        }
    }
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
        false,
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
        false,
    );
    return res.send({ message: "success" });
});

apiRouter.get("/get-ids", (_, res) => {
    const ids = Array.from(robotManager.idsToRobots.keys());
    return res.send({ ids });
});

apiRouter.get("/do-smth", async (_, res) => {
    const robotsEntries = Array.from(virtualRobots.entries());
    const [, robot] =
        robotsEntries[Math.floor(Math.random() * robotsEntries.length)];
    await robot.sendDrivePacket(1);
    await robot.sendTurnPacket(45 * DEGREE);

    res.send({ message: "success" });
});

apiRouter.get("/get-simulator-robot-state", (_, res) => {
    if (!USE_VIRTUAL_ROBOTS) {
        return res.status(400).send({ message: "Simulator is not enabled." });
    }
    const robotsEntries = Array.from(virtualRobots.entries());

    const robotState = Object.fromEntries(
        robotsEntries.map(([id, robot]) => {
            let headingRadians = robot.headingRadians;
            let position = new Position(robot.position.x, robot.position.y);

            const tunnel = robot.getTunnel();
            if (tunnel instanceof VirtualBotTunnel) {
                position = tunnel.position;
                headingRadians = tunnel.headingRadians;
            }
            return [id, { position, headingRadians: headingRadians }];
        }),
    );
    return res.send({
        robotState,
        messages: Array.from(VirtualBotTunnel.messages),
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
    if (!tcpServer) {
        console.warn("Attempted to drive robot without TCP server.");
        return false;
    }
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

function doSetRobotVariable(message: SetRobotVariableMessage): boolean {
    if (!tcpServer) {
        console.warn("Attempted to set robot variable without TCP server.");
        return false;
    }
    if (!tcpServer.getConnectedIds().includes(message.id)) {
        console.warn(
            "Attempted set variable for non-existent robot ID " + message.id,
        );
        return false;
    } else {
        const tunnel = tcpServer.getTunnelFromId(message.id);
        if (!tunnel.connected) {
            console.warn(
                "Attempted set robot variable for disconnected robot ID " +
                    message.id,
            );
            return false;
        } else {
            tunnel.send({
                type: "SET_VAR",
                var_id: parseInt(message.variableName),
                var_type: "float",
                var_val: message.variableValue,
            });
        }
    }
    return true;
}
