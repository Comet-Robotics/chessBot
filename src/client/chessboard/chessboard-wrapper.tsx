import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import { useState } from "react";
import { BoardContainer } from "./board-container";
import { ChessEngine } from "../../common/chess-engine";
import { Move } from "../../common/game-types";
import { Side, PieceType } from "../../common/game-types";
import { customSquareRenderer } from "./custom-square-renderer";
import { CustomSquareContext } from "./custom-square-context";
import config from "../../server/api/bot-server-config.json";

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
    onMove: (move: Move) => void;
}

export function ChessboardWrapper(props: ChessboardWrapperProps): JSX.Element {
    const { chess, side, onMove } = props;

    /**
     * The width of the chessboard in pixels.
     */
    const [width, setWidth] = useState<number | undefined>();

    const [lastClickedSquare, setLastClickedSquare] = useState<
        Square | undefined
    >();

    const [isPromoting, setIsPromoting] = useState(false);

    const [manualPromotionSquare, setManualPromotionSquare] = useState<
        Square | undefined
    >();

    // Maps squares to style objects
    let legalSquares: string[] = [];
    if (lastClickedSquare !== undefined) {
        legalSquares = chess.getLegalSquares(lastClickedSquare);
    }

    /**
     * Returns true if a move is legal, and false otherwise.
     */
    const isLegalMove = (from: Square, to: Square): boolean => {
        return (
            chess.getLegalSquares(from).includes(to) &&
            chess.getPieceSide(from) === side
        );
    };

    const doMove = (move: Move): void => {
        onMove(move);
        setLastClickedSquare(undefined);
    };

    // Don't render while width isn't set
    //let rot = side === Side.SPECTATOR ? 1 : 0;
    //let rot = side === Side.SPECTATOR ? Math.random() * 360 : 0;

    //if ("geolocation" in navigator) {
    const rot = navigator.geolocation.watchPosition((pos): number => {
        console.log(pos.coords);
        if (pos.coords.latitude) {
            if (side === Side.SPECTATOR) {
                const d_lat = pos.coords.latitude - config["latitude"];
                const d_long = pos.coords.longitude - config["longitude"];
                console.log(pos.coords.latitude - config["latitude"]);
                console.log(pos.coords.longitude - config["longitude"]);
                console.log("here" + (d_long/d_lat));
                //return Math.atan(d_long / d_lat*(180/Math.PI));
                return 90;
            }
        }
        return 0;
    });
    //}
    let chessboard: JSX.Element | null = null;

    const rotateBaseStyle = {
        transform:
            side === Side.SPECTATOR ? "rotate(" + (360 - rot) + "deg)" : "",
    };
    const squares = [
        "a8",
        "b8",
        "c8",
        "d8",
        "e8",
        "f8",
        "g8",
        "h8",
        "a7",
        "b7",
        "c7",
        "d7",
        "e7",
        "f7",
        "g7",
        "h7",
        "a6",
        "b6",
        "c6",
        "d6",
        "e6",
        "f6",
        "g6",
        "h6",
        "a5",
        "b5",
        "c5",
        "d5",
        "e5",
        "f5",
        "g5",
        "h5",
        "a4",
        "b4",
        "c4",
        "d4",
        "e4",
        "f4",
        "g4",
        "h4",
        "a3",
        "b3",
        "c3",
        "d3",
        "e3",
        "f3",
        "g3",
        "h3",
        "a2",
        "b2",
        "c2",
        "d2",
        "e2",
        "f2",
        "g2",
        "h2",
        "a1",
        "b1",
        "c1",
        "d1",
        "e1",
        "f1",
        "g1",
        "h1",
    ];
    const things = {};
    for (let x = 0; x < squares.length; x++) {
        things[squares[x]] = rotateBaseStyle;
    }
    if (width !== undefined) {
        chessboard = (
            <Chessboard
                boardOrientation={side === Side.WHITE ? "white" : "black"}
                boardWidth={width}
                position={chess.fen}
                onPromotionCheck={(from: Square, to: Square) => {
                    const promoting = chess.checkPromotion(from, to);
                    setIsPromoting(promoting);
                    return promoting;
                }}
                showPromotionDialog={manualPromotionSquare !== undefined}
                promotionToSquare={manualPromotionSquare}
                onPieceDrop={(
                    from: Square,
                    to: Square,
                    pieceAndSide: string,
                ): boolean => {
                    const piece: PieceType =
                        pieceAndSide[1].toLowerCase() as PieceType;
                    if (isLegalMove(from, to)) {
                        if (manualPromotionSquare !== undefined) {
                            doMove({
                                // `from` is undefined in manual promotion flow
                                from: lastClickedSquare!,
                                // `to: manualPromotionSquare` is also valid
                                to,
                                promotion: piece,
                            });
                            setManualPromotionSquare(undefined);
                        } else {
                            doMove({
                                from,
                                to,
                                // Include piece only if promoting
                                promotion: isPromoting ? piece : undefined,
                            });
                        }
                        // Reset state
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
                    setManualPromotionSquare(undefined);

                    // Protects the type of lastClickedSquare, and is true when the clicked square is legal
                    const isSquareLegalMove =
                        lastClickedSquare !== undefined &&
                        isLegalMove(lastClickedSquare, square);

                    if (isSquareLegalMove) {
                        if (chess.checkPromotion(lastClickedSquare, square)) {
                            // Manually show promotion dialog
                            setManualPromotionSquare(square);
                        } else {
                            doMove({
                                from: lastClickedSquare,
                                to: square,
                            });
                        }
                        // Square is clicked again
                    } else if (lastClickedSquare === square) {
                        // Deselect square
                        setLastClickedSquare(undefined);
                    } else {
                        // Select clicked square
                        setLastClickedSquare(square);
                    }
                }}
                isDraggablePiece={({ piece }) => {
                    // piece is color and piece type, e.g. "wP"
                    return piece[0] === side;
                }}
                arePremovesAllowed={false}
                customSquare={customSquareRenderer}
                customSquareStyles={things}
            />
        );
    }

    return (
        <BoardContainer side={side} onWidthChange={setWidth} rotate={rot}>
            <CustomSquareContext.Provider
                value={{
                    legalSquares,
                    chess,
                    lastClickedSquare,
                    side,
                    rotate: rot,
                }}
            >
                {chessboard}
            </CustomSquareContext.Provider>
        </BoardContainer>
    );
}
