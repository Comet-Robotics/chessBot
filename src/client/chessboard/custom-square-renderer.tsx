import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ChessEngine } from "../../common/chess-engine";
import { ReactElement, forwardRef } from "react";
import { Circle, PieceSquare } from "./svg-components";

export function getCustomSquareRenderer(
    legalSquares: string[],
    chess: ChessEngine,
) {
    return forwardRef((props: CustomSquareProps, ref) => {
        let selectedElement: ReactElement | null = null;

        if (legalSquares.includes(props.square)) {
            // Square should be highlighted
            if (chess.getPiece(props.square) !== undefined) {
                // Square has a piece on it
                selectedElement = (
                    <PieceSquare
                        square={props.square}
                        squareColor={props.squareColor}
                        style={props.style}
                        ref={ref}
                    >
                        {props.children}
                    </PieceSquare>
                );
            } else {
                //Square is empty
                selectedElement = <Circle />;
            }
        }
        return (
            <div style={props.style}>
                {selectedElement}
                {props.children}
            </div>
        );
    });
}
