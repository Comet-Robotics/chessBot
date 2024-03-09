import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { ChessEngine } from "../../common/chess-engine";
import { ReactElement, forwardRef } from "react";

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
//SVG of the circle used to show legal moves
const Circle = () => {
    return (
        <svg>
            <circle cx="50%" cy="50%" r="15%" fill="green" />
        </svg>
    );
};

//SVG of the highlight used to show a legal capture
const PieceSquare: React.FC<CustomSquareProps> = forwardRef((props, _ref) => {
    return (
        <div
            style={{
                position: "absolute",
                height: props.style.height,
                width: props.style.width,
            }}
        >
            <svg
                viewBox={"0 0 298 298"}
                height={"100%"}
                width={"100%"}
                style={{
                    position: "relative",
                }}
            >
                <path
                    d="M84.52,0H0v84.52C16.49,46.8,46.8,16.49,84.52,0Z"
                    fill="green"
                />
                <path
                    d="M300,84.52V0h-84.52c37.73,16.49,68.03,46.8,84.52,84.52Z"
                    fill="green"
                />
                <path
                    d="M0,215.48v84.52h84.52C46.8,283.51,16.49,253.2,0,215.48Z"
                    fill="green"
                />
                <path
                    d="M215.48,300h84.52v-84.52c-16.49,37.73-46.8,68.03-84.52,84.52Z"
                    fill="green"
                />
            </svg>
        </div>
    );
});
