import { NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../api";

export function Lobby() {
    const navigate = useNavigate();

    useSocket((message) => {
        if (message.type === "GAME_START") {
            navigate("/game", {
                state: {
                    gameType: message.gameType,
                    side: message.side,
                },
            });
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
