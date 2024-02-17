import { Message, MessageType } from "./message";
import { DriveRobotMessage } from "./drive-robot-message";
import {
    StartGameMessage,
    StopGameMessage,
    PositionMessage,
    MoveMessage,
    PromotionMessage,
} from "./game-message";

/**
 * Parses sent messages into Message instances.
 *
 * @param text - A string received from the server or the client.
 * @returns the parsed Message class.
 */
export function parseMessage(text: string): Message {
    const obj = JSON.parse(text);

    switch (obj.type) {
        case MessageType.START_GAME:
            return new StartGameMessage(
                obj.gameType,
                Boolean(obj.isWhite),
                obj.difficulty !== undefined ?
                    parseInt(obj.difficulty)
                :   undefined,
            );
        case MessageType.STOP_GAME:
            return new StopGameMessage(obj.reason);
        case MessageType.POSITION:
            return new PositionMessage(obj.position);
        case MessageType.MOVE:
            return new MoveMessage(obj.from, obj.to);
        case MessageType.PROMOTION:
            return new PromotionMessage(obj.from, obj.to, obj.promotion);
        case MessageType.DRIVE_ROBOT:
            return new DriveRobotMessage(
                obj.id,
                parseFloat(obj.leftPower),
                parseFloat(obj.rightPower),
            );
    }
    throw new Error("Failed to parse message.");
}
