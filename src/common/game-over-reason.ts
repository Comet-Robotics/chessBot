
export enum GameOverReason {
    CHECKMATE_WIN,
    CHECKMATE_LOSE,
    STALEMATE,
    DRAW_ACCEPTED,
    THREEFOLD_REPETITION,
    // chess.js doesn't support five-fold repetition
    // FIVEFOLD_REPETITION,
    INSUFFICIENT_MATERIAL,
    ABORTED,
}