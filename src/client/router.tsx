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
        children: [
            {
                path: "debug",
                element: <Debug />,
            },
        ],
    },
    {
        path: "setup-computer-game",
        element: <SetupComputerGame />,
    },
    {
        path: "setup-human-game",
        element: <SetupHumanGame />,
    },
    {
        path: "setup-host-game",
        element: <SetupHostGame />,
    },
    {
        path: "setup-client-game",
        element: <SetupClientGame />,
    }
]);
