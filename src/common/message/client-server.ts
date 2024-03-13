// import { Square } from "chess.js";
import { Record, Literal, String, Optional, Union, Static } from "runtypes";
import { GameType } from "../client-types";
import { Side } from "../game-types";
import { DrivePower, Move, runtypeFromEnum } from "./core";
import { GameInterruptedReason } from "../game-end-reasons";

/**
 * A client-server message used to register a websocket with the server.
 */
export const REGISTER_WEBSOCKET = Record({
    type: Literal("register-websocket"),
});

/**
 * A server-client message defining the current position of a game.
 * Used to allow clients to reconnect.
 */
export const POSITION = Record({
    type: Literal("position"),
    pgn: String,
});

/**
 * A two-way message containing a single move.
 */
export const MOVE = Record({
    type: Literal("move"),
    move: Move,
});

/**
 * A client-server message used to indicate the start of a game.
 */
export const GAME_START = Record({
    type: Literal("game-start"),
    gameType: runtypeFromEnum(GameType),
    side: runtypeFromEnum(Side),
    // difficulty: Optional(runtypeFromEnum<Difficulty>(Difficulty)),
    // TODO: optional or else (when parsing)
    difficulty: Optional(Union(Literal(0), Literal(1), Literal(2), Literal(3))),
});

/**
 * A two-way message indicating a game has been interrupted.
 *
 * Note this does not include the game ending as a part of the normal flow of moves.
 */
export const GAME_INTERRUPTED = Record({
    type: Literal("game-interrupted"),
    reason: runtypeFromEnum(GameInterruptedReason),
});

/**
 * A client-server message containing instructions for manually driving a robot.
 */
export const DRIVE_ROBOT = Record({
    type: Literal("drive-robot"),
    id: String,
    power: DrivePower,
});
export type DriveRobotMessage = Static<typeof DRIVE_ROBOT>;

export const CLIENT_TO_SERVER = Union(
    REGISTER_WEBSOCKET,
    MOVE,
    GAME_START,
    GAME_INTERRUPTED,
    DRIVE_ROBOT,
);
export const SERVER_TO_CLIENT = Union(POSITION, MOVE, GAME_INTERRUPTED);
