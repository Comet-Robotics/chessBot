import { Chess } from "chess.js";

export enum FinishGameReason {
    /**
     * White is checkmated.
     */
    WHITE_CHECKMATED = "white-checkmated",
    /**
     * Black is checkmated.
     */
    BLACK_CHECKMATED = "black-checkmated",
    STALEMATE = "stalemate",
    THREEFOLD_REPETITION = "threefold-repetition",
    INSUFFICIENT_MATERIAL = "insufficient-material",
    FIFTY_MOVES = "fifty-moves",
    // chess.js doesn't support the following:
    // FIVEFOLD_REPETITION,
}

export function getFinishGameReason(chess: Chess): FinishGameReason {
    if (chess.isCheckmate()) {
        // If it's your turn, you lost
        return chess.turn() === "w" ?
                FinishGameReason.WHITE_CHECKMATED
            :   FinishGameReason.BLACK_CHECKMATED;
    } else if (chess.isStalemate()) {
        return FinishGameReason.STALEMATE;
    } else if (chess.isThreefoldRepetition()) {
        return FinishGameReason.THREEFOLD_REPETITION;
    } else if (chess.isDraw()) {
        return chess.isInsufficientMaterial() ?
                FinishGameReason.INSUFFICIENT_MATERIAL
            :   FinishGameReason.FIFTY_MOVES;
    }
    throw new Error("Failed to find game over reason.");
}

/**
 * A reason for a game to be stopped outside the normal flow of moves.
 */
export enum StopGameReason {
    WHITE_RESIGNED = "white-resigned",
    BLACK_RESIGNED = "black-resigned",
    DRAW_ACCEPTED = "draw-accepted",
    ABORTED = "aborted",
}
