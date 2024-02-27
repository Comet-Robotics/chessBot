import { Button, useHotkeys } from "@blueprintjs/core";
import { useCallback, useMemo } from "react";
import { StopRobotMessage } from "../../common/message/drive-robot-message";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";
import { SendMessage } from "../../common/message/message";

interface DriveRobotProps {
    robotId: string;
    sendMessage: SendMessage;
}

function useManualMoveHandler(
    props: DriveRobotProps,
    leftPower: number,
    rightPower: number,
) {
    const handleManualMove = useCallback(
        () =>
            props.sendMessage(
                new DriveRobotMessage(props.robotId, leftPower, rightPower),
            ),
        [props, leftPower, rightPower],
    );
    return handleManualMove;
}

/**
 * A component which can be used to drive an individual robot around.
 */
export function DriveRobot(props: DriveRobotProps) {
    const handleStopMove = useCallback(() => {
        props.sendMessage(new StopRobotMessage(props.robotId));
    }, [props]);

    const handleDriveForward = useManualMoveHandler(props, 1, 1);
    const handleDriveBackward = useManualMoveHandler(props, -1, -1);
    const handleTurnRight = useManualMoveHandler(props, 0.5, -0.5);
    const handleTurnLeft = useManualMoveHandler(props, -0.5, 0.5);

    const hotkeys = useMemo(
        () => [
            {
                combo: "w",
                group: "Debug",
                global: true,
                label: "Drive forward",
                onKeyDown: handleDriveForward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "s",
                group: "Debug",
                global: true,
                label: "Drive backward",
                onKeyDown: handleDriveBackward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "a",
                group: "Debug",
                global: true,
                label: "Turn right",
                onKeyDown: handleTurnRight,
                onKeyUp: handleStopMove,
            },
            {
                combo: "d",
                group: "Debug",
                global: true,
                label: "Turn left",
                onKeyDown: handleTurnLeft,
                onKeyUp: handleStopMove,
            },
            {
                combo: "up",
                group: "Debug",
                global: true,
                label: "Drive forward",
                onKeyDown: handleDriveForward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "down",
                group: "Debug",
                global: true,
                label: "Drive backward",
                onKeyDown: handleDriveBackward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "right",
                group: "Debug",
                global: true,
                label: "Turn right",
                onKeyDown: handleTurnRight,
                onKeyUp: handleStopMove,
            },
            {
                combo: "left",
                group: "Debug",
                global: true,
                label: "Turn left",
                onKeyDown: handleTurnLeft,
                onKeyUp: handleStopMove,
            },
        ],
        [
            handleStopMove,
            handleDriveForward,
            handleDriveBackward,
            handleTurnLeft,
            handleTurnRight,
        ],
    );

    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);
    return (
        <div tabIndex={0} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
            <Button
                icon="arrow-up"
                onMouseUp={handleStopMove}
                onMouseDown={handleDriveForward}
            />
            <br />
            <Button
                icon="arrow-left"
                onMouseUp={handleStopMove}
                onMouseDown={handleTurnLeft}
            />
            <Button
                icon="arrow-down"
                onMouseUp={handleStopMove}
                onMouseDown={handleDriveBackward}
            />
            <Button
                icon="arrow-right"
                onMouseUp={handleStopMove}
                onMouseDown={handleTurnRight}
            />
        </div>
    );
}
