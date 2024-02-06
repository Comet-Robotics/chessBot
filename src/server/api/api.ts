import { WebsocketRequestHandler } from "express-ws";
import { Game } from "js-chess-engine";

import {
    parseMessage,
    MoveMessage,
    DriveRobotMessage,
    GameOverMessage,
} from "../../common/message";

import { PieceManager } from "../robot/piece-manager";
import { CommandExecutor } from "../command/executor";
import { PacketType, TCPServer } from "./tcp-interface";
import { Router, Request } from "express";
import { Chess } from "chess.js";
import { GameOverReason } from "../../common/game-over-reason";

const manager = new PieceManager([]);
const executor = new CommandExecutor();
const tcpServer = new TCPServer();

const chess = new Chess();
let engine = null;

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

            if (chess.isGameOver()) {
                ws.send(
                    new GameOverMessage(GameOverReason.CHECKMATE_LOSE).toJson(),
                );
            }

            // Wait before sending next move
            // setTimeout(() => {
            //     const moveStrings = chess.moves();

            //     const moveString =
            //         moveStrings[Math.floor(Math.random() * moveStrings.length)];
            //     const move = chess.move(moveString);
            //     ws.send(new MoveMessage(move.from, move.to).toJson());
            // }, 500);
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

/**
 * An endpoint which can be used to start a game.
 */
apiRouter.post("/start-game", (req, res) => {
    res.send({ message: "Game started" });
});

interface DifficultyQuery {
    difficulty: string;
}

apiRouter.post(
    "/start-computer-game",
    (req: Request<{}, any, any, DifficultyQuery>, res) => {
        const difficulty = parseInt(req.query.difficulty);
        engine = new Game();
        res.send({ message: "Game started" });
    },
);

/**
 * Aborts the current game.
 */
apiRouter.post("/abort-game", (_, res) => {
    res.send({ message: "Game aborted" });
});

// function getGameOverReason(chess: Chess, isWhite: boolean): GameOverReason {
//     if (chess.isCheckmate()) {
//         // If it's the opponent's turn and it's checkmate, you win
//         isWhite && chess.turn() === "b" ?
//             GameOverReason.CHECKMATE_WIN
//         :   GameOverReason.CHECKMATE_LOSE;
//     } else if (chess.isStalemate()) {
//         return GameOverReason.STALEMATE;
//     } else if (chess.isInsufficientMaterial()) {
//         return GameOverReason.INSUFFICIENT_MATERIAL;
//     } else if (chess.isThreefoldRepetition()) {
//         return GameOverReason.THREEFOLD_REPETITION;
//     }
//     throw new Error("Failed to find game over reason.");
// }

function doMove(message: MoveMessage) {
    chess.move({ from: message.from, to: message.to });

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
