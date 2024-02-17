import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { SetupBase } from "../setup/setup-base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/game-type";

export function SetupHostGame() {
    const [difficulty, setDifficulty] = useState(3);
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
                <H3>Play Against a Human (WIP)</H3>
                <div style={{ width: "75%" }}>
                    <Slider
                        intent="primary"
                        value={difficulty}
                        onChange={setDifficulty}
                        labelRenderer={(value) => {
                            if (value == 0) {
                                return "White";
                            } else if (value == 1) {
                                return "Random";
                            } else {
                                return "Black";
                            }
                        }}
                        min={0}
                        max={2}
                    />
                </div>
                <Button
                    text="Connect"
                    icon="arrow-right"
                    intent="primary"
                    onClick={async () => {
                        let isWhite = difficulty == 0;
                        if (difficulty == 1) {
                            isWhite = Boolean(Math.floor(Math.random() + 0.5));
                        }
                        navigate("/game", {
                            state: {
                                gameType: GameType.HUMAN,
                                isWhite: isWhite
                            },
                        });
                    }}
                />
            </div>
        </SetupBase>
    );
}
