import { StopGameReason } from "../../game-end-reason";
import { GameType } from "../../client-types";
import { PieceType, Side } from "../../game-types";
import { DriveRobotMessage, StopRobotMessage } from "../drive-robot-message";
import {
    MoveMessage,
    PositionMessage,
    PromotionMessage,
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
    new PromotionMessage("h7", "b3", PieceType.KNIGHT),
    new MoveMessage("a1", "a4"),
    new DriveRobotMessage("robot1", 0.5, 0.5),
    new StopRobotMessage("robot2"),
])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(parseMessage(message.toJson())).toEqual(copy);
});
