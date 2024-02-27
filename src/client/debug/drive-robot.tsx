import { Button, useHotkeys } from "@blueprintjs/core";
import React, { createRef, useCallback, useMemo } from "react";
import { StopRobotMessage } from "../../common/message/drive-robot-message";
import { DriveRobotMessage } from "../../common/message/drive-robot-message";
import { SendMessage } from "../../common/message/message";

interface DriveRobotProps {
    robotId: string;
    sendMessage: SendMessage;
}
/**
 * A component which can be used to drive an individual robot around.
 */
export function DriveRobot(props: DriveRobotProps) {
    const handleStopMove = () => {
        props.sendMessage(new StopRobotMessage(props.robotId));
    };

    const getManualMoveHandler = (
        leftPower: number,
        rightPower: number,
    ): (() => void) => {
        const handleManualMove = () => {
            props.sendMessage(
                new DriveRobotMessage(props.robotId, leftPower, rightPower),
            );
        };
        return handleManualMove;
    };

    const handleDriveForward = getManualMoveHandler(1, 1);
    const handleDriveBackward = getManualMoveHandler(-1, -1);
    const handleDriveRight = getManualMoveHandler(0.5, -0.5);
    const handleDriveLeft = getManualMoveHandler(-0.5, 0.5);

    /* Declare other handlers here */

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
                label: "Drive Right",
                onKeyDown: handleDriveRight,
                onKeyUp: handleStopMove,
            },
            {
                combo: "d",
                group: "Debug",
                global: true,
                label: "Drive left",
                onKeyDown: handleDriveLeft,
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
                label: "Drive Right",
                onKeyDown: handleDriveRight,
                onKeyUp: handleStopMove,
            },
            {
                combo: "left",
                group: "Debug",
                global: true,
                label: "Drive left",
                onKeyDown: handleDriveLeft,
                onKeyUp: handleStopMove,
            },

            // ... declare other key combos for wasd and arrow keys (see documentation)
        ],
        [
            handleStopMove,
            handleDriveForward,
            handleDriveBackward,
            handleDriveLeft,
            handleDriveRight,
        ],
    );

    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);
    return (
        <div tabIndex={0} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
            <Button
                icon="arrow-up"
                onMouseUp={handleStopMove}
                onMouseDown={getManualMoveHandler(1, 1)}
            />
            <br />
            <Button
                icon="arrow-left"
                onMouseUp={handleStopMove}
                onMouseDown={getManualMoveHandler(-0.5, 0.5)}
            />
            <Button
                icon="arrow-down"
                onMouseUp={handleStopMove}
                onMouseDown={getManualMoveHandler(-1, -1)}
            />
            <Button
                icon="arrow-right"
                onMouseUp={handleStopMove}
                onMouseDown={getManualMoveHandler(0.5, -0.5)}
            />
        </div>
    );
}
