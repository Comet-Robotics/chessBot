import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { SetupBase } from "../setup/setup-base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/game-type";
import { Side } from "../../common/types";
import { Difficulty } from "../../common/chess-engine";

export function SetupComputerGame() {
    const [difficulty, setDifficulty] = useState(Difficulty.BEGINNER);
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
                <H6>Difficulty</H6>
                <div style={{ width: "75%" }}>
                    <Slider
                        intent="primary"
                        value={difficulty}
                        onChange={setDifficulty}
                        labelRenderer={(value) => {
                            if (value === Difficulty.BABY) {
                                return "Baby";
                            } else if (value === Difficulty.BEGINNER) {
                                return "Beginner";
                            } else if (value === Difficulty.INTERMEDIATE) {
                                return "Intermediate";
                            } else {
                                return "Advanced";
                            }
                        }}
                        min={0}
                        max={3}
                    />
                </div>
                <Button
                    text="Play"
                    icon="arrow-right"
                    intent="primary"
                    onClick={async () => {
                        navigate("/game", {
                            state: {
                                gameType: GameType.COMPUTER,
                                // TODO: Let user choose color
                                side: Side.WHITE,
                                difficulty: difficulty,
                            },
                        });
                    }}
                />
            </div>
        </SetupBase>
    );
}
