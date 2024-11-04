import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { post } from "../api";
import { useNavigate } from "react-router-dom";
import { PuzzleComponents } from "../../server/api/api";

const renderPuzzleOptions: ItemRenderer<string> = (
    puzzleNumber,
    { modifiers, handleFocus, handleClick },
) => {
    return (
        <MenuItem
            key={puzzleNumber}
            active={modifiers.active}
            roleStructure="listoption"
            text={puzzleNumber}
            onFocus={handleFocus}
            onClick={handleClick}
        />
    );
};

interface SelectPuzzleProps {
    puzzles: Map<string, PuzzleComponents>;
    selectedPuzzle: string | undefined;
    onPuzzleSelected: (puzzle: string) => void;
}

export function SelectPuzzle(props: SelectPuzzleProps) {
    const navigate = useNavigate();
    const hasSelection = props.selectedPuzzle !== undefined;

    const submit = (
        <Button
            text="Play"
            icon="arrow-right"
            intent="primary"
            onClick={async () => {
                if (props.selectedPuzzle && props.puzzles) {
                    //console.log(props.puzzles.get(props.selectedPuzzle));
                    const puzzle = props.puzzles as Map<string, object>;
                    //console.log(puzz[props.selectedPuzzle]);
                    const promise = post("/start-puzzle-game", {
                        puzzle: JSON.stringify(puzzle[props.selectedPuzzle]),
                    });
                    promise.then(() => {
                        navigate("/game");
                    });
                }
            }}
        />
    );
    return (
        <>
            <Select<string>
                items={[...Object.keys(props.puzzles)]}
                itemRenderer={renderPuzzleOptions}
                onItemSelect={props.onPuzzleSelected}
                filterable={false}
                popoverProps={{ minimal: true }}
            >
                <Button
                    text={
                        hasSelection ?
                            props.selectedPuzzle
                        :   "Select a puzzle..."
                    }
                    rightIcon="double-caret-vertical"
                />
            </Select>
            {submit}
        </>
    );
}
