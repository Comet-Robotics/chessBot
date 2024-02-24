import { StopGameReason } from "../../game-end-reason";
import { GameType } from "../../client-types";
import { PieceType, Side } from "../../game-types";
import { DriveRobotMessage, StopRobotMessage } from "../drive-robot-message";
import {
    MoveMessage,
    PositionMessage,
    StartGameMessage,
    StopGameMessage,
} from "../game-message";
import { Message } from "../message";
import { parseMessage } from "../parse-message";
import { expect, test } from "vitest";

test.each([
    new StartGameMessage(GameType.COMPUTER, Side.WHITE, 3),
    new StartGameMessage(GameType.HUMAN, Side.BLACK),
    new StopGameMessage(StopGameReason.ABORTED),
    new PositionMessage("aaaaaaaaa"),
    new MoveMessage("a1", "a2"),
    new MoveMessage("a1", "a3", PieceType.BISHOP),
    new MoveMessage("a1", "a4", PieceType.PAWN),
    new DriveRobotMessage("robot1", 0.5, 0.5),
    new StopRobotMessage("robot2"),
])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(parseMessage(message.toJson())).toEqual(copy);
});
