import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { Dispatch, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/client-types";
import { Side } from "../../common/game-types";

interface SetupGameProps {
    gameType: GameType;
}

export function SetupGame(props: SetupGameProps) {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState(1);

    const difficultySlider =
        props.gameType === GameType.COMPUTER ?
            <DifficultySlider
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
            />
        :   null;
    const options = <>{difficultySlider}</>;

    const title =
        props.gameType === GameType.COMPUTER ?
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
                        gameType: props.gameType,
                        // TODO: Let user choose side
                        side: Side.WHITE,
                        difficulty: difficulty,
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
                        if (value == 0) {
                            return "Baby";
                        } else if (value == 1) {
                            return "Beginner";
                        } else if (value == 2) {
                            return "Intermediate";
                        } else {
                            return "Advanced";
                        }
                    }}
                    min={0}
                    max={3}
                />
            </div>
        </>
    );
}
