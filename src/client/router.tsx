import { Navigate, createBrowserRouter } from "react-router-dom";
import { Setup } from "./setup/setup";
import { Debug } from "./debug/debug";
import { Game } from "./game/game";
import { Puzzle } from "./puzzle/puzzle";
import { SetupComputerGame } from "./game/setup-computer-game";
import { SetupHumanGame } from "./game/setup-human-game";
import { SetupClientGame } from "./game/setup-client-game";
import { SetupHostGame } from "./game/setup-host-game";

export const router = createBrowserRouter([
    {
        path: "/debug",
        element: <Debug />,
    },
    {
        path: "/host",
        children: [
            {
                path: "setup",
                element: <Setup />,
            },
            {
                path: "puzzle",
                element: <Puzzle />,
            },
            {
                path: "game",
                element: <Game />,
            },
        ],
    },
    {
        path: "/client",
        children: [
            {
                path: "setup",
                // element: <Wait/>
            },
            {
                path: "game",
                element: <Game />,
            },
        ],
    },
]);
