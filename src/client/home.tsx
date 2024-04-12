import { Navigate } from "react-router-dom";
import { ClientType } from "../common/client-types";
import { get } from "./api";
import { useQuery } from "@tanstack/react-query";
import { NonIdealState, Spinner } from "@blueprintjs/core";
import { useId } from "react";

/**
 * The home route.
 *
 * Redirects to /setup or /lobby automatically based on a route query parameter.
 */
export function Home() {
    const id = useId();
    const { isPending, data } = useQuery({
        queryKey: ["client-information" + id],
        queryFn: () => get("/client-information"),
        staleTime: Infinity,
    });

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
