import { Dispatch, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Chess, Square } from "chess.js";

import { ChessboardWrapper } from "../chessboard-wrapper";
import { MessageType } from "../../common/message";

function getMessageHandler(chess: Chess, setChess: Dispatch<Chess>) {
    return (msg: MessageEvent<any>) => {
        const message = JSON.parse(msg.data.toString());
        switch (message.type) {
            case MessageType.POSITION: {
                setChess(new Chess(message.position));
            }
            case MessageType.MOVE: {
                const chessCopy = new Chess(chess.fen());
                chessCopy.move(message.move);
                setChess(chessCopy);
            }
        }
    };
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
        sendMessage(
            JSON.stringify({
                type: "move",
                from: from,
                to: to,
            }),
        );
        return true;
    };
}

export function Game(): JSX.Element {
    const [chess, setChess] = useState(new Chess());

    const { sendMessage } = useWebSocket("ws://localhost:3000/ws", {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: getMessageHandler(chess, setChess),
    });

    const handleGameRestart = () => {
        // sendMessage(new ResetMessage().toJson());
    };

    return (
        <>
            <div id="body-container">
                <ChessboardWrapper
                    isWhite={true}
                    chess={chess}
                    onMove={getMoveHandler(chess, setChess, sendMessage)}
                />
            </div>
        </>
    );
}
