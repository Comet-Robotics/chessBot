import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { Dispatch, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/game-type";
import { Side } from "../../common/types";
import { SetupType } from "./setup-type";

export enum SetupGameType {
    COMPUTER = SetupType.COMPUTER,
    HUMAN = SetupType.HUMAN,
}

interface SetupGameProps {
    setupGameType: SetupGameType;
}

export function SetupGame(props: SetupGameProps) {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState(3);

    const options = (
        <>
            <DifficultySlider
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
            />
        </>
    );

    const title =
        props.setupGameType === SetupGameType.COMPUTER ?
            "Play against the computer"
        :   "Setup game";

    const submit = (
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
                        // Normalize to 0 - 3
                        difficulty: difficulty - 1,
                    },
                });
            }}
        />
    );

    return (
        <div
            style={{
                alignItems: "center",
                display: "flex",
                flex: "1 0 auto",
                flexDirection: "column",
                justifyContent: "space-around",
            }}
        >
            <H3>{title}</H3>
            {options}
            {submit}
        </div>
    );
}

interface DifficultySliderProps {
    difficulty: number;
    onDifficultyChange: Dispatch<number>;
}

function DifficultySlider(props: DifficultySliderProps) {
    return (
        <>
            <H6>Difficulty</H6>
            <div style={{ width: "75%" }}>
                <Slider
                    intent="primary"
                    value={props.difficulty}
                    onChange={props.onDifficultyChange}
                    labelRenderer={(value) => {
                        if (value == 1) {
                            return "Baby";
                        } else if (value == 2) {
                            return "Beginner";
                        } else if (value == 3) {
                            return "Intermediate";
                        } else {
                            return "Advanced";
                        }
                    }}
                    min={1}
                    max={4}
                />
            </div>
        </>
    );
}
