import { Message, SendMessage } from "../../common/message/message";
import { ChessEngine } from "../../common/chess-engine";
import {
    MoveMessage,
    GameInterruptedMessage,
    GameStartedMessage,
    GameHoldMessage,
    GameEndMessage,
    SetChessMessage,
} from "../../common/message/game-message";
import { SocketManager } from "./socket-manager";
import { ClientManager } from "./client-manager";
import { ClientType } from "../../common/client-types";
import { Move, Side, oppositeSide } from "../../common/game-types";
import {
    GameEndReason,
    GameFinishedReason,
    GameHoldReason,
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
        //true if host and client get reversed
        protected reverse: boolean,
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
            side = this.reverse ? oppositeSide(this.hostSide) : this.hostSide;
        } else {
            side = this.reverse ? this.hostSide : oppositeSide(this.hostSide);
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
        protected reverse: boolean,
    ) {
        super(chess, socketManager, hostSide, reverse);
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
        const currentSave = SaveManager.loadGame(id);
        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            if (ids) {
                if (currentSave?.host === ids[0]) {
                    SaveManager.saveGame(
                        ids[0],
                        ids[1],
                        this.hostSide,
                        -1,
                        this.chess.pgn,
                    );
                } else {
                    SaveManager.saveGame(
                        ids[1],
                        ids[0],
                        oppositeSide(this.hostSide),
                        -1,
                        this.chess.pgn,
                    );
                }
            }
            sendToOpponent(message);
        } else if (message instanceof GameInterruptedMessage) {
            this.gameInterruptedReason = message.reason;
            // propagate back to both sockets
            sendToPlayer(message);
            sendToOpponent(message);
        } else if (message instanceof GameHoldMessage) {
            if (message.reason === GameHoldReason.DRAW_CONFIRMATION)
                sendToPlayer(message);
            else if (message.reason === GameHoldReason.DRAW_OFFERED) {
                sendToOpponent(message);
            } else {
                sendToPlayer(message);
                sendToOpponent(message);
            }
            if (ids) {
                if (currentSave?.host === ids[0])
                    SaveManager.endGame(ids[0], ids[1]);
                else SaveManager.endGame(ids[1], ids[0]);
            }
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
        protected reverse: boolean,
    ) {
        super(chess, socketManager, hostSide, reverse);
        if (this.hostSide === Side.BLACK) {
            this.chess.makeAiMove(this.difficulty);
        } else if (chess.pgn !== "") {
            this.chess.makeAiMove(this.difficulty);
        }
    }

    public handleMessage(message: Message, id: string): void {
        if (message instanceof MoveMessage) {
            this.chess.makeMove(message.move);
            SaveManager.saveGame(
                id,
                "ai",
                this.hostSide,
                this.difficulty,
                this.chess.pgn,
            );

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

export class PuzzleGameManager extends GameManager {
    private moveNumber: number = 0;

    constructor(
        chess: ChessEngine,
        socketManager: SocketManager,
        fen: string,
        private moves: Move[],
        protected difficulty: number,
    ) {
        super(
            chess,
            socketManager,
            fen.split(" ")[1] === "w" ? Side.WHITE : Side.BLACK,
            false,
        );
        chess.load(fen);
    }

    public getDifficulty():number{
        return this.difficulty;
    }

    public handleMessage(message: Message, id: string): void {
        if (message instanceof MoveMessage) {
            //if the move is correct
            if (
                this.moves[this.moveNumber].from === message.move.from &&
                this.moves[this.moveNumber].to === message.move.to
            ) {
                this.chess.makeMove(message.move);
                this.moveNumber++;

                //if there is another move, make it
                if (this.moves[this.moveNumber]) {
                    this.chess.makeMove(this.moves[this.moveNumber]);
                    this.socketManager.sendToSocket(
                        id,
                        new MoveMessage(this.moves[this.moveNumber]),
                    );
                }
                this.moveNumber++;
            }

            //send an undo message
            else {
                this.socketManager.sendToSocket(
                    id,
                    new SetChessMessage(this.chess.fen),
                );
            }

            //send a finished message
            if (this.isGameEnded()) {
                const gameEnd = this.getGameEndReason();
                if (gameEnd) {
                    this.socketManager.sendToSocket(
                        id,
                        new GameEndMessage(gameEnd),
                    );
                }
            }
        } else if (
            message instanceof (GameInterruptedMessage || GameEndMessage)
        ) {
            this.gameInterruptedReason = message.reason;
            // Reflect end game reason back to client
            this.socketManager.sendToSocket(id, message);
        }
    }

    public isGameEnded(): boolean {
        return this.moveNumber >= this.moves.length || super.isGameEnded();
    }

    public getGameEndReason(): GameEndReason | undefined {
        if (this.moveNumber >= this.moves.length) {
            return GameFinishedReason.PUZZLE_SOLVED;
        }
        return super.getGameEndReason();
    }
    
    public getGameState(clientType: ClientType): object {

        return {...super.getGameState(clientType), difficulty:this.difficulty};
    }
}
