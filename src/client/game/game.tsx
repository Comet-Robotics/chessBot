import { Dispatch, useId, useState } from "react";

import { GameInterruptedMessage } from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import {
    GameEndReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { get, useSocket } from "../api";
import { MessageHandler } from "../../common/message/message";
import { GameEndDialog } from "./game-end-dialog";
import { Navigate, Outlet } from "react-router-dom";
import { ChessEngine } from "../../common/chess-engine";
import { Move } from "../../common/game-types";
import { useQuery } from "@tanstack/react-query";
import { NonIdealState, Spinner } from "@blueprintjs/core";

/**
 * Creates a MessageHandler function.
 */
function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameInterruptedReason: Dispatch<GameInterruptedReason>,
): MessageHandler {
    return (message) => {
        if (message instanceof MoveMessage) {
            // Must be a new instance of ChessEngine to trigger UI redraw
            setChess(chess.copy(message.move));
        } else if (message instanceof GameInterruptedMessage) {
            setGameInterruptedReason(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const [chess, setChess] = useState(new ChessEngine());
    const [gameInterruptedReason, setGameInterruptedReason] =
        useState<GameInterruptedReason>();

    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameInterruptedReason),
    );

    const id = useId();
    const { isPending, data, isError } = useQuery({
        queryKey: ["game-state" + id],
        queryFn: async () => {
            return get("/game-state").then((gameState) => {
                setChess(new ChessEngine(gameState.position));
                if (gameState.gameEndReason !== undefined) {
                    setGameInterruptedReason(gameState.gameEndReason);
                }
                return gameState;
            });
        },
        staleTime: Infinity,
        retry: false,
    });

    if (isPending) {
        return (
            <NonIdealState
                icon={<Spinner intent="primary" />}
                title="Loading..."
            />
        );
    } else if (isError) {
        return <Navigate to="/home" />;
    }

    const side = data.side;

    let gameEndReason: GameEndReason | undefined = undefined;
    const gameFinishedReason = chess.getGameFinishedReason();
    if (gameFinishedReason !== undefined) {
        gameEndReason = gameFinishedReason;
    } else if (gameInterruptedReason !== undefined) {
        gameEndReason = gameInterruptedReason;
    }

    const gameEndDialog =
        gameEndReason !== undefined ?
            <GameEndDialog reason={gameEndReason} side={side} />
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
