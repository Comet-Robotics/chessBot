import { Navigate, createBrowserRouter } from "react-router-dom";
import { Setup } from "./setup";
import { Debug } from "./debug";
import { Game } from "./game";
import { Puzzle } from "./puzzle";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/setup" />
    },
    {
        path: "setup",
        element: <Setup />,
        children: [
            {
                path: "debug",
                element: <Debug />
            }
        ]
    },
    {
        path: "puzzle",
        element: <Puzzle />
    },
    {
        path: "game",
        element: <Game />
    }
]);