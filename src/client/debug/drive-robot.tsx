import { Button, useHotkeys, Slider } from "@blueprintjs/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";
import { SendMessage } from "../../common/message/message";

interface DriveRobotProps {
    robotId: string;
    sendMessage: SendMessage;
}

const approxeq = (v1: number, v2: number, epsilon = 0.01) =>
    Math.abs(v1 - v2) <= epsilon;

/**
 * A component which can be used to drive an individual robot around.
 */
export function DriveRobot(props: DriveRobotProps) {
    //state variable for handling the power levels of the robot
    const [power, setPower] = useState({ left: 0, right: 0 });
    const [prevPad, setPrevPad] = useState({ left: 0, right: 0 });
    const [prev, setPrev] = useState({ left: 0, right: 0 });

    //useEffect hook to send the power levels to the robot if there is a change in the power levels
    useEffect(() => {
        if (
            approxeq(prev.left, power.left) &&
            approxeq(prev.right, power.right)
        ) {
            return;
        }
        props.sendMessage(
            new DriveRobotMessage(props.robotId, power.left, power.right),
        );
        setPrev({ left: power.left, right: power.right });
    }, [props, power.left, power.right, prev]);

    useEffect(() => {
        if (!navigator.getGamepads) {
            console.log("Gamepad API not supported");
            return;
        }
        const handleGamepadInput = () => {
            for (const gamepad of navigator.getGamepads()) {
                if (gamepad) {
                    // tank-style drive
                    // deadzone and scaling to be more sensitive at lower values
                    const DEADZONE = 0.15;
                    let padLeftPower = gamepad.axes[1] * -1;
                    let padRightPower = gamepad.axes[3] * -1;
                    if (Math.abs(padLeftPower) < DEADZONE) padLeftPower = 0;
                    if (Math.abs(padRightPower) < DEADZONE) padRightPower = 0;
                    padLeftPower =
                        Math.sign(padLeftPower) * Math.pow(padLeftPower, 2);
                    padRightPower =
                        Math.sign(padRightPower) * Math.pow(padRightPower, 2);
                    if (
                        prevPad.left === 0 &&
                        prevPad.right === 0 &&
                        padLeftPower === 0 &&
                        padRightPower === 0
                    ) {
                        continue;
                    }
                    setPower({ left: padLeftPower, right: padRightPower });
                    setPrevPad({ left: padLeftPower, right: padRightPower });
                }
            }
        };

        const gamepadPollingInterval = setInterval(handleGamepadInput, 50);

        return () => {
            clearInterval(gamepadPollingInterval);
        };
    }, [props, prevPad]);

    const handleStopMove = useCallback(() => {
        setPower({ left: 0, right: 0 });
    }, []);

    const handleDriveForward = useCallback(() => {
        setPower({ left: 1, right: 1 });
    }, []);
    const handleDriveBackward = useCallback(() => {
        setPower({ left: -1, right: -1 });
    }, []);
    const handleTurnRight = useCallback(() => {
        setPower({ left: 0.5, right: -0.5 });
    }, []);
    const handleTurnLeft = useCallback(() => {
        setPower({ left: -0.5, right: 0.5 });
    }, []);

    const handleLeftPowerChange = useCallback(
        (value: number) => {
            setPower({ left: value, right: power.right });
        },
        [power.right],
    );
    const handleRightPowerChange = useCallback(
        (value: number) => {
            setPower({ left: power.left, right: value });
        },
        [power.left],
    );

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
                global: false,
                label: "Drive forward",
                onKeyDown: handleDriveForward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "down",
                group: "Debug",
                global: false,
                label: "Drive backward",
                onKeyDown: handleDriveBackward,
                onKeyUp: handleStopMove,
            },
            {
                combo: "right",
                group: "Debug",
                global: false,
                label: "Turn right",
                onKeyDown: handleTurnRight,
                onKeyUp: handleStopMove,
            },
            {
                combo: "left",
                group: "Debug",
                global: false,
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
                a connected gamepad. If arrow keys are not working, make sure
                controls are in focus.
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
            <Slider
                min={-1}
                max={1}
                stepSize={0.01}
                value={power.left}
                initialValue={0}
                onChange={handleLeftPowerChange}
                vertical
            />
            <Slider
                min={-1}
                max={1}
                stepSize={0.01}
                value={power.right}
                initialValue={0}
                onChange={handleRightPowerChange}
                vertical
            />
        </div>
    );
}
