import { Dispatch, useState } from "react";

import {
    GameEndMessage,
    GameHoldMessage,
    GameInterruptedMessage,
    SetChessMessage,
} from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import {
    GameEndReason,
    GameHoldReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";

import { ChessboardWrapper } from "../chessboard/chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";
import { get, useEffectQuery, useSocket } from "../api";
import { MessageHandler } from "../../common/message/message";
import { GameEndDialog } from "./game-end-dialog";
import { Navigate, Outlet } from "react-router-dom";
import { ChessEngine } from "../../common/chess-engine";
import { Move } from "../../common/game-types";
import { NonIdealState, Spinner } from "@blueprintjs/core";
import { AcceptDrawDialog, OfferDrawDialog } from "./draw-dialog";

/**
 * Creates a MessageHandler function.
 */
function getMessageHandler(
    chess: ChessEngine,
    setChess: Dispatch<ChessEngine>,
    setGameInterruptedReason: Dispatch<GameInterruptedReason>,
    setGameEndedReason: Dispatch<GameEndReason>,
    setGameHoldReason: Dispatch<GameHoldReason>,
): MessageHandler {
    return (message) => {
        if (message instanceof MoveMessage) {
            // Must be a new instance of ChessEngine to trigger UI redraw
            // short wait so the pieces don't teleport into place
            setTimeout(() => {
                setChess(chess.copy(message.move));
            }, 500);
        } else if (message instanceof SetChessMessage) {
            const fen = message.chess;
            if (fen) {
                setTimeout(() => {
                    chess.load(fen);
                    setChess(chess.copy());
                }, 500);
            }
        } else if (message instanceof GameInterruptedMessage) {
            setGameInterruptedReason(message.reason);
        } else if (message instanceof GameEndMessage) {
            setGameEndedReason(message.reason);
        } else if (message instanceof GameHoldMessage) {
            setGameHoldReason(message.reason);
        }
    };
}

export function Game(): JSX.Element {
    const [chess, setChess] = useState(new ChessEngine());
    const [gameInterruptedReason, setGameInterruptedReason] =
        useState<GameInterruptedReason>();
    const [gameEndedReason, setGameEndedReason] = useState<GameEndReason>();
    const [gameHoldReason, setGameHoldReason] = useState<GameHoldReason>();

    const sendMessage = useSocket(
        getMessageHandler(
            chess,
            setChess,
            setGameInterruptedReason,
            setGameEndedReason,
            setGameHoldReason,
        ),
    );

    const { isPending, data, isError } = useEffectQuery(
        "game-state",
        async () => {
            return get("/game-state").then((gameState) => {
                setChess(new ChessEngine(gameState.position));
                if (gameState.gameEndReason !== undefined) {
                    setGameInterruptedReason(gameState.gameEndReason);
                }
                return gameState;
            });
        },
        false,
    );

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
    if (gameEndedReason !== undefined) {
        gameEndReason = gameEndedReason;
    } else if (gameFinishedReason !== undefined) {
        gameEndReason = gameFinishedReason;
    } else if (gameInterruptedReason !== undefined) {
        gameEndReason = gameInterruptedReason;
    }

    const gameEndDialog =
        gameEndReason !== undefined ?
            <GameEndDialog reason={gameEndReason} side={side} />
        :   null;
    const gameOfferDialog =
        gameHoldReason !== undefined ?
            gameHoldReason === GameHoldReason.DRAW_CONFIRMATION ?
                <OfferDrawDialog sendMessage={sendMessage} />
            :   null
        :   null;

    const gameAcceptDialog =
        gameHoldReason !== undefined ?
            gameHoldReason === GameHoldReason.DRAW_OFFERED ?
                <AcceptDrawDialog sendMessage={sendMessage} />
            :   null
        :   null;

    const handleMove = (move: Move): void => {
        setChess(chess.copy(move));
        sendMessage(new MoveMessage(move));
    };

    return (
        <>
            <NavbarMenu sendMessage={sendMessage} side={side} difficulty={data.difficulty}/>
            <div id="body-container">
                <ChessboardWrapper
                    side={side}
                    chess={chess}
                    onMove={handleMove}
                />
                {gameEndDialog}
                {gameOfferDialog}
                {gameAcceptDialog}
                <Outlet />
            </div>
        </>
    );
}
