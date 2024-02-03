import { Button, Dialog, DialogBody, H3 } from "@blueprintjs/core";
import { Game } from "./game";
import { ChessboardWrapper } from "../chessboard-wrapper";
import { Chess } from "chess.js";
import { Outlet, useNavigate } from "react-router-dom";

export function Setup(): JSX.Element {
  const navigate = useNavigate();
  const settingsButton = (
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
        text="Play"
        rightIcon="arrow-right"
        intent="primary"
        onClick={() => navigate("/game")}
      />
      <Button
        large
        text="Puzzle"
        rightIcon="arrow-right"
        intent="primary"
        onClick={() => navigate("/puzzle")}
      />
    </>
  );

  return (
    <>
      <Outlet />
      <ChessboardWrapper />
      <Dialog
        isOpen
        isCloseButtonShown={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <DialogBody>
          {settingsButton}
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
        </DialogBody>
      </Dialog>
    </>
  );
}
