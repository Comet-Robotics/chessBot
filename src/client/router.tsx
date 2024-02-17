import { createBrowserRouter } from "react-router-dom";
import { Setup } from "./setup/setup";
import { Debug } from "./debug/debug";
import { Game } from "./game/game";
import { Puzzle } from "./puzzle/puzzle";
import { Lobby } from "./setup/lobby";

export const router = createBrowserRouter([
    {
        path: "/debug",
        element: <Debug />,
    },
    {
        path: "/setup",
        element: <Setup />,
    },
    {
        path: "/lobby",
        element: <Lobby />,
    },
    {
        path: "/puzzle",
        element: <Puzzle />,
    },
    {
        path: "/game",
        element: <Game />,
    },
]);
