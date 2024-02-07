import { Button } from "@blueprintjs/core";
import { SendMessage } from "react-use-websocket";
import { StopRobotMessage } from "../../common/drive-robot-message";
import { DriveRobotMessage } from "../../common/drive-robot-message";

interface DriveRobotProps {
    robotId: string;
    sendMessage: SendMessage;
}

/**
 * A component which can be used to drive an individual robot around.
 */
export function DriveRobot(props: DriveRobotProps) {
    const handleStopMove = () => {
        props.sendMessage(new StopRobotMessage(props.robotId).toJson());
    };

    const getManualMoveHandler = (
        leftPower: number,
        rightPower: number,
    ): (() => void) => {
        const handleManualMove = () => {
            props.sendMessage(
                new DriveRobotMessage(
                    props.robotId,
                    leftPower,
                    rightPower,
                ).toJson(),
            );
        };
        return handleManualMove;
    };

    return (
        <>
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
        </>
    );
}
