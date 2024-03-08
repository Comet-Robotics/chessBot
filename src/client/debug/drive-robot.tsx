import { Button, useHotkeys, Slider } from "@blueprintjs/core";
import { useCallback, useEffect, useMemo, useState, Dispatch } from "react";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";
import { SendMessage } from "../../common/message/message";

interface DriveRobotProps {
    robotId: string;
    sendMessage: SendMessage;
}

function useManualMoveHandler(
    //useManualMoveHandler takes in the state powers and the setPowers functions, and returns a function that sets the power levels in the state.
    leftPower: number,
    rightPower: number,
    setLeftPower: Dispatch<number>,
    setRightPower: Dispatch<number>,
) {
    const handleManualMove = useCallback(() => {
        setLeftPower(leftPower);
        setRightPower(rightPower);
    }, [leftPower, rightPower, setLeftPower, setRightPower]);
    return handleManualMove;
}

/**
 * A component which can be used to drive an individual robot around.
 */
export function DriveRobot(props: DriveRobotProps) {
    //state variable for handling the power levels of the robot
    const [leftPower, setLeftPower] = useState(0);
    const [rightPower, setRightPower] = useState(0);
    const [prevPadLeft, setPrevPadLeft] = useState(0);
    const [prevPadRight, setPrevPadRight] = useState(0);
    const [prevLeft, setPrevLeft] = useState(0);
    const [prevRight, setPrevRight] = useState(0);

    //useEffect hook to send the power levels to the robot if there is a change in the power levels
    useEffect(() => {
        if (prevLeft === leftPower && prevRight === rightPower) {
            return;
        }
        props.sendMessage(
            new DriveRobotMessage(props.robotId, leftPower, rightPower),
        );
        setPrevLeft(leftPower);
        setPrevRight(rightPower);
    }, [props, leftPower, rightPower, prevLeft, prevRight]);

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
                        prevPadLeft === 0 &&
                        prevPadRight === 0 &&
                        padLeftPower === 0 &&
                        padRightPower === 0
                    ) {
                        continue;
                    }
                    setLeftPower(padLeftPower);
                    setRightPower(padRightPower);
                    setPrevPadLeft(padLeftPower);
                    setPrevPadRight(padRightPower);
                }
            }
        };

        const gamepadPollingInterval = setInterval(handleGamepadInput, 50);

        return () => {
            clearInterval(gamepadPollingInterval);
        };
    }, [props, prevPadLeft, prevPadRight]);

    const handleStopMove = useCallback(() => {
        setLeftPower(0);
        setRightPower(0);
    }, []);

    const handleDriveForward = useManualMoveHandler(
        1,
        1,
        setLeftPower,
        setRightPower,
    );
    const handleDriveBackward = useManualMoveHandler(
        -1,
        -1,
        setLeftPower,
        setRightPower,
    );
    const handleTurnRight = useManualMoveHandler(
        0.5,
        -0.5,
        setLeftPower,
        setRightPower,
    );
    const handleTurnLeft = useManualMoveHandler(
        -0.5,
        0.5,
        setLeftPower,
        setRightPower,
    );

    const handleLeftPowerChange = (value: number) => {
        setLeftPower(value);
    };
    const handleRightPowerChange = (value: number) => {
        setRightPower(value);
    };

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
                value={leftPower}
                initialValue={0}
                onChange={handleLeftPowerChange}
                vertical
            />
            <Slider
                min={-1}
                max={1}
                stepSize={0.01}
                value={rightPower}
                initialValue={0}
                onChange={handleRightPowerChange}
                vertical
            />
        </div>
    );
}
