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
import { SaveManager } from "./save-manager";

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
        const ids = this.clientManager.getIds();
        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            if (ids)
                SaveManager.saveGame(
                    ids[0],
                    ids[1],
                    this.hostSide,
                    -1,
                    this.chess.pgn,
                );
            sendToOpponent(message);
        } else if (message instanceof GameInterruptedMessage) {
            this.gameInterruptedReason = message.reason;
            // propagate back to both sockets
            sendToPlayer(message);
            sendToOpponent(message);
        } else if (this.isGameEnded()) {
            if (ids) SaveManager.endGame(ids[0], ids[1]);
        }
    }
}

export class ComputerGameManager extends GameManager {
    // The minimum amount of time to wait responding with a move.
    MINIMUM_DELAY = 500;

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
            SaveManager.saveGame(
                id,
                "ai",
                this.hostSide,
                this.difficulty,
                this.chess.pgn,
            );
            this.chess.makeMove(message.move);

            if (this.chess.isGameFinished()) {
                // Game is naturally finished; we're done
                SaveManager.endGame(id, "ai");
                return;
            }

            // Ensure MINIMUM_DELAY before responding
            const startTime = Date.now();
            const move = this.chess.makeAiMove(this.difficulty);
            const elapsedTime = Date.now() - startTime;
            // If elapsed time is less than minimum delay, timeout is set to 1ms
            setTimeout(() => {
                this.socketManager.sendToSocket(id, new MoveMessage(move));
            }, this.MINIMUM_DELAY - elapsedTime);
            if (this.isGameEnded()) {
                SaveManager.endGame(id, "ai");
            }
        } else if (message instanceof GameInterruptedMessage) {
            this.gameInterruptedReason = message.reason;
            SaveManager.endGame(id, "ai");
            // Reflect end game reason back to client
            this.socketManager.sendToSocket(id, message);
        }
    }
}
