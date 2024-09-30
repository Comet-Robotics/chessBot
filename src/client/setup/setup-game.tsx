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

/**
 * Creates the dialog for setting up human and computer games
 *
 * @param props - the chosen game type
 * @returns setup dialog
 */
export function SetupGame(props: SetupGameProps) {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState(Difficulty.BEGINNER);
    const [desiredSide, setDesiredSide] = useState<DesiredSide>(
        DesiredSide.WHITE,
    );

    /**
     * create the difficulty slide if the game type is computer
     */
    const difficultySlider =
        props.gameType === GameType.COMPUTER ?
            <DifficultySlider
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
            />
        :   null;

    /**the select side dropdown */
    const selectSide = (
        <SelectSide
            desiredSide={desiredSide}
            onDesiredSideChange={setDesiredSide}
        />
    );
    /** difficulty and side buttons */
    const options = (
        <>
            {difficultySlider}
            {selectSide}
        </>
    );

    //the title for the dialog
    const title =
        props.gameType === GameType.COMPUTER ?
            "Play Against the Computer"
        :   "Setup Game";

    //handles passing user choices to the api
    const submit = (
        <Button
            text="Play"
            icon="arrow-right"
            intent="primary"
            onClick={async () => {
                //convert the side selected to the side enum
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

                //pass the user choice to api
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

/**
 * Creates a difficulty slider from 0 to 3
 *
 * @param props - difficulty change handler
 * @returns slider
 */
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
