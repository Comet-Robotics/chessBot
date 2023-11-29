import { useState } from "react";
import useWebSocket from "react-use-websocket";

import "./app.css";
import { ChessboardWrapper } from "./chessboard-wrapper";
import { Chess, Square } from "chess.js";

export function App() {
  const [chess, setChess] = useState(new Chess());

  const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:3000/ws", {
    onOpen: () => {
      console.log("Connection established");
    },
    onMessage: (msg) => {
      const message = JSON.parse(msg.data.toString());
      if (message.type == "move") {
        const chessCopy = new Chess(chess.fen());
        chessCopy.move(message.move);
        setChess(chessCopy);
      }
      else if (message.type == "reset") {
        setChess(new Chess());
      }
    }
  });

  const handleGameRestart = () => {
    sendMessage(JSON.stringify({
      "type": "restart"
    }));
  };

  const handleMove = (from: Square, to: Square): boolean => {
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

  return (<>
    <div className="app">
      <ChessboardWrapper
        isWhite={true}
        chess={chess}
        onMove={handleMove}
      />
      <button
        type="button"
        onClick={handleGameRestart}
      >Restart Game</button>
    </div>
  </>);
}