import { Dispatch, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Chess, Square } from "chess.js";

import { ChessboardWrapper } from "./chessboard-wrapper";
import { NavbarMenu } from "./navbar-menu";

function getMessageHandler(chess: Chess, setChess: Dispatch<Chess>) {
    return (msg: MessageEvent<any>) => {
        const message = JSON.parse(msg.data.toString());
        if (message.type == "move") {
            const chessCopy = new Chess(chess.fen());
            chessCopy.move(message.move);
            setChess(chessCopy);
        }
        else if (message.type == "reset") {
            setChess(new Chess());
        }
    };
}

function getMoveHandler(
    chess: Chess,
    setChess: Dispatch<Chess>,
    sendMessage: Dispatch<string>
) {
    return (from: Square, to: Square): boolean => {
        const chessCopy = new Chess(chess.fen());
        try { chessCopy.move({ from, to }); }
        catch { return false; }
        setChess(chessCopy);
        sendMessage(JSON.stringify({
            "type": "move",
            "from": from,
            "to": to
        }));
        return true;
    };
}

export function Body(): JSX.Element {
    const [chess, setChess] = useState(new Chess());

    const { sendMessage } = useWebSocket("ws://localhost:3000/ws", {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: getMessageHandler(chess, setChess)
    });

    const handleGameRestart = () => {
        sendMessage(JSON.stringify({
            "type": "restart"
        }));
    };

    return (<>
        <NavbarMenu
            onRestartClick={handleGameRestart}
            onSettingsClick={() => { }}
        />
        <div id="body-container">
            <ChessboardWrapper
                isWhite={true}
                chess={chess}
                onMove={getMoveHandler(chess, setChess, sendMessage)}
            />
        </div>
    </>);
}