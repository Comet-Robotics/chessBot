import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { Outlet } from "react-router-dom";
import { ChessboardWrapper } from "../wrapper/chessboard-wrapper";
import { PropsWithChildren, ReactNode } from "react";
import { Chess, DEFAULT_POSITION, Square } from "chess.js";

interface SetupBaseProps extends PropsWithChildren {
    actions?: ReactNode;
}

export function SetupBase(props: SetupBaseProps): JSX.Element {
    return (
        <>
            <Outlet />
            <ChessboardWrapper
                chess={new Chess(DEFAULT_POSITION)}
                isWhite={true}
                onMove={() => {}}
            />
            <Dialog
                isOpen
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
            >
                <DialogBody>{props.children}</DialogBody>
                <DialogFooter minimal actions={props.actions} />
            </Dialog>
        </>
    );
}
