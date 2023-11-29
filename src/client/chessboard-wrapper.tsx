import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";

interface ChessboardWrapperProps {
    chess: Chess;
    isWhite: boolean;
    onMove: (from: Square, to: Square) => boolean;
}

export function ChessboardWrapper(props: ChessboardWrapperProps) {
    const { chess, isWhite, onMove } = props;
    return (<Chessboard
        boardOrientation={isWhite ? "white" : "black"}
        boardWidth={500}
        position={chess.fen()}
        onPieceDrop={onMove}
        isDraggablePiece={({ sourceSquare }) => chess.get(sourceSquare).color == (isWhite ? "w" : "b")}
        arePremovesAllowed={true}
    />);
}