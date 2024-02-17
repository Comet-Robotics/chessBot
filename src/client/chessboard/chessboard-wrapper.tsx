import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useState } from "react";
import { BoardContainer } from "./board-container";

const CLICK_STYLE = {
    backgroundColor: "green",
};

interface ChessboardWrapperProps {
    /**
     * The chess.js instance displayed by this class.
     */
    chess: Chess;
    /**
     * Whether the perspective is white or not.
     */
    isWhite: boolean;
    /**
     * A callback function this component invokes whenever a move is made.
     */
    onMove: (from: Square, to: Square) => void;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { chess, isWhite, onMove } = props;

    /**
     * The width of the chessboard in pixels.
     */
    const [width, setWidth] = useState<number>(50); // Can't be 0 to avoid bug

    const [lastClickedSquare, setLastClickedSquare] = useState<
        Square | undefined
    >();

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
        <BoardContainer onWidthChange={setWidth}>
            <Chessboard
                boardOrientation={isWhite ? "white" : "black"}
                boardWidth={width}
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
                        lastClickedSquare !== undefined &&
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
                    chess.get(sourceSquare).color === (isWhite ? "w" : "b")
                }
                arePremovesAllowed={false}
                customSquareStyles={customSquareStyles}
            />
        </BoardContainer>
    );
}
