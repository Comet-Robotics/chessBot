import { Dialog, DialogBody, Spinner } from "@blueprintjs/core";
import { ReactNode, useEffect, useState } from "react";
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

    //helper functions
    const navigate = useNavigate();
    const sendMessage = useSocket();

    //get all the registered robots
    useEffect(() => {
        const fetchIds = async () => {
            const response = await get("/get-ids");
            setRobotIds(response.ids);
        };
        fetchIds();
    }, [setRobotIds]);

    //create the select and move buttons
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
                    <div>
                        <DriveRobot
                            sendMessage={sendMessage}
                            robotId={selectedRobotId}
                        />
                    </div>
                )}
            </>
        );
    }

    //return the dialog
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
