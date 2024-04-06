import { Message } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    GameInterruptedMessage,
    GameStartedMessage,
} from "../../common/message/game-message";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";
import { WebSocket } from "ws";
import { Side, oppositeSide } from "../../common/game-types";

export abstract class GameManager {
    constructor(
        protected chess: ChessEngine,
        protected socketManager: SocketManager,
        /**
         * The side the host is playing.
         */
        protected hostSide: Side,
    ) {}

    /**
     * A method which is invoked whenever a game first connects.
     * Should respond with the game's side and position.
     */
    public getGameState(clientType: ClientType): object {
        let side: Side;
        if (clientType === ClientType.HOST) {
            side = this.hostSide;
        } else {
            side = oppositeSide(this.hostSide);
        }
        return {
            side,
            position: this.chess.pgn,
        };
    }

    public abstract handleMessage(
        message: Message,
        clientType: ClientType,
    ): void;
}

export class HumanGameManager extends GameManager {
    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        hostSide: Side,
        protected clientManager: ClientManager,
    ) {
        super(chess, socketManager, hostSide);
        // Notify other client the game has started
        clientManager.sendToClient(new GameStartedMessage());
    }

    public handleMessage(message: Message, clientType: ClientType): void {
        let playerSocket: WebSocket | undefined;
        let opponentSocket: WebSocket | undefined;
        if (clientType === ClientType.HOST) {
            playerSocket = this.clientManager.getHostSocket();
            opponentSocket = this.clientManager.getClientSocket();
        } else {
            playerSocket = this.clientManager.getClientSocket();
            opponentSocket = this.clientManager.getHostSocket();
        }

        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            opponentSocket?.send(new MoveMessage(message.move).toJson());
        } else if (message instanceof GameInterruptedMessage) {
            // propagate back to both sockets
            playerSocket?.send(message.toJson());
            opponentSocket?.send(message.toJson());
        }
    }
}

export class ComputerGameManager extends GameManager {
    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        hostSide: Side,
        protected difficulty: number,
    ) {
        super(chess, socketManager, hostSide);
        if (this.hostSide === Side.BLACK) {
            this.chess.makeAiMove(this.difficulty);
        }
    }

    public handleMessage(message: Message, id: string): void {
        if (message instanceof GameInterruptedMessage) {
            // Reflect end game reason back to client
            this.socketManager.sendToSocket(id, message);
        } else if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);

            if (this.chess.isGameFinished()) {
                // Game is naturally finished; we're done
                return;
            }

            const move = this.chess.makeAiMove(this.difficulty);
            this.socketManager.sendToSocket(id, new MoveMessage(move));
        }
    }
}
