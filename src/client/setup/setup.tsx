import { Button, Dialog, DialogBody, H3 } from "@blueprintjs/core";
import { Outlet, useNavigate } from "react-router-dom";
import { ChessboardWrapper } from "../chessboard-wrapper";
import { SetupBase } from "./setup-base";

export function Setup(): JSX.Element {
    const navigate = useNavigate();
    const debugButton = (
        <Button
            minimal
            style={{ float: "right" }}
            icon="cog"
            onClick={() => navigate("/setup/debug")}
        />
    );

    const actions = (
        <>
            <Button
                large
                text="Play with the computer"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => navigate("/setup-computer-game")}
            />
            <Button
                large
                text="Play against a human"
                rightIcon="arrow-right"
                intent="primary"
                onClick={() => navigate("/setup-game")}
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
        </SetupBase>
    );
}
