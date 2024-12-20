import { Button, H3, NonIdealState, Spinner } from "@blueprintjs/core";
import { SetupBase } from "./setup-base";
import { Dispatch, useState } from "react";
import { SetupGame } from "./setup-game";
import { Navigate, useNavigate } from "react-router-dom";
import { ClientType, GameType } from "../../common/client-types";
import { get, useEffectQuery } from "../api";

enum SetupType {
    MAIN = "main",
    COMPUTER = "computer",
    HUMAN = "human",
    PUZZLE = "puzzle",
}

export function Setup(): JSX.Element {
    const [setupType, setSetupType] = useState(SetupType.MAIN);
    const { isPending, data } = useEffectQuery("client-information", () =>
        get("/client-information"),
    );

    if (isPending) {
        return (
            <SetupBase>
                <NonIdealState
                    icon={<Spinner intent="primary" />}
                    title="Loading..."
                />
            </SetupBase>
        );
    }

    if (data.clientType === ClientType.HOST) {
        return (
            <SetupBase>
                {setupType === SetupType.MAIN ?
                    <SetupMain onPageChange={setSetupType} />
                :   null}
                {(
                    setupType === SetupType.COMPUTER ||
                    setupType === SetupType.HUMAN
                ) ?
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
    } else {
        return <Navigate to="/lobby" />;
    }
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
