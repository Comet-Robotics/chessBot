import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useState } from "react";
import { ResizeEntry, ResizeSensor } from "@blueprintjs/core";

interface Transform {
    height: number;
    width: number;
    top: number;
    left: number;
}

function computeChessboardTransform(
    canvasHeight: number,
    canvasWidth: number,
    scale: number,
): Transform {
    // Alternative: subtract off at least 8 to prevent scrollbar
    const width = Math.min(canvasHeight, canvasWidth) * scale;
    const height = width;

    const xShift = (canvasWidth - width) / 2;
    const yShift = (canvasHeight - height) / 2;
    return { left: xShift, top: yShift, height, width };
}

const CLICK_STYLE = {
    backgroundColor: "green",
};

interface ChessboardWrapperProps {
    chess: Chess;
    isWhite: boolean;
    onMove: (from: Square, to: Square) => void;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { chess, isWhite, onMove } = props;

    // Chessboard does not like 0 default height and width for some reason
    const [transform, setTransform] = useState<Transform>({
        height: 50,
        width: 50,
        top: 0,
        left: 0,
    });

    const handleResize = (entries: ResizeEntry[]) => {
        const { height, width } = entries[0].contentRect;
        const transform = computeChessboardTransform(height, width, 0.85);
        setTransform(transform);
    };

    const [lastClickedSquare, setLastClickedSquare] = useState<any>();

    // Maps squares to style objects
    const customSquareStyles: { [square: string]: Object } = {};
    let legalSquares: string[] | undefined = undefined;
    if (lastClickedSquare !== undefined) {
        chess
            .moves({ square: lastClickedSquare, verbose: true })
            .map((move) => move.to)
            .forEach((square) => {
                customSquareStyles[square] = CLICK_STYLE;
            });
    }

    /**
     * Returns true if a move is legal, and false otherwise.
     */
    const isLegalMove = (from: Square, to: Square): boolean => {
        const legalSquares = chess
            .moves({ square: from, verbose: true })
            .map((move) => move.to);
        return legalSquares.includes(to);
    };

    const doMove = (from: Square, to: Square): void => {
        onMove(from, to);
        setLastClickedSquare(undefined);
    };

    return (
        <ResizeSensor onResize={handleResize}>
            <div id="chess-container">
                <div id="chessboard" style={{ ...transform }}>
                    <Chessboard
                        boardOrientation={isWhite ? "white" : "black"}
                        boardWidth={transform.width}
                        position={chess.fen()}
                        onPieceDrop={(from: Square, to: Square): boolean => {
                            if (isLegalMove(from, to)) {
                                doMove(from, to);
                                return true;
                            }
                            return false;
                        }}
                        onSquareClick={(square: Square) => {
                            if (
                                legalSquares !== undefined &&
                                legalSquares.includes(square)
                            ) {
                                doMove(lastClickedSquare, square);
                            } else if (lastClickedSquare === square) {
                                setLastClickedSquare(undefined);
                            } else {
                                setLastClickedSquare(square);
                            }
                        }}
                        isDraggablePiece={({ sourceSquare }) =>
                            chess.get(sourceSquare).color ===
                            (isWhite ? "w" : "b")
                        }
                        arePremovesAllowed={false}
                        customSquareStyles={customSquareStyles}
                    />
                </div>
            </div>
        </ResizeSensor>
    );
}
