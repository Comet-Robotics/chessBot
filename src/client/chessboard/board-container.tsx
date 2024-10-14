import { ResizeEntry, ResizeSensor } from "@blueprintjs/core";
import { PropsWithChildren, useState } from "react";
import { Transform, computeChessboardTransform } from "./board-transform";
import { Side } from "../../common/game-types";

interface BoardContainerProps extends PropsWithChildren {
    side:Side;
    onWidthChange: (width: number) => void;
}

export function BoardContainer(props: BoardContainerProps) {
    const [transform, setTransform] = useState<Transform | undefined>();

    const handleResize = (entries: ResizeEntry[]) => {
        const { height, width } = entries[0].contentRect;
        const transform = computeChessboardTransform(height, width, 0.85);
        props.onWidthChange(transform.width);
        setTransform(transform);
    };

    return (
        <ResizeSensor onResize={handleResize}>
            <div id="chess-container">
                <div id="chessboard" style={{ ...transform, transform:props.side===Side.SPECTATOR?'rotate('+Math.random()*360+'deg)':''}}>
                    {props.children}
                </div>
            </div>
        </ResizeSensor>
    );
}
