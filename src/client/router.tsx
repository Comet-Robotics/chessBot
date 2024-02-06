import { Navigate, createBrowserRouter } from "react-router-dom";
import { Setup } from "./pages/setup";
import { Debug } from "./debug/debug";
import { Game } from "./pages/game";
import { Puzzle } from "./pages/puzzle";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/setup" />,
    },
    {
        path: "setup",
        element: <Setup />,
        children: [
            {
                path: "debug",
                element: <Debug />,
            },
        ],
    },
    {
        path: "puzzle",
        element: <Puzzle />,
    },
    {
        path: "game",
        element: <Game />,
    },
]);
