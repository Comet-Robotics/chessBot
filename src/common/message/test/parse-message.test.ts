import { GameInterruptedReason } from "../../game-end-reasons";
import { GameType } from "../../client-types";
import { PieceType, Side } from "../../game-types";
import { Message, jsonToMessage, messageToJson } from "../message";
import { expect, test } from "vitest";

test.each([
    {
        type: "game-start",
        gameType: GameType.COMPUTER,
        side: Side.WHITE,
        difficulty: 3,
    },
    { type: "game-start", gameType: GameType.HUMAN, side: Side.BLACK },
    { type: "game-interrupted", reason: GameInterruptedReason.ABORTED },
    { type: "position", pgn: "aaaaaaaaa" },
    { type: "move" },
    { type: "move", promotion: PieceType.BISHOP },
    { type: "move", promotion: PieceType.PAWN },
    // new MoveMessage({ from: "a1", to: "a2" }),
    // new MoveMessage({ from: "a1", to: "a3", promotion: PieceType.BISHOP }),
    // new MoveMessage({ from: "a1", to: "a4", promotion: PieceType.PAWN }),
    { type: "drive-robot", id: "robot1", power: { left: 0.5, right: 0.5 } },
    { type: "drive-robot", id: "robot2", power: { left: 0, right: 0 } },
    // new StopRobotMessage("robot2"),
] as Message[])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(jsonToMessage(messageToJson(message))).toEqual(copy);
});
