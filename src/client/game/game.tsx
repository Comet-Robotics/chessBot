import { Dispatch, useState } from "react";

import { GameInterruptedMessage } from "../../common/message/game-message";
import { MoveMessage } from "../../common/message/game-message";
import {
    GameEndReason,
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

/**
 * Creates a MessageHandler function to handle move messages and game interruptions.
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
/**
 * Creates required message, game, and move handling functions before inserting them into a chessboard wrapper
 *
 * @returns - chessboard wrapper with current side and message handler
 */
export function Game(): JSX.Element {
    const [chess, setChess] = useState(new ChessEngine());
    const [gameInterruptedReason, setGameInterruptedReason] =
        useState<GameInterruptedReason>();

    /**send any messages using our defined message handler inside a message socket for handling*/
    const sendMessage = useSocket(
        getMessageHandler(chess, setChess, setGameInterruptedReason),
    );

    //checks if a game is currently active
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

    //if a game is pending, show a loading screen while waiting
    if (isPending) {
        return (
            <NonIdealState
                icon={<Spinner intent="primary" />}
                title="Loading..."
            />
        );
        //go home if error
    } else if (isError) {
        return <Navigate to="/home" />;
    }

    const side = data.side;

    //check if the game has ended or been interrupted
    let gameEndReason: GameEndReason | undefined = undefined;
    const gameFinishedReason = chess.getGameFinishedReason();
    if (gameFinishedReason !== undefined) {
        gameEndReason = gameFinishedReason;
    } else if (gameInterruptedReason !== undefined) {
        gameEndReason = gameInterruptedReason;
    }

    /**create a game end dialog with the game end reason, if defined*/
    const gameEndDialog =
        gameEndReason !== undefined ?
            <GameEndDialog reason={gameEndReason} side={side} />
        :   null;

    /**make moves by making a copy of the chessboard and sending the move message*/
    const handleMove = (move: Move): void => {
        setChess(chess.copy(move));
        sendMessage(new MoveMessage(move));
    };

    //return the chessboard wrapper, navbar, and potential end dialog
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
