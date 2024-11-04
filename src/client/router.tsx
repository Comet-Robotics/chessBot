import { createBrowserRouter } from "react-router-dom";
import { Setup } from "./setup/setup";
import { Debug } from "./debug/debug";
import { Game } from "./game/game";
import { Lobby } from "./setup/lobby";
import { Home } from "./home";

export const router = createBrowserRouter([
    {
        path: "/home",
        element: <Home />,
    },
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
        path: "/game",
        element: <Game />,
    },
]);
