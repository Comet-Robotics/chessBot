import { Navigate } from "react-router-dom";
import { ClientType } from "../common/client-types";
import { get, useEffectQuery } from "./api";
import { NonIdealState, Spinner } from "@blueprintjs/core";

/**
 * The home route.
 *
 * Redirects to /setup or /lobby automatically based on a route query parameter.
 */
export function Home() {
    const { isPending, data } = useEffectQuery("client-information", () =>
        get("/client-information"),
    );

    if (isPending) {
        return (
            <NonIdealState
                icon={<Spinner intent="primary" />}
                title="Loading..."
            />
        );
    }

    let to: string;
    if (data.isGameActive) {
        to = "/game";
    } else {
        to = data.clientType === ClientType.HOST ? "/setup" : "/lobby";
    }
    return <Navigate to={to} />;
}
