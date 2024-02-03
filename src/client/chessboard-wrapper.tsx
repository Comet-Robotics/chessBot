import { Chessboard } from "react-chessboard";
import { Chess, DEFAULT_POSITION, Square } from "chess.js";
import { useState } from "react";
import { ResizeEntry, ResizeSensor } from "@blueprintjs/core";

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
    chess?: Chess;
    isWhite?: boolean;
    onMove?: (from: Square, to: Square) => boolean;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { onMove } = props;
    const isWhite = props.isWhite ?? true;
    const chess = props.chess ?? new Chess(DEFAULT_POSITION);

    // Chessboard does not like 0 default height and width for some reason
    const [transform, setTransform] = useState<Transform>({ height: 50, width: 50, top: 0, left: 0 });

    const handleResize = (entries: ResizeEntry[]) => {
        const { height, width } = entries[0].contentRect;
        const transform = computeChessboardTransform(height, width, 0.85);
        setTransform(transform);
    };

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
                        isDraggablePiece={({ sourceSquare }) => chess.get(sourceSquare).color == (isWhite ? "w" : "b")}
                        arePremovesAllowed={true}
                    />
                </div>
            </div>
        </ResizeSensor>
    );
}