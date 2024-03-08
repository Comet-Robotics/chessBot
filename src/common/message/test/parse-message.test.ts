import { Difficulty } from "../../client-types";
import { GameInterruptedReason } from "../../game-end-reasons";
import { GameType, PieceType, Side } from "../../game-types";
import { Message, jsonToMessage, messageToJson } from "../message";
import { expect, test } from "vitest";

test.each([
    {
        type: "GAME_START",
        gameType: GameType.COMPUTER,
        side: Side.WHITE,
        difficulty: Difficulty.ADVANCED,
    },
    { type: "GAME_START", gameType: GameType.HUMAN, side: Side.BLACK },
    { type: "GAME_INTERRUPTED", reason: GameInterruptedReason.ABORTED },
    { type: "POSITION", pgn: "aaaaaaaaa" },
    { type: "MOVE" },
    { type: "MOVE", promotion: PieceType.BISHOP },
    { type: "MOVE", promotion: PieceType.PAWN },
    // new MoveMessage({ from: "a1", to: "a2" }),
    // new MoveMessage({ from: "a1", to: "a3", promotion: PieceType.BISHOP }),
    // new MoveMessage({ from: "a1", to: "a4", promotion: PieceType.PAWN }),
    { type: "DRIVE_ROBOT", id: "robot1", power: { left: 0.5, right: 0.5 } },
    { type: "DRIVE_ROBOT", id: "robot2", power: { left: 0, right: 0 } },
    // new StopRobotMessage("robot2"),
] as Message[])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(jsonToMessage(messageToJson(message))).toEqual(copy);
});
