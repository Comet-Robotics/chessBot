import { Message, MessageType, RegisterWebsocketMessage } from "./message";
import { DriveRobotMessage, SetRobotVariableMessage } from "./robot-message";
import {
    PositionMessage,
    MoveMessage,
    GameInterruptedMessage,
    GameStartedMessage,
    GameHoldMessage,
} from "./game-message";
import { SimulatorUpdateMessage } from "./simulator-message";

/**
 * Parses sent messages into Message instances.
 *
 * @param text - A string received from the server or the client.
 * @returns the parsed Message class.
 */
export function parseMessage(text: string): Message {
    const obj = JSON.parse(text);

    switch (obj.type) {
        case MessageType.REGISTER_WEBSOCKET:
            return new RegisterWebsocketMessage();
        case MessageType.GAME_STARTED:
            return new GameStartedMessage();
        case MessageType.GAME_INTERRUPTED:
            return new GameInterruptedMessage(obj.reason);
        case MessageType.GAME_HELD:
            return new GameHoldMessage(obj.reason);
        case MessageType.POSITION:
            return new PositionMessage(obj.pgn);
        case MessageType.MOVE:
            return new MoveMessage(obj.move);
        case MessageType.DRIVE_ROBOT:
            return new DriveRobotMessage(
                obj.id,
                parseFloat(obj.leftPower),
                parseFloat(obj.rightPower),
            );
        case MessageType.SET_ROBOT_VARIABLE:
            return new SetRobotVariableMessage(
                obj.id,
                obj.variableName,
                parseFloat(obj.variableValue),
            );
        case MessageType.SIMULATOR_UPDATE:
            return new SimulatorUpdateMessage(
                obj.robotId,
                obj.location,
                obj.packet,
                obj.stackTrace,
            );
    }
    throw new Error("Failed to parse message.");
}
