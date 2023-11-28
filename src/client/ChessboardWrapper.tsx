import { Chessboard } from "react-chessboard";

interface ChessboardWrapperProps {
    position: any,
}

export function ChessboardWrapper(props: ChessboardWrapperProps) {
    return (<Chessboard
        id="BasicBoard"
    // position={props.position}
    />);
}