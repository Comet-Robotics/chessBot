import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ReactElement, forwardRef, useContext } from "react";
import {
    OutsideCorners,
    CenterDot,
    SquareHighlight,
    ClickedPiece,
} from "./svg-components";
import { CustomSquareContext } from "./custom-square-context";

export const customSquareRenderer = forwardRef<
    HTMLDivElement,
    CustomSquareProps
>((props, ref) => {
    const { legalSquares, chess, lastClickedSquare, side, rotate } =
        useContext(CustomSquareContext);

    let selectElement: ReactElement | null = null;
    let lastMoveHighlight: ReactElement | null = null;
    let clickedPieceHighlight: ReactElement | null = null;

    const lastMove = chess.getLastMove();
    if (
        lastMove !== undefined &&
        (lastMove.from === props.square || lastMove.to === props.square)
    ) {
        lastMoveHighlight = (
            <SquareHighlight
                height={props.style.height}
                width={props.style.width}
                rotate={rotate}
            />
        );
    }

    if (
        lastClickedSquare !== undefined &&
        lastClickedSquare === props.square &&
        chess.hasPiece(props.square) &&
        chess.getPieceSide(props.square) === side
    ) {
        clickedPieceHighlight = (
            <ClickedPiece
                height={props.style.height}
                width={props.style.width}
                rotate={rotate}
            />
        );
    }

    if (legalSquares.includes(props.square)) {
        // Square should be highlighted
        if (chess.hasPiece(props.square)) {
            // Square has a piece on it
            selectElement = (
                <OutsideCorners
                    height={props.style.height}
                    width={props.style.width}
                    rotate={rotate}
                />
            );
        } else {
            //Square is empty
            selectElement = <CenterDot />;
        }
    }

    return (
        <div style={props.style} ref={ref}>
            {clickedPieceHighlight}
            {lastMoveHighlight}
            {selectElement}
            {props.children}
        </div>
    );
});
