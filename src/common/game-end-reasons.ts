export type GameEndReason = GameFinishedReason | GameInterruptedReason;

export enum GameFinishedReason {
    /**
     * White is checkmated.
     */
    WHITE_CHECKMATED = "WHITE_CHECKMATED",
    /**
     * Black is checkmated.
     */
    BLACK_CHECKMATED = "BLACK_CHECKMATED",
    STALEMATE = "STALEMATE",
    THREEFOLD_REPETITION = "THREEFOLD_REPETITION",
    INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
    FIFTY_MOVES = "FIFTY_MOVES",
    // chess.js doesn't support the following:
    // FIVEFOLD_REPETITION,
}

/**
 * A reason for a game to be stopped outside the normal flow of moves.
 */
export enum GameInterruptedReason {
    WHITE_RESIGNED = "WHITE_RESIGNED",
    BLACK_RESIGNED = "BLACK_RESIGNED",
    DRAW_ACCEPTED = "DRAW_ACCEPTED",
    ABORTED = "ABORTED",
}
