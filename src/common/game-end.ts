import { Chess } from "chess.js";

export enum GameFinishedReason {
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

export function getGameFinishedReason(chess: Chess): GameFinishedReason {
    if (chess.isCheckmate()) {
        // If it's your turn, you lost
        return chess.turn() === "w" ?
                GameFinishedReason.WHITE_CHECKMATED
            :   GameFinishedReason.BLACK_CHECKMATED;
    } else if (chess.isStalemate()) {
        return GameFinishedReason.STALEMATE;
    } else if (chess.isThreefoldRepetition()) {
        return GameFinishedReason.THREEFOLD_REPETITION;
    } else if (chess.isDraw()) {
        return chess.isInsufficientMaterial() ?
                GameFinishedReason.INSUFFICIENT_MATERIAL
            :   GameFinishedReason.FIFTY_MOVES;
    }
    throw new Error("Failed to find game over reason.");
}

/**
 * A reason for a game to be stopped outside the normal flow of moves.
 */
export enum GameStoppedReason {
    WHITE_RESIGNED = "white-resigned",
    BLACK_RESIGNED = "black-resigned",
    DRAW_ACCEPTED = "draw-accepted",
    ABORTED = "aborted",
}
