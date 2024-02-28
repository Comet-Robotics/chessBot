import { Navigate, useSearchParams } from "react-router-dom";
import { ClientType } from "../common/client-types";

/**
 * The home route.
 *
 * Redirects to /setup or /lobby automatically based on a route query parameter.
 */
export function Home() {
    const params = useSearchParams()[0];
    let clientType: ClientType | undefined = undefined;
    if (params.has("client-type")) {
        clientType = params.get("client-type") as ClientType;
        localStorage.setItem("client-type", clientType!);
    } else {
        clientType = localStorage.getItem("client-type") as ClientType;
    }
    return (
        <Navigate to={clientType === ClientType.HOST ? "/setup" : "/lobby"} />
    );
}
