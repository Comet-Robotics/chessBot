import { Navigate } from "react-router-dom";
import { ClientType } from "../common/client-types";
import { get } from "./api";
import { useQuery } from "@tanstack/react-query";
import { NonIdealState, Spinner } from "@blueprintjs/core";

/**
 * The home route.
 *
 * Redirects to /setup or /lobby automatically based on a route query parameter.
 */
export function Home() {
    // TODO: Call /client-information and redirect based on result
    const { isPending, data } = useQuery({
        queryKey: ["client-information"],
        queryFn: () => get("/client-information"),
    });

    if (isPending) {
        return <NonIdealState icon={<Spinner />} title="Loading..." />;
    }

    let to: string;
    if (data.isGameActive === "true") {
        to = "/game";
    } else {
        to = data.clientType === ClientType.HOST ? "/setup" : "/lobby";
    }
    return <Navigate to={to} />;
}
