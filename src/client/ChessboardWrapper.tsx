import { Chessboard } from "react-chessboard";

interface ChessboardWrapperProps {
    position: any,
}

export function ChessboardWrapper(props: ChessboardWrapperProps) {
    return (<Chessboard
        boardWidth={500}
    // position={props.position}
    />);
}