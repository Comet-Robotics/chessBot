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
import { GameOverReason } from "../../common/game-over-reason";

interface GameOverReasonProps {
    reason: GameOverReason;
}

export function GameOverDialog(props: GameOverReasonProps) {
    const navigate = useNavigate();
    const actions = (
        <Button
            text="Continue"
            icon="arrow-right"
            intent="primary"
            onClick={() => {
                navigate("/setup");
            }}
        />
    );
    return (
        <Dialog>
            <DialogBody>
                <NonIdealState
                    title={gameOverMessage(props.reason)}
                    icon={gameOverIcon(props.reason)}
                    iconMuted={false}
                />
            </DialogBody>
            <DialogFooter minimal actions={actions} />
        </Dialog>
    );
}

function gameOverIcon(reason: GameOverReason) {
    if (reason == GameOverReason.CHECKMATE_WIN) {
        return (
            <Icon
                icon="tick"
                intent="success"
                size={NonIdealStateIconSize.STANDARD}
            />
        );
    } else if (
        reason == GameOverReason.ABORTED ||
        reason == GameOverReason.CHECKMATE_LOSE
    ) {
        return (
            <Icon
                icon="cross"
                intent="danger"
                size={NonIdealStateIconSize.STANDARD}
            />
        );
    }
    return (
        <Icon
            icon="minus"
            intent="warning"
            size={NonIdealStateIconSize.STANDARD}
        />
    );
}

function gameOverMessage(reason: GameOverReason) {
    switch (reason) {
        case GameOverReason.CHECKMATE_WIN:
            return "Victory - Checkmate";
        case GameOverReason.CHECKMATE_LOSE:
            return "Lose - Checkmate";
        case GameOverReason.STALEMATE:
            return "Draw - Stalemate";
        case GameOverReason.THREEFOLD_REPETITION:
            return "Draw by Threefold Repetition";
        // case GameOverReason.FIVEFOLD_REPETITION:
        //     return "Draw by Fivefold Repetition";
        case GameOverReason.DRAW_ACCEPTED:
            return "Draw Accepted";
        case GameOverReason.INSUFFICIENT_MATERIAL:
            return "Draw - Insufficient Material";
        case GameOverReason.ABORTED:
            return "Game Aborted";
    }
}
