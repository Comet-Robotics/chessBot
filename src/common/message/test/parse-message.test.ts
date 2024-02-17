import { StopGameReason } from "../../game-end";
import { GameType } from "../../game-type";
import { DriveRobotMessage, StopRobotMessage } from "../drive-robot-message";
import {
    MoveMessage,
    PositionMessage,
    StartGameMessage,
    StopGameMessage,
} from "../game-message";
import { Message } from "../message";
import { PieceType } from "../../types";
import {
    StartGameMessage,
    StopGameMessage,
    PromotionMessage,
    PositionMessage,
    MoveMessage,
} from "../game-message";
import { DriveRobotMessage, StopRobotMessage } from "../drive-robot-message";
import { parseMessage } from "../parse-message";
import { expect, test } from "vitest";

test.each([
    new StartGameMessage(GameType.COMPUTER, true, 3),
    new StartGameMessage(GameType.HUMAN, false),
    new StopGameMessage(StopGameReason.ABORTED),
    new PositionMessage("aaaaaaaaa"),
    new MoveMessage("a1", "a4"),
    new DriveRobotMessage("robot1", 0.5, 0.5),
    new StopRobotMessage("robot2"),
])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(parseMessage(message.toJson())).toEqual(copy);
});
