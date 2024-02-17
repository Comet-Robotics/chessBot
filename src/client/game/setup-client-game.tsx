import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { SetupBase } from "../setup/setup-base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/game-type";

export function SetupClientGame() {
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
                <H3>Waiting for Host (WIP)</H3>
                <Button
                    text="Connect"
                    icon="arrow-right"
                    intent="primary"
                    onClick={async () => {
                        console.log("test");
                        navigate("/game", {
                            state: {
                                gameType: GameType.HUMAN,
                                // TODO: get the host starting the game
                                isWhite: false
                            },
                        });
                    }}
                />
            </div>
        </SetupBase>
    );
}
