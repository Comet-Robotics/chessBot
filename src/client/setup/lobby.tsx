import { NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import useWebSocket from "react-use-websocket";
import { WEBSOCKET_URL } from "../api";

export function Lobby() {
    useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: (msg: MessageEvent) => {
            const message = JSON.parse(msg.data.toString());
        },
    });

    return (
        <SetupBase>
            <NonIdealState
                title="Waiting For Game to Start"
                icon={<Spinner intent="primary" />}
            />
        </SetupBase>
    );
}
