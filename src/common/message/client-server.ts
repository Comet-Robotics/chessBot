// import { Square } from "chess.js";
import { Record, Literal, String, Optional, Union, Static } from "runtypes";
import { GameType, Side } from "../game-types";
import { DrivePower, Move, runtypeFromEnum } from "./core";
import { GameInterruptedReason } from "../game-end-reasons";
import { Difficulty } from "../client-types";

/**
 * A client-server message used to register a websocket with the server.
 */
export const RegisterWebsocketMessage = Record({
    type: Literal("REGISTER_WEBSOCKET"),
});
export type RegisterWebsocketMessage = Static<typeof RegisterWebsocketMessage>;

/**
 * A server-client message defining the current position of a game.
 * Used to allow clients to reconnect.
 */
export const PositionMessage = Record({
    type: Literal("POSITION"),
    pgn: String,
});
export type PositionMessage = Static<typeof PositionMessage>;

/**
 * A two-way message containing a single move.
 */
export const MoveMessage = Record({
    type: Literal("MOVE"),
    move: Move,
});
export type MoveMessage = Static<typeof MoveMessage>;

/**
 * A client-server message used to indicate the start of a game.
 */
export const GameStartMessage = Record({
    type: Literal("GAME_START"),
    gameType: runtypeFromEnum(GameType),
    side: runtypeFromEnum(Side),
    difficulty: Optional(runtypeFromEnum(Difficulty)),
    // TODO: optional or else (when parsing)
    // difficulty: Optional(Union(Literal(0), Literal(1), Literal(2), Literal(3))),
});
export type GameStartMessage = Static<typeof GameStartMessage>;

/**
 * A two-way message indicating a game has been interrupted.
 *
 * Note this does not include the game ending as a part of the normal flow of moves.
 */
export const GameInterruptedMessage = Record({
    type: Literal("GAME_INTERRUPTED"),
    reason: runtypeFromEnum(GameInterruptedReason),
});
export type GameInterruptedMessage = Static<typeof GameInterruptedMessage>;

/**
 * A client-server message containing instructions for manually driving a robot.
 */
export const DriveRobotMessage = Record({
    type: Literal("DRIVE_ROBOT"),
    id: String,
    power: DrivePower,
});
export type DriveRobotMessage = Static<typeof DriveRobotMessage>;

export const ClientToServerMessage = Union(
    RegisterWebsocketMessage,
    MoveMessage,
    GameStartMessage,
    GameInterruptedMessage,
    DriveRobotMessage,
);
export const ServerToClientMessage = Union(
    PositionMessage,
    MoveMessage,
    GameInterruptedMessage,
);
export type ClientToServerMessage = Static<typeof ClientToServerMessage>;
export type ServerToClientMessage = Static<typeof ServerToClientMessage>;
