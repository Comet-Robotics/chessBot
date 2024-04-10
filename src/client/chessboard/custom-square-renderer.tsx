import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ChessEngine } from "../../common/chess-engine";
import { ReactElement, forwardRef } from "react";
import { CenterDot, OutsideCorners } from "./svg-components";

/**
 * Returns a function which, when called, can be used to render a square.
 * Note this function masquerades as a React component for react chessboard purposes.
 */
export function getCustomSquareRenderer(
    legalSquares: string[],
    chess: ChessEngine,
) {
    // Since React chessboard treats this function as a Component, the existence of the ref key triggers an error
    // We wrap with forwardRef to suppress this error
    return forwardRef((props: CustomSquareProps, _ref) => {
        let selectedElement: ReactElement | null = null;

        if (legalSquares.includes(props.square)) {
            // Square should be highlighted
            if (chess.getPiece(props.square) !== undefined) {
                // Square has a piece on it
                selectedElement = (
                    <OutsideCorners
                        height={props.style.height}
                        width={props.style.width}
                    />
                );
            } else {
                //Square is empty
                selectedElement = <CenterDot />;
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
