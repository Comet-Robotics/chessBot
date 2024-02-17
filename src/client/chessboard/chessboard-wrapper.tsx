import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import { useState } from "react";
import { BoardContainer } from "./board-container";
import { ChessEngine } from "../../common/chess-engine";
import { Side } from "../../common/types";

const CLICK_STYLE = {
    backgroundColor: "green",
};

interface ChessboardWrapperProps {
    /**
     * The chess.js instance displayed by this class.
     */
    chess: ChessEngine;

    /**
     * The side of the current player.
     */
    side: Side;
    /**
     * A callback function this component invokes whenever a move is made.
     */
    onMove: (from: Square, to: Square) => void;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { chess, side, onMove } = props;

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
        chess.getLegalSquares(lastClickedSquare).forEach((square) => {
            customSquareStyles[square] = CLICK_STYLE;
        });
    }

    /**
     * Returns true if a move is legal, and false otherwise.
     */
    const isLegalMove = (from: Square, to: Square): boolean => {
        const legalSquares = chess.getLegalSquares(from);
        return legalSquares.includes(to);
    };

    const doMove = (from: Square, to: Square): void => {
        onMove(from, to);
        setLastClickedSquare(undefined);
    };

    return (
        <BoardContainer onWidthChange={setWidth}>
            <Chessboard
                boardOrientation={side === Side.WHITE ? "white" : "black"}
                boardWidth={width}
                position={chess.fen}
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
                isDraggablePiece={({ piece }) => {
                    return piece[0] === side;
                }}
                arePremovesAllowed={false}
                customSquareStyles={customSquareStyles}
            />
        </BoardContainer>
    );
}
