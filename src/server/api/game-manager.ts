import { Message, SendMessage } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    GameInterruptedMessage,
    GameStartedMessage,
} from "../../common/message/game-message";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";
import { Side, oppositeSide } from "../../common/game-types";
import {
    GameEndReason,
    GameEndReason as GameInterruptedReason,
} from "../../common/game-end-reasons";

export abstract class GameManager {
    protected gameInterruptedReason: GameInterruptedReason | undefined =
        undefined;

    constructor(
        protected chess: ChessEngine,
        protected socketManager: SocketManager,
        /**
         * The side the host is playing.
         */
        protected hostSide: Side,
    ) {}

    public isGameEnded(): boolean {
        return (
            this.gameInterruptedReason !== undefined ||
            this.chess.isGameFinished()
        );
    }

    public getGameEndReason(): GameEndReason | undefined {
        return this.gameInterruptedReason ?? this.chess.getGameFinishedReason();
    }

    /**
     * A method which is invoked whenever a game first connects.
     * Should respond with the game's side, position, and whether the game is finished.
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
            gameEndReason: this.getGameEndReason(),
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

    public handleMessage(message: Message, id: string): void {
        const clientType = this.clientManager.getClientType(id);
        let sendToPlayer: SendMessage;
        let sendToOpponent: SendMessage;
        if (clientType === ClientType.HOST) {
            sendToPlayer = this.clientManager.sendToHost.bind(
                this.clientManager,
            );
            sendToOpponent = this.clientManager.sendToClient.bind(
                this.clientManager,
            );
        } else {
            sendToPlayer = this.clientManager.sendToClient.bind(
                this.clientManager,
            );
            sendToOpponent = this.clientManager.sendToHost.bind(
                this.clientManager,
            );
        }

        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            sendToOpponent(message);
        } else if (message instanceof GameInterruptedMessage) {
            this.gameInterruptedReason = message.reason;
            // propagate back to both sockets
            sendToPlayer(message);
            sendToOpponent(message);
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
        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);

            if (this.chess.isGameFinished()) {
                // Game is naturally finished; we're done
                return;
            }

            const move = this.chess.makeAiMove(this.difficulty);
            this.socketManager.sendToSocket(id, new MoveMessage(move));
        } else if (message instanceof GameInterruptedMessage) {
            this.gameInterruptedReason = message.reason;
            // Reflect end game reason back to client
            this.socketManager.sendToSocket(id, message);
        }
    }
}
