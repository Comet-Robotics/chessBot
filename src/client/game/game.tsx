import { Dispatch, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Chess, Square } from "chess.js";

import { StopGameMessage, StartGameMessage } from "../../common/game-message";
import { MoveMessage } from "../../common/game-message";
import { PositionMessage } from "../../common/game-message";
import {
    GameStoppedReason,
    getGameFinishedReason,
} from "../../common/game-end";

import { ChessboardWrapper } from "../chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { WEBSOCKET_URL } from "../api";
import { GameEndDialog } from "./game-end-dialog";
import { Outlet, useLocation } from "react-router-dom";
import { GameType } from "../../common/game-type";
import { parseMessage } from "../../common/parse-message";

function getMessageHandler(
    chess: Chess,
    setChess: Dispatch<Chess>,
    setGameStopped: Dispatch<GameStoppedReason>,
) {
    return (msg: MessageEvent<any>) => {
        const message = parseMessage(msg.data.toString());

        if (message instanceof PositionMessage) {
            setChess(new Chess(message.position));
        } else if (message instanceof MoveMessage) {
            const chessCopy = new Chess(chess.fen());
            chessCopy.move({ from: message.from, to: message.to });
            setChess(chessCopy);
        } else if (message instanceof StopGameMessage) {
            setGameStopped(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const state = useLocation().state;
    const isWhite: boolean = state.isWhite;

    const [chess, setChess] = useState(new Chess());
    const [gameStopped, setGameStopped] = useState<GameStoppedReason>();

    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: getMessageHandler(chess, setChess, setGameStopped),
    });

    useEffect(() => {
        console.log("Difficulty: " + state.difficulty);
        sendMessage(
            new StartGameMessage(state.gameType, state.difficulty).toJson(),
        );
    }, [sendMessage]);

    let gameEndDialog = null;
    if (chess.isGameOver()) {
        gameEndDialog = (
            <GameEndDialog
                reason={getGameFinishedReason(chess)}
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
    chess: Chess,
    setChess: Dispatch<Chess>,
    sendMessage: Dispatch<string>,
) {
    return (from: Square, to: Square): boolean => {
        const chessCopy = new Chess(chess.fen());
        try {
            chessCopy.move({ from, to });
        } catch {
            return false;
        }
        setChess(chessCopy);
        sendMessage(new MoveMessage(from, to).toJson());
        return true;
    };
}
