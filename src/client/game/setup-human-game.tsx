import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { SetupBase } from "../setup/setup-base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/game-type";

export function SetupHumanGame() {
    const [difficulty, setDifficulty] = useState(3);
    const navigate = useNavigate();
    fetch("/human", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        }
    }).then(response => response.json()).then(data => {
        console.log(data.playerType);
        if (data.playerType == 0) {
            navigate("/setup-host-game");
        } else if (data.playerType == 1) {
            navigate("/setup-client-game");
        } else {
            // spectator should have no controls
            navigate("/setup");
        }
    });
    return (
        <H3>Waiting for data from server</H3>
    );
}
