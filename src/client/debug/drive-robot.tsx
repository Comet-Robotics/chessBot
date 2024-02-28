import { Button, useHotkeys } from "@blueprintjs/core";
import { useCallback, useEffect, useMemo } from "react";
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

    useEffect(() => {
        if (!navigator.getGamepads) {
            console.log("Gamepad API not supported");
            return;
        }
        const handleGamepadInput = () => {
            for (const gamepad of navigator.getGamepads()) {
                if (gamepad) {
                    // tank-style drive
                    const leftPower = gamepad.axes[1] * -1;
                    const rightPower = gamepad.axes[3] * -1;
                    props.sendMessage(
                        new DriveRobotMessage(
                            props.robotId,
                            leftPower,
                            rightPower,
                        ),
                    );
                }
            }
        };

        const gamepadPollingInterval = setInterval(handleGamepadInput, 50);

        return () => {
            clearInterval(gamepadPollingInterval);
        };
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
            <p>
                Control this robot using the buttons below, arrow keys, WASD, or
                a connected gamepad.
            </p>
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
            <br />
            <Button icon="stop" onClick={handleStopMove}>
                Stop
            </Button>
        </div>
    );
}
