import { NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { useNavigate } from "react-router-dom";
import { GameStartedMessage } from "../../common/message/game-message";
import { useSocket, useEffectQuery, get } from "../api";
import { ClientType } from "../../common/client-types";
import { Navigate } from "react-router-dom";

/**
 * check for an active game and waits for one or forwards to setup
 * 
 * @returns - a setup base with the loading screen or a redirect to /game
 */
export function Lobby() {
    const { isPending, data } = useEffectQuery("client-information", () =>
        get("/client-information"),
    );
    const navigate = useNavigate();

    useSocket((message) => {
        if (message instanceof GameStartedMessage) {
            navigate("/game");
        }
    });

    if (isPending) {
        return (
            <SetupBase>
                <NonIdealState
                    icon={<Spinner intent="primary" />}
                    title="Loading..."
                />
            </SetupBase>
        );
    }

    if (data.clientType === ClientType.HOST) {
        return <Navigate to="/setup" />;
    } else {
        return (
            <SetupBase>
                <NonIdealState
                    title="Waiting For Game to Start"
                    icon={<Spinner intent="primary" />}
                />
            </SetupBase>
        );
    }
}
