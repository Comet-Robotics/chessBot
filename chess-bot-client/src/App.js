import { Chessboard } from "react-chessboard";
import "./App.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useState, useEffect } from "react";

function App() {
    const queryClient = useQueryClient();
    const [moveSquares, setMoveSquares] = useState({});
    const [selectedSquare, setSelectedSquare] = useState("");
    const possibleSquareStyles = {
        backgroundColor: "red",
    };

    const query = useQuery({
        queryKey: ["game"],
        queryFn: () => fetch("/status").then((res) => res.json()),
    });

    useEffect(() => {
        setInterval(() => {
            queryClient.invalidateQueries(["game"]);
        }, 1000);
    }, []);

    const onSquareClick = async (piece) => {
        if (Object.keys(moveSquares).includes(piece)) {
            const res = await fetch(`/move/${selectedSquare}/${piece}`, {
                method: "POST",
            });
            setSelectedSquare("");
            setMoveSquares({});
            const data = await res.json();
            queryClient.setQueryData(["game"], data);
            return;
        }
        const res = await fetch(`/moves/${piece}`);
        const data = await res.json();
        console.log(data);
        const stuff = data.reduce((acc, curr) => {
            acc[curr.toLowerCase()] = possibleSquareStyles;
            return acc;
        }, {});
        setSelectedSquare(piece);
        setMoveSquares(stuff);
    };

    const makeAiMove = async () => {
        const res = await fetch("/aimove/3", { method: "POST" });
        const data = await res.json();
        queryClient.setQueryData(["game"], data);
    };

    const resetGame = async () => {
        const res = await fetch("/resetGame", { method: "POST" });
        const data = await res.json();
        queryClient.setQueryData(["game"], data);
    };

    if (!query.isSuccess) return <p>Loading...</p>;

    return (
        <div className="App">
            <div className="flex">
                <div className="chessSide">
                    <Chessboard
                        arePiecesDraggable={false}
                        position={Object.entries(query.data.pieces).reduce(
                            (acc, curr) => {
                                const [position, piece] = curr;
                                const color =
                                    piece.toLowerCase() == piece ? "b" : "w";
                                acc[position.toLowerCase()] =
                                    `${color}${piece.toUpperCase()}`;
                                return acc;
                            },
                            {},
                        )}
                        onSquareClick={onSquareClick}
                        customBoardStyle={{
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                        }}
                        customSquareStyles={{
                            ...moveSquares,
                        }}
                    />
                </div>
                <div className="flexChild">
                    <h1>ChessBot Control </h1>
                    <h5>turn: {query.data.turn}</h5>
                    <button type="button" onClick={makeAiMove}>
                        AI Move
                    </button>
                    <button type="button" onClick={resetGame}>
                        Reset
                    </button>
                </div>
            </div>
            <div className="enarc">
                <marquee>under construction</marquee>
                <img
                    className="enarcImage"
                    src="https://nesscampbell.com/wp-content/uploads/kiL8jgmMSafPY6mv15PCVtAJzUpv0QGE1604495671-3.jpg"
                />
            </div>
        </div>
    );
}

export default App;
