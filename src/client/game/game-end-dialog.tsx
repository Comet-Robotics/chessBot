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
import { GameFinishedReason, GameStoppedReason } from "../../common/game-end";
import { useState } from "react";

interface GameEndDialogProps {
    reason: GameFinishedReason | GameStoppedReason;
    isWhite: boolean;
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
                navigate("/setup");
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
                    icon={gameOverIcon(props.reason, props.isWhite)}
                    iconMuted={false}
                />
            </DialogBody>
            <DialogFooter minimal actions={actions} />
        </Dialog>
    );
}

function gameOverIcon(
    reason: GameFinishedReason | GameStoppedReason,
    isWhite: boolean,
) {
    const whiteWon =
        reason === GameFinishedReason.BLACK_CHECKMATED ||
        reason === GameStoppedReason.BLACK_RESIGNED;
    const blackWon =
        reason === GameFinishedReason.WHITE_CHECKMATED ||
        reason === GameStoppedReason.WHITE_RESIGNED;

    const won = isWhite ? whiteWon : blackWon;
    const lost = isWhite ? blackWon : whiteWon;
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

function gameOverMessage(reason: GameFinishedReason | GameStoppedReason) {
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
        case GameStoppedReason.DRAW_ACCEPTED:
            return "Draw by Mutual Agreement";
        case GameStoppedReason.WHITE_RESIGNED:
            return "White Resigned - Black Wins";
        case GameStoppedReason.BLACK_RESIGNED:
            return "Black Resigned - White Wins";
        case GameStoppedReason.ABORTED:
            return "Game Aborted";
    }
}
