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
import { FinishGameReason, StopGameReason } from "../../common/game-end-reason";
import { useState } from "react";
import { Side } from "../../common/game-types";

interface GameEndDialogProps {
    reason: FinishGameReason | StopGameReason;
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

function gameOverIcon(reason: FinishGameReason | StopGameReason, side: Side) {
    const whiteWon =
        reason === FinishGameReason.BLACK_CHECKMATED ||
        reason === StopGameReason.BLACK_RESIGNED;
    const blackWon =
        reason === FinishGameReason.WHITE_CHECKMATED ||
        reason === StopGameReason.WHITE_RESIGNED;

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

function gameOverMessage(reason: FinishGameReason | StopGameReason) {
    switch (reason) {
        case FinishGameReason.WHITE_CHECKMATED:
            return "Checkmate - Black Wins";
        case FinishGameReason.BLACK_CHECKMATED:
            return "Checkmate - White Wins";
        case FinishGameReason.STALEMATE:
            return "Draw - Stalemate";
        case FinishGameReason.THREEFOLD_REPETITION:
            return "Draw - Threefold Repetition";
        case FinishGameReason.INSUFFICIENT_MATERIAL:
            return "Draw By Insufficient Material";
        case StopGameReason.DRAW_ACCEPTED:
            return "Draw by Mutual Agreement";
        case StopGameReason.WHITE_RESIGNED:
            return "White Resigned - Black Wins";
        case StopGameReason.BLACK_RESIGNED:
            return "Black Resigned - White Wins";
        case StopGameReason.ABORTED:
            return "Game Aborted";
    }
}
