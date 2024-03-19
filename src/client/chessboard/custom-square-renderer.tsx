import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ChessEngine } from "../../common/chess-engine";
import { ReactElement } from "react";
import { CenterDot, OutsideCorners } from "./svg-components";

export function getCustomSquareRenderer(
    legalSquares: string[],
    chess: ChessEngine,
) {
    return (props: CustomSquareProps) => {
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
    };
}
