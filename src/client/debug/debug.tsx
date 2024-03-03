import { Dialog, DialogBody, Spinner } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, useSocket } from "../api";
import { SelectRobot } from "./select-robot";
import { DriveRobot } from "./drive-robot";

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

    let body;
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
                    <DriveRobot
                        sendMessage={sendMessage}
                        robotId={selectedRobotId}
                    />
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
