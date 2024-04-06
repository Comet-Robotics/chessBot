import { Message } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    PositionMessage,
    GameInterruptedMessage,
} from "../../common/message/game-message";
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
        protected clientManager: ClientManager,
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

        // if (message instanceof GameStartMessage) {
        // opponentSocket?.send(
        //     new GameStartMessage(
        //         message.gameType,
        //         oppositeSide(message.side),
        //     ).toJson(),
        // );
        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            opponentSocket?.send(new MoveMessage(message.move).toJson());
        } else if (message instanceof GameInterruptedMessage) {
            this.socketManager.sendToSocket(id, message);
            opponentSocket?.send(message.toJson());
        }
    }
}

export class ComputerGameManager extends GameManager {
    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        protected difficulty: number,
    ) {
        super(chess, socketManager);
    }

    /**
     * If the host is black, this method needs to be called.
     */
    public makeInitialMove(id: string): void {
        // if (hostSide === Side.BLACK) {
        const move = this.chess.makeAiMove(this.difficulty);
        // Okay it if doesn't work - client will get it when the socket connects and syncs
        this.socketManager.sendToSocket(id, new MoveMessage(move));
        // }
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
