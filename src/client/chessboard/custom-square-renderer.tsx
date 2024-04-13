import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ReactElement, forwardRef, useContext } from "react";
import { OutsideCorners, CenterDot } from "./svg-components";
import { CustomSquareContext } from "./custom-square-context";

export const customSquareRenderer = forwardRef<
    HTMLDivElement,
    CustomSquareProps
>((props, ref) => {
    const { legalSquares, chess } = useContext(CustomSquareContext);
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
        <div style={props.style} ref={ref}>
            {selectedElement}
            {props.children}
        </div>
    );
});
