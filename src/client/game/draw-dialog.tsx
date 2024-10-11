import {
    Button,
    Dialog,
    DialogBody,
    NonIdealState,
    DialogFooter,
} from "@blueprintjs/core";
import { useState } from "react";
import { SendMessage } from "../../common/message/message";
import {
    GameHoldMessage,
    GameInterruptedMessage,
} from "../../common/message/game-message";
import {
    GameHoldReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";

interface DrawDialogProps {
    sendMessage: SendMessage;
}

export function OfferDrawDialog(props: DrawDialogProps) {
    const [isOpen, setIsOpen] = useState(true);
    const actions = (
        <>
            <Button
                text="Yes"
                rightIcon="arrow-up"
                intent="primary"
                onClick={() => {
                    props.sendMessage(
                        new GameHoldMessage(GameHoldReason.DRAW_OFFERED),
                    );
                }}
            />
            <Button
                text="No"
                rightIcon="arrow-down"
                intent="primary"
                onClick={() => {
                    props.sendMessage(
                        new GameHoldMessage(GameHoldReason.DRAW_DENIED),
                    );
                }}
            />
        </>
    );
    return (
        <Dialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            canOutsideClickClose={false}
            canEscapeKeyClose={false}
        >
            <DialogBody>
                <NonIdealState title={"Offer draw?"} />
            </DialogBody>
            <DialogFooter minimal actions={actions} />
        </Dialog>
    );
}

export function AcceptDrawDialog(props: DrawDialogProps) {
    const [isOpen, setIsOpen] = useState(true);
    const actions = (
        <>
            <Button
                text="Yes"
                rightIcon="arrow-up"
                intent="primary"
                onClick={() => {
                    props.sendMessage(
                        new GameInterruptedMessage(
                            GameInterruptedReason.DRAW_ACCEPTED,
                        ),
                    );
                }}
            />
            <Button
                text="No"
                rightIcon="arrow-down"
                intent="primary"
                onClick={() => {
                    props.sendMessage(
                        new GameHoldMessage(GameHoldReason.DRAW_DENIED),
                    );
                }}
            />
        </>
    );
    return (
        <Dialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            canOutsideClickClose={false}
            canEscapeKeyClose={false}
        >
            <DialogBody>
                <NonIdealState title={"Accept draw?"} />
            </DialogBody>
            <DialogFooter minimal actions={actions} />
        </Dialog>
    );
}
