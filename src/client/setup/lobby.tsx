import { NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { useNavigate } from "react-router-dom";
import { GameStartedMessage } from "../../common/message/game-message";
import { useSocket } from "../api";

export function Lobby() {
    const navigate = useNavigate();

    useSocket((message) => {
        if (message instanceof GameStartedMessage) {
            navigate("/game");
        }
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
