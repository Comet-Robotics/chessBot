import { StopGameReason } from "../../game-end";
import { GameType } from "../../game-type";
import { StartGameMessage, StopGameMessage } from "../game-message";
import { Message } from "../message";
import { parseMessage } from "../parse-message";
import { expect, test } from "vitest";

test.each([
    new StartGameMessage(GameType.COMPUTER, 3),
    new StartGameMessage(GameType.HUMAN),
    new StopGameMessage(StopGameReason.ABORTED),
])("Message should serialize correctly", (message: Message) => {
    const copy = Object.assign({}, message);
    expect(parseMessage(message.toJson())).toEqual(copy);
});
