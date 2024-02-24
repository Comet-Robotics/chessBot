import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import { useState } from "react";
import { BoardContainer } from "./board-container";
import { ChessEngine } from "../../common/chess-engine";
import { Side, PieceType } from "../../common/game-types";

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
    onMove: (from: Square, to: Square, promotionPiece?: PieceType) => void;
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

    const [isPromoting, setIsPromoting] = useState(false);

    // Maps squares to style objects
    const customSquareStyles: { [square: string]: Object } = {};
    let legalSquares: string[] | undefined = undefined;
    if (lastClickedSquare !== undefined) {
        legalSquares = chess.getLegalSquares(lastClickedSquare);
        legalSquares.forEach((square) => {
            customSquareStyles[square] = CLICK_STYLE;
        });
    }

    /**
     * Returns true if a move is legal, and false otherwise.
     */
    const isLegalMove = (from: Square, to: Square): boolean => {
        return chess.getLegalSquares(from).includes(to);
    };

    const isPromotion = (from: Square, to: Square, piece: PieceType) => {
        if (piece !== PieceType.PAWN) {
            return false;
        } else if (side === Side.WHITE) {
            return from[1] === "7" && to[1] === "8";
        }
        return from[1] === "2" && to[1] === "1";
    };

    const doMove = (
        from: Square,
        to: Square,
        promotionPiece?: PieceType,
    ): void => {
        onMove(from, to, promotionPiece);
        setLastClickedSquare(undefined);
    };

    return (
        <BoardContainer onWidthChange={setWidth}>
            <Chessboard
                boardOrientation={side === Side.WHITE ? "white" : "black"}
                boardWidth={width}
                position={chess.fen}
                onPromotionCheck={(
                    from: Square,
                    to: Square,
                    pieceAndSide: string,
                ) => {
                    const piece = pieceAndSide[1].toLowerCase() as PieceType;
                    const promoting = isPromotion(from, to, piece);
                    setIsPromoting(promoting);
                    return promoting;
                }}
                onPieceDrop={(
                    from: Square,
                    to: Square,
                    pieceAndSide: string,
                ): boolean => {
                    const piece: PieceType =
                        pieceAndSide[1].toLowerCase() as PieceType;
                    if (isLegalMove(from, to)) {
                        doMove(from, to, isPromoting ? piece : undefined);
                        setIsPromoting(false);
                        return true;
                    }
                    return false;
                }}
                onPieceDragBegin={(_, square: Square) => {
                    if (square !== lastClickedSquare) {
                        setLastClickedSquare(undefined);
                    }
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
