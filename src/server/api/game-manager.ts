import { Message } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    PositionMessage,
    StartGameMessage,
    StopGameMessage,
} from "../../common/message/game-message";
import { Side, oppositeSide } from "../../common/game-types";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";

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
        let opponentSocket = undefined;
        if (clientType === ClientType.HOST) {
            opponentSocket = this.clientManager.getClientSocket();
        } else {
            opponentSocket = this.clientManager.getHostSocket();
        }

        if (message instanceof StartGameMessage) {
            opponentSocket?.send(
                new StartGameMessage(
                    message.gameType,
                    oppositeSide(message.side),
                ).toJson(),
            );
        } else if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            opponentSocket?.send(new MoveMessage(message.move).toJson());
        } else if (message instanceof StopGameMessage) {
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
        if (message instanceof StartGameMessage) {
            // If the person starting the game is black, computer is white and needs to make the first move
            if (message.side === Side.BLACK) {
                const move = this.chess.makeAiMove(this.difficulty);
                this.socketManager.sendToSocket(id, new MoveMessage(move));
            }
        } else if (message instanceof StopGameMessage) {
            this.socketManager.sendToSocket(id, message);
        } else if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);

            if (this.chess.getGameFinishedReason() !== undefined) {
                // Game is naturally finished; we're done
                return;
            }

            const move = this.chess.makeAiMove(this.difficulty);
            this.socketManager.sendToSocket(id, new MoveMessage(move));
        }
    }
}

// export type Puzzle = object;

// export class PuzzleManager extends GameManager {
//     constructor(private puzzle: Puzzle) {
//         super();
//     }
// }
