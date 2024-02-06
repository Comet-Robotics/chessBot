import { Button, H3, Slider } from "@blueprintjs/core";
import { SetupBase } from "../setup/setup-base";
import { useRef, useState } from "react";
import { post } from "../api";
import { useNavigate } from "react-router-dom";

export function SetupComputerGame() {
    const [difficulty, setDifficulty] = useState(2);
    const navigate = useNavigate();

    return (
        <SetupBase>
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flex: "1 0 auto",
                    flexDirection: "column",
                    justifyContent: "space-around",
                }}
            >
                <H3>Play Against the Computer</H3>
                <Slider
                    intent="primary"
                    value={difficulty}
                    onChange={setDifficulty}
                    min={1}
                    max={5}
                />
                <Button
                    title="Play"
                    icon="arrow-right"
                    onClick={async () => {
                        await post("/start-computer-game", {
                            difficulty: difficulty.toString(),
                        });
                        navigate("/game", {
                            state: { isWhite: true },
                        });
                    }}
                />
            </div>
        </SetupBase>
    );
}
