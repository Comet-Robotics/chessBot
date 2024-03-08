import { Dispatch, useEffect, useState } from "react";

import {
    GameEndReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { useSocket } from "../api";
import { GameEndDialog } from "./game-end-dialog";
import { Outlet, useLocation } from "react-router-dom";
import { ChessEngine } from "../../common/chess-engine";
import { Move } from "../../common/message/core";
import { MessageHandler } from "../../common/message/message";
import { ServerToClientMessage } from "../../common/message/client-server";

/**
 * Creates a MessageHandler function.
 */
function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameInterruptedReason: Dispatch<GameInterruptedReason>,
): MessageHandler<ServerToClientMessage> {
    return (message) => {
        if (message.type === "POSITION") {
            setChess(new ChessEngine(message.pgn));
        } else if (message.type === "MOVE") {
            // Must be a new instance of ChessEngine to trigger UI redraw
            setChess(chess.copy(message.move));
        } else if (message.type === "GAME_INTERRUPTED") {
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
    );

    useEffect(() => {
        sendMessage({ type: "GAME_START", gameType, side, difficulty });
    }, [sendMessage, gameType, side, difficulty]);

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
        sendMessage({ type: "MOVE", move });
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
