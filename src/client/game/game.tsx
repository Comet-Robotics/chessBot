import { Dispatch, ReactElement, useEffect, useState } from "react";
import { Square } from "chess.js";

import {
    StopGameMessage,
    StartGameMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { PositionMessage } from "../../common/message/game-message";
import { StopGameReason } from "../../common/game-end-reason";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { useSocket } from "../api";
import { MessageHandler } from "../../common/message/message";
import { GameEndDialog } from "./game-end-dialog";
import { Outlet, useLocation } from "react-router-dom";
import { ChessEngine } from "../../common/chess-engine";

/**
 * Creates a MessageHandler function.
 */
function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameStopped: Dispatch<StopGameReason>,
): MessageHandler {
    return (message) => {
        if (message instanceof PositionMessage) {
            setChess(new ChessEngine(message.position));
        } else if (message instanceof MoveMessage) {
            // Must be a new instance of ChessEngine to trigger UI redraw
            const chessCopy = new ChessEngine(chess.fen);
            chessCopy.makeMove(message.from, message.to);
            setChess(chessCopy);
        } else if (message instanceof StopGameMessage) {
            setGameStopped(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const state = useLocation().state;
    const { gameType, side, difficulty } = state;

    const [chess, setChess] = useState(new ChessEngine());
    const [gameStopped, setGameStopped] = useState<StopGameReason>();

    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameStopped),
    );

    useEffect(() => {
        sendMessage(new StartGameMessage(gameType, side, difficulty));
    }, [sendMessage, gameType, side, difficulty]);

    let gameEndDialog: ReactElement | null = null;
    if (chess.isGameOver()) {
        gameEndDialog = (
            <GameEndDialog
                reason={chess.getGameFinishedReason()!}
                side={side}
            />
        );
    } else if (gameStopped !== undefined) {
        gameEndDialog = <GameEndDialog reason={gameStopped} side={side} />;
    }

    const handleMove = (from: Square, to: Square): void => {
        const chessCopy = new ChessEngine(chess.fen);
        chessCopy.makeMove(from, to);
        setChess(chessCopy);
        sendMessage(new MoveMessage(from, to));
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
