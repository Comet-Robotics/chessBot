import { Message } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    PositionMessage,
    GameStartMessage,
    GameEndReasonMessage,
} from "../../common/message/game-message";
import { Side, oppositeSide } from "../../common/game-types";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";
<<<<<<< HEAD
import { GameFinishedReason } from "../../common/game-end-reasons";
=======
import { WebSocket } from "ws";
>>>>>>> origin/main

export abstract class GameManager {
    constructor(
        protected chess: ChessEngine,
        protected socketManager: SocketManager,
    ) {}

    public handleReconnect(id: string): void {
        this.socketManager.sendToSocket(
            id,
            new PositionMessage(this.chess.fen),
        );
    }

    public abstract handleMessage(message: Message, id: string): void;
}

export class HumanGameManager extends GameManager {
    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        private clientManager: ClientManager,
    ) {
        super(chess, socketManager);
    }

    public handleMessage(message: Message, id: string): void {
        const clientType = this.clientManager.getClientType(id);
        let opponentSocket: WebSocket | undefined = undefined;
        if (clientType === ClientType.HOST) {
            opponentSocket = this.clientManager.getClientSocket();
        } else {
            opponentSocket = this.clientManager.getHostSocket();
        }

        if (message instanceof GameStartMessage) {
            opponentSocket?.send(
                new GameStartMessage(
                    message.gameType,
                    oppositeSide(message.side),
                ).toJson(),
            );
        } else if (message instanceof MoveMessage) {
            this.chess.makeMove(message.from, message.to);
            opponentSocket?.send(
                new MoveMessage(message.from, message.to).toJson(),
            );
        } else if (message instanceof GameEndReasonMessage) {
            this.socketManager.sendToSocket(id, message);
            opponentSocket?.send(message.toJson());
        }
    }
}

export class ComputerGameManager extends GameManager {
    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        private difficulty: number,
    ) {
        super(chess, socketManager);
    }

    public handleMessage(message: Message, id: string): void {
        if (message instanceof GameStartMessage) {
            // If the person starting the game is black, we're white and need to make the first move
            if (message.side === Side.BLACK) {
                const { from, to } = this.chess.makeAiMove(this.difficulty);
                this.socketManager.sendToSocket(id, new MoveMessage(from, to));
            }
        } else if (message instanceof GameEndReasonMessage) {
            // Reflect end game reason to server
            this.socketManager.sendToSocket(id, message);
        } else if (message instanceof MoveMessage) {
            this.chess.makeMove(message.from, message.to);

            const gameFinishedReason = this.chess.getGameFinishedReason();
            if (gameFinishedReason != undefined) {
                // Game is naturally finished; we're done
                this.socketManager.sendToSocket(
                    id,
                    new GameEndReasonMessage(gameFinishedReason),
                );
                return;
            }

            const { from, to } = this.chess.makeAiMove(this.difficulty);
            this.socketManager.sendToSocket(id, new MoveMessage(from, to));
        }
    }
}

// export type Puzzle = object;

// export class PuzzleManager extends GameManager {
//     constructor(private puzzle: Puzzle) {
//         super();
//     }
// }
