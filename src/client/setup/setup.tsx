import { Button, H3 } from "@blueprintjs/core";
import { useMatch, useNavigate } from "react-router-dom";
import { SetupBase } from "./setup-base";
import { useState } from "react";

enum SetupPage {
    MAIN,
    LOBBY,
    COMPUTER_GAME,
    HUMAN_GAME,
    PUZZLE,
}

export function Setup(): JSX.Element {
    const isClient = useMatch("/client");
    const [setupPage, setSetupPage] = useState(() =>
        isClient ? SetupPage.LOBBY : SetupPage.MAIN,
    );
    const navigate = useNavigate();

    const actions = (
        <>
            <Button
                large
                text="Play with the computer"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => setSetupPage(SetupPage.COMPUTER_GAME)}
            />
            <Button
                large
                text="Play against a human"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => navigate("/setup-human-game")}
            />
            <Button
                large
                text="Puzzle"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => navigate("/setup-puzzle")}
            />
        </>
    );

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
                <H3>Welcome to Chess Bot!</H3>
                {actions}
            </div>
        </SetupBase>
    );
}
