import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    Icon,
    NonIdealState,
    NonIdealStateIconSize,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import {
    GameEndReason,
    GameFinishedReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";
import { useState } from "react";
import { Side } from "../../common/game-types";

interface GameEndDialogProps {
    reason: GameEndReason;
    side: Side;
}

export function GameEndDialog(props: GameEndDialogProps) {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const actions = (
        <Button
            text="Continue"
            rightIcon="arrow-right"
            intent="primary"
            onClick={() => {
                navigate("/home");
            }}
        />
    );
    return (
        <Dialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            canOutsideClickClose={false}
            canEscapeKeyClose={false}
        >
            <DialogBody>
                <NonIdealState
                    title={gameOverMessage(props.reason)}
                    icon={gameOverIcon(props.reason, props.side)}
                    iconMuted={false}
                />
            </DialogBody>
            <DialogFooter minimal actions={actions} />
        </Dialog>
    );
}

function gameOverIcon(reason: GameEndReason, side: Side) {
    const whiteWon =
        reason === GameFinishedReason.BLACK_CHECKMATED ||
        reason === GameInterruptedReason.BLACK_RESIGNED;
    const blackWon =
        reason === GameFinishedReason.WHITE_CHECKMATED ||
        reason === GameInterruptedReason.WHITE_RESIGNED;

    const won = side === Side.WHITE ? whiteWon : blackWon;
    const lost = side === Side.WHITE ? blackWon : whiteWon;
    // const draw = !blackWon && !whiteWon;
    if (won) {
        return (
            <Icon
                icon="tick"
                intent="success"
                size={NonIdealStateIconSize.STANDARD}
            />
        );
    } else if (lost) {
        return (
            <Icon
                icon="cross"
                intent="danger"
                size={NonIdealStateIconSize.STANDARD}
            />
        );
    }
    // draw
    return (
        <Icon
            icon="ban-circle"
            intent="warning"
            size={NonIdealStateIconSize.STANDARD}
        />
    );
}

function gameOverMessage(reason: GameEndReason) {
    switch (reason) {
        case GameFinishedReason.WHITE_CHECKMATED:
            return "Checkmate - Black Wins";
        case GameFinishedReason.BLACK_CHECKMATED:
            return "Checkmate - White Wins";
        case GameFinishedReason.STALEMATE:
            return "Draw - Stalemate";
        case GameFinishedReason.THREEFOLD_REPETITION:
            return "Draw - Threefold Repetition";
        case GameFinishedReason.INSUFFICIENT_MATERIAL:
            return "Draw By Insufficient Material";
        case GameInterruptedReason.DRAW_ACCEPTED:
            return "Draw by Mutual Agreement";
        case GameInterruptedReason.WHITE_RESIGNED:
            return "White Resigned - Black Wins";
        case GameInterruptedReason.BLACK_RESIGNED:
            return "Black Resigned - White Wins";
        case GameInterruptedReason.ABORTED:
            return "Game Aborted";
    }
}
