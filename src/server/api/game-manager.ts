import { Message, messageToJson } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import { Side, oppositeSide } from "../../common/game-types";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";
import { WebSocket } from "ws";

export abstract class GameManager {
    constructor(
        protected chess: ChessEngine,
        protected socketManager: SocketManager,
    ) {}

    public handleReconnect(id: string): void {
        this.socketManager.sendToSocket(id, {
            type: "POSITION",
            pgn: this.chess.fen,
        });
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

        if (message.type === "GAME_START") {
            opponentSocket?.send(
                messageToJson({
                    type: "GAME_START",
                    gameType: message.gameType,
                    side: oppositeSide(message.side),
                }),
            );
        } else if (message.type === "MOVE") {
            // TODO
            // this.chess.makeMove(message.move);
            opponentSocket?.send(messageToJson(message));
        } else if (message.type === "GAME_INTERRUPTED") {
            this.socketManager.sendToSocket(id, message);
            opponentSocket?.send(messageToJson(message));
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
        if (message.type === "GAME_START") {
            // If the person starting the game is black, we're white and need to make the first move
            if (message.side === Side.BLACK) {
                // TODO
                const move = this.chess.makeAiMove(this.difficulty);
                this.socketManager.sendToSocket(id, { type: "MOVE", move });
            }
        } else if (message.type === "GAME_INTERRUPTED") {
            // Reflect end game reason back to client
            this.socketManager.sendToSocket(id, message);
        } else if (message.type === "MOVE") {
            // TODO
            // this.chess.makeMove(message.move);

            if (this.chess.isGameFinished()) {
                // Game is naturally finished; we're done
                return;
            }

            // TODO
            // const move = this.chess.makeAiMove(this.difficulty);
            // this.socketManager.sendToSocket(id, new MoveMessage(move));
        }
    }
}

// export type Puzzle = object;

// export class PuzzleManager extends GameManager {
//     constructor(private puzzle: Puzzle) {
//         super();
//     }
// }
