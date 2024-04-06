import { Button, H3, H6, Slider } from "@blueprintjs/core";
import { Dispatch, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Difficulty, GameType } from "../../common/client-types";
import { Side } from "../../common/game-types";
import { post } from "../api";

enum DesiredSide {
    WHITE = "white",
    BLACK = "black",
    RANDOM = "random",
}

interface SetupGameProps {
    gameType: GameType;
}

export function SetupGame(props: SetupGameProps) {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState(Difficulty.BEGINNER);
    const [desiredSide, setDesiredSide] = useState<DesiredSide>(
        DesiredSide.WHITE,
    );

    const difficultySlider =
        props.gameType === GameType.COMPUTER ?
            <DifficultySlider
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
            />
        :   null;

    const selectSide = (
        <SelectSide
            desiredSide={desiredSide}
            onDesiredSideChange={setDesiredSide}
        />
    );

    const options = (
        <>
            {difficultySlider}
            {selectSide}
        </>
    );

    const title =
        props.gameType === GameType.COMPUTER ?
            "Play Against the Computer"
        :   "Setup Game";

    const submit = (
        <Button
            text="Play"
            icon="arrow-right"
            intent="primary"
            onClick={async () => {
                let selectedSide: Side;
                if (desiredSide === DesiredSide.RANDOM) {
                    selectedSide =
                        Math.random() < 0.5 ? Side.WHITE : Side.BLACK;
                } else {
                    selectedSide =
                        desiredSide === DesiredSide.WHITE ?
                            Side.WHITE
                        :   Side.BLACK;
                }

                let promise: Promise<unknown>;
                if (props.gameType === GameType.COMPUTER) {
                    promise = post("/start-computer-game", {
                        side: selectedSide,
                        difficulty: difficulty.toString(),
                    });
                } else {
                    promise = post("/start-human-game", {
                        side: selectedSide,
                    });
                }
                promise.then(() => {
                    navigate("/game");
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
    difficulty: Difficulty;
    onDifficultyChange: Dispatch<Difficulty>;
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
        </>
    );
}

interface SelectSideProps {
    desiredSide: DesiredSide;
    onDesiredSideChange: Dispatch<DesiredSide>;
}

function SelectSide(props: SelectSideProps) {
    return (
        <>
            <H6>Desired Side</H6>
            <select
                value={props.desiredSide}
                onChange={(e) =>
                    props.onDesiredSideChange(e.target.value as DesiredSide)
                }
            >
                <option value={DesiredSide.WHITE}>White</option>
                <option value={DesiredSide.BLACK}>Black</option>
                <option value={DesiredSide.RANDOM}>Random</option>
            </select>
        </>
    );
}
