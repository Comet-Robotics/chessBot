import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { Outlet } from "react-router-dom";
import { ChessboardWrapper } from "../chessboard-wrapper";
import { PropsWithChildren, ReactNode } from "react";

interface SetupBaseProps extends PropsWithChildren {
    actions?: ReactNode;
}

export function SetupBase(props: SetupBaseProps): JSX.Element {
    return (
        <>
            <Outlet />
            <ChessboardWrapper />
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
