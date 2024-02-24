import { Button, H3 } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { Dispatch, useState } from "react";
import { SetupGame } from "./setup-game";
import { useNavigate } from "react-router-dom";
import { GameType } from "../../common/client-types";

enum SetupType {
    MAIN = "main",
    COMPUTER = "computer",
    HUMAN = "human",
    PUZZLE = "puzzle",
}

export function Setup(): JSX.Element {
    const [setupType, setSetupType] = useState(SetupType.MAIN);

    return (
        <SetupBase>
            {setupType === SetupType.MAIN ?
                <SetupMain onPageChange={setSetupType} />
            :   null}
            {setupType === SetupType.COMPUTER || setupType === SetupType.HUMAN ?
                <SetupGame
                    gameType={
                        setupType === SetupType.COMPUTER ?
                            GameType.COMPUTER
                        :   GameType.HUMAN
                    }
                />
            :   null}
        </SetupBase>
    );
}

interface SetupMainProps {
    onPageChange: Dispatch<SetupType>;
}

function SetupMain(props: SetupMainProps) {
    const navigate = useNavigate();
    const debugButton = (
        <Button
            minimal
            style={{ float: "right" }}
            icon="cog"
            onClick={() => navigate("/debug")}
        />
    );

    const actions = (
        <>
            <Button
                large
                text="Play with the computer"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => props.onPageChange(SetupType.COMPUTER)}
            />
            <Button
                large
                text="Play against a human"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => props.onPageChange(SetupType.HUMAN)}
            />
            <Button
                large
                text="Puzzle"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => props.onPageChange(SetupType.PUZZLE)}
            />
        </>
    );

    return (
        <>
            {debugButton}
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flex: "1 0 auto",
                    flexDirection: "column",
                    justifyContent: "space-around",
                }}
            >
                <H3>Welcome to Chess Bot!</H3>
                {actions}
            </div>
        </>
    );
}
