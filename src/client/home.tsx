import { Navigate } from "react-router-dom";
import { get, useEffectQuery } from "./api";
import { NonIdealState, Spinner } from "@blueprintjs/core";

/**
 * The home route.
 *
 * Redirects to /game or /lobby automatically based on a route query parameter.
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

    return <Navigate to={data.isGameActive ? "/game" : "/lobby"} />;
}
