import { Dispatch, useState } from "react";

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
import { Outlet, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [chess, setChess] = useState(new ChessEngine());
    const [gameInterruptedReason, setGameInterruptedReason] =
        useState<GameInterruptedReason>();

    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameInterruptedReason),
    );

    const { isPending, data } = useQuery({
        queryKey: ["game-state"],
        queryFn: async () => {
            return get("/game-state")
                .then((gameState) => {
                    setChess(new ChessEngine(gameState.position));
                    return gameState;
                })
                .catch((error) => {
                    // Bad request; indicates game isn't active
                    if (error.status === 400) {
                        navigate("/home");
                    }
                });
        },
    });

    if (isPending) {
        return <NonIdealState icon={<Spinner />} title="Loading..." />;
    }

    const side = data.side;

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
