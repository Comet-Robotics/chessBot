import { Dispatch, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Square } from "chess.js";

import {
    StopGameMessage,
    StartGameMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import { PositionMessage } from "../../common/message/game-message";
import { StopGameReason } from "../../common/game-end";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { WEBSOCKET_URL } from "../api";
import { GameEndDialog } from "./game-end-dialog";
import { Outlet, useLocation } from "react-router-dom";
import { parseMessage } from "../../common/message/parse-message";
import { ChessEngine } from "../../common/chess-engine";

function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameStopped: Dispatch<StopGameReason>,
) {
    return (msg: MessageEvent<any>) => {
        const message = parseMessage(msg.data.toString());

        if (message instanceof PositionMessage) {
            setChess(new ChessEngine(message.position));
        } else if (message instanceof MoveMessage) {
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
    const isWhite: boolean = state.isWhite;

    const [chess, setChess] = useState(new ChessEngine());
    const [gameStopped, setGameStopped] = useState<StopGameReason>();

    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: getMessageHandler(chess, setChess, setGameStopped),
    });

    useEffect(() => {
        sendMessage(
            new StartGameMessage(state.gameType, state.difficulty).toJson(),
        );
    }, [sendMessage]);

    let gameEndDialog = null;
    if (chess.isGameOver()) {
        gameEndDialog = (
            <GameEndDialog
                reason={chess.getGameFinishedReason()!}
                isWhite={isWhite}
            />
        );
    } else if (gameStopped !== undefined) {
        gameEndDialog = (
            <GameEndDialog reason={gameStopped} isWhite={isWhite} />
        );
    }

    return (
        <>
            <NavbarMenu sendMessage={sendMessage} />
            <div id="body-container">
                <ChessboardWrapper
                    isWhite={isWhite}
                    chess={chess}
                    onMove={getMoveHandler(chess, setChess, sendMessage)}
                />
                {gameEndDialog}
                <Outlet />
            </div>
        </>
    );
}

function getMoveHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    sendMessage: Dispatch<string>,
) {
    return (from: Square, to: Square): void => {
        const chessCopy = new ChessEngine(chess.fen);
        chessCopy.makeMove(from, to);
        setChess(chessCopy);
        sendMessage(new MoveMessage(from, to).toJson());
    };
}
