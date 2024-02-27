import { Dispatch, ReactElement, useEffect, useState } from "react";
import { Square } from "chess.js";

import {
    GameEndReasonMessage,
    GameStartMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { PositionMessage } from "../../common/message/game-message";
import { GameEndReason } from "../../common/game-end-reasons";

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
    setGameEndReason: Dispatch<GameEndReason>,
): MessageHandler {
    return (message) => {
        if (message instanceof PositionMessage) {
            setChess(new ChessEngine(message.position));
        } else if (message instanceof MoveMessage) {
            // Must be a new instance of ChessEngine to trigger UI redraw
            const chessCopy = new ChessEngine(chess.fen);
            chessCopy.makeMove(message.from, message.to);
            setChess(chessCopy);
        } else if (message instanceof GameEndReasonMessage) {
            setGameEndReason(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const state = useLocation().state;
    const { gameType, side, difficulty } = state;

    const [chess, setChess] = useState(new ChessEngine());
    const [gameEndReason, setGameEndReason] = useState<GameEndReason>();

    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameEndReason),
    );

    useEffect(() => {
        sendMessage(new GameStartMessage(gameType, side, difficulty));
    }, [sendMessage]);

    let gameEndDialog: ReactElement | null = null;
    if (gameEndReason !== undefined) {
        gameEndDialog = <GameEndDialog reason={gameEndReason} side={side} />;
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
