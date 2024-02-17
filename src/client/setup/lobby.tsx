import { NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import useWebSocket from "react-use-websocket";
import { WEBSOCKET_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { StartGameMessage } from "../../common/message/game-message";

export function Lobby() {
    const navigate = useNavigate();
    useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: (msg: MessageEvent) => {
            const message = JSON.parse(msg.data.toString());
            if (message instanceof StartGameMessage) {
                navigate("/game", {
                    state: {
                        gameType: message.gameType,
                        // side: message.side
                    },
                });
            }
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
