import { Dispatch, useState } from "react";

import {
    GameInterruptedMessage,
    GameStartMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { PositionMessage } from "../../common/message/game-message";
import {
    GameEndReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { useSocket } from "../api";
import { MessageHandler } from "../../common/message/message";
import { GameEndDialog } from "./game-end-dialog";
import { Outlet, useLocation } from "react-router-dom";
import { ChessEngine } from "../../common/chess-engine";
import { Move } from "../../common/game-types";

/**
 * Creates a MessageHandler function.
 */
function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameInterruptedReason: Dispatch<GameInterruptedReason>,
): MessageHandler {
    return (message) => {
        if (message instanceof PositionMessage) {
            setChess(new ChessEngine(message.pgn));
        } else if (message instanceof MoveMessage) {
            // Must be a new instance of ChessEngine to trigger UI redraw
            setChess(chess.copy(message.move));
        } else if (message instanceof GameInterruptedMessage) {
            setGameInterruptedReason(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const state = useLocation().state;
    const { gameType, side, difficulty } = state;

    const [chess, setChess] = useState(new ChessEngine());
    const [gameInterruptedReason, setGameInterruptedReason] =
        useState<GameInterruptedReason>();

    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameInterruptedReason),
        () => sendMessage(new GameStartMessage(gameType, side, difficulty)),
    );

    let gameOverReason: GameEndReason | undefined = undefined;
    const gameFinishedReason = chess.getGameFinishedReason();
    if (gameFinishedReason !== undefined) {
        gameOverReason = gameFinishedReason;
    } else if (gameInterruptedReason !== undefined) {
        gameOverReason = gameInterruptedReason;
    }
    const gameEndDialog =
        gameOverReason !== undefined ?
            <GameEndDialog reason={gameOverReason} side={side} />
        :   null;

    const handleMove = (move: Move): void => {
        setChess(chess.copy(move));
        sendMessage(new MoveMessage(move));
    };

    return (
        <>
            <NavbarMenu sendMessage={sendMessage} />
            <div id="body-container">
                <ChessboardWrapper
                    side={side}
                    chess={chess}
                    onMove={handleMove}
                />
                {gameEndDialog}
                <Outlet />
            </div>
        </>
    );
}
