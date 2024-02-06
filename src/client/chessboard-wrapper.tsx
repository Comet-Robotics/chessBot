import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useState } from "react";
import { ResizeEntry, ResizeSensor } from "@blueprintjs/core";
//import { Square } from "@blueprintjs/icons";

interface Transform {
    height: number;
    width: number;
    top: number;
    left: number;
}

function computeChessboardTransform(canvasHeight: number, canvasWidth: number, scale: number): Transform {
    // Alternative: subtract off at least 8 to prevent scrollbars
    const width = Math.min(canvasHeight, canvasWidth) * scale;
    const height = width;

    const xShift = (canvasWidth - width) / 2;
    const yShift = (canvasHeight - height) / 2;
    return { left: xShift, top: yShift, height, width };
}

interface ChessboardWrapperProps {
    chess: Chess;
    isWhite: boolean;
    onMove: (from: Square, to: Square) => boolean;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { chess, isWhite, onMove } = props;

    // Chessboard does not like 0 default height and width for some reason
    const [transform, setTransform] = useState<Transform>({ height: 50, width: 50, top: 0, left: 0 });

    const handleResize = (entries: ResizeEntry[]) => {
        const { height, width } = entries[0].contentRect;
        const transform = computeChessboardTransform(height, width, 0.85);
        setTransform(transform);
    };


    //TODO: when red square is clicked moved the piece to the square
    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const squareStyle = { backgroundColor: "red" };
    const [prevSquareString, setPrevSquareString] = useState<any>('a1');
    const [prevSquare, setPrevSquare] = useState<any>('a1');

    return (
        <ResizeSensor onResize={handleResize}>
            <div id="chess-container">
                <div id="chessboard"
                    style={{ ...transform }}>
                    <Chessboard
                        boardOrientation={isWhite ? "white" : "black"}
                        boardWidth={transform.width}
                        position={chess.fen()}
                        onPieceDrop={onMove}
                        onSquareClick={(square) => {
                            setLegalMoves(chess.moves({ square }))

                            console.log(legalMoves)
                            legalMoves.forEach(legalMove => {

                                if (legalMove.length >= 3) {
                                    legalMove = legalMove.slice(legalMove.length-2);

                                }

                                if (square == legalMove) {
                                    onMove(prevSquare, legalMove)
                                }
                                else {
                                    setLegalMoves(chess.moves({ square }))
                                }
                            })
                            setPrevSquare(square)

                        }
                        }
                        isDraggablePiece={({ sourceSquare }) => chess.get(sourceSquare).color == (isWhite ? "w" : "b")}
                        arePremovesAllowed={true}
                        customSquareStyles={getSquareStyles(legalMoves, squareStyle)}
                    />
                </div>
            </div>
        </ResizeSensor>
    );
}

function getSquareStyles(legalMoves: string[], squareStyle: Object) {
    const map = legalMoves.reduce<any>(

        (result, legalMove) => {


            if (legalMove.length >= 3) {
                legalMove = legalMove.slice(legalMove.length-2);
            

            }
            result[legalMove] = squareStyle;
            return result;
        }, {}
    );
    return map;
}