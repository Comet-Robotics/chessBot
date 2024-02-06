import { Dispatch, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Chess, Square } from "chess.js";

import {
    MoveMessage,
    PositionMessage,
    GameOverMessage,
} from "../../common/message";
import { GameOverReason } from "../../common/game-over-reason";

import { ChessboardWrapper } from "../chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { WEBSOCKET_URL } from "../api";
import { GameOverDialog } from "./game-over-dialog";
import { useSearchParams } from "react-router-dom";

function getMessageHandler(
    chess: Chess,
    setChess: Dispatch<Chess>,
    setGameOver: Dispatch<GameOverReason>,
) {
    return (msg: MessageEvent<any>) => {
        const message = JSON.parse(msg.data.toString());

        if (message instanceof PositionMessage) {
            setChess(new Chess(message.position));
        } else if (message instanceof MoveMessage) {
            const chessCopy = new Chess(chess.fen());
            chessCopy.move(message.to);
            setChess(chessCopy);
        } else if (message instanceof GameOverMessage) {
            setGameOver(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const [params, _] = useSearchParams();
    const isWhite = params.get("isWhite") == "true";

    const [chess, setChess] = useState(new Chess());
    const [gameOver, setGameOver] = useState<GameOverReason>();

    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: getMessageHandler(chess, setChess, setGameOver),
    });

    let gameOverDialog =
        gameOver !== undefined ? <GameOverDialog reason={gameOver} /> : null;

    return (
        <>
            <NavbarMenu />
            <div id="body-container">
                <ChessboardWrapper
                    isWhite={isWhite}
                    chess={chess}
                    onMove={getMoveHandler(chess, setChess, sendMessage)}
                />
                {gameOverDialog}
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
