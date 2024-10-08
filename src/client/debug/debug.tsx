import { Dialog, DialogBody, Spinner } from "@blueprintjs/core";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, useSocket } from "../api";
import { SelectRobot } from "./select-robot";
import { DriveRobot } from "./drive-robot";
import { SetRobotVariable } from "./set-robot-variable";

/**
 * A debug menu which can be used to manually control individual robots.
 */
export function Debug() {
    const [robotIds, setRobotIds] = useState<string[] | undefined>();
    const [selectedRobotId, setSelectedRobotId] = useState<
        string | undefined
    >();
    const navigate = useNavigate();

    const sendMessage = useSocket();

    useEffect(() => {
        const fetchIds = async () => {
            const response = await get("/get-ids");
            setRobotIds(response.ids);
        };
        fetchIds();
    }, [setRobotIds]);

    let body: ReactNode;
    if (robotIds === undefined) {
        body = <Spinner intent="primary" />;
    } else {
        body = (
            <>
                <SelectRobot
                    robotIds={robotIds}
                    selectedRobotId={selectedRobotId}
                    onRobotIdSelected={setSelectedRobotId}
                />
                {selectedRobotId === undefined ? null : (
                    <>
                        <SetRobotVariable
                            sendMessage={sendMessage}
                            robotId={selectedRobotId}
                        />
                        <DriveRobot
                            sendMessage={sendMessage}
                            robotId={selectedRobotId}
                        />
                    </>
                )}
            </>
        );
    }

    return (
        <Dialog
            isOpen
            canOutsideClickClose={false}
            onClose={() => navigate("/home")}
            title="Debug"
        >
            <DialogBody>{body}</DialogBody>
        </Dialog>
    );
}
