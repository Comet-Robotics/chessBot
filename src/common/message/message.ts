import { Union, Static, Runtype } from "runtypes";
import { ClientToServerMessage, ServerToClientMessage } from "./client-server";

export const Message = Union(ClientToServerMessage, ServerToClientMessage);
export type Message = Static<typeof Message>;

/**
 * A function which can be used to send a message somewhere.
 */
export type SendMessage<T extends Partial<Message>> = (message: T) => void;

/**
 * A function which receives messages and should do stuff with them.
 */
export type MessageHandler<T extends Partial<Message>> = (message: T) => void;

/**
 * Convert json to Message object
 * @param jsonStr - json string
 * @returns parsed Message object
 * @throws if json string is not a Message object
 */
export function jsonToMessage<T = Message>(
    jsonStr: string,
    guard?: Runtype<T>,
): T {
    const obj = JSON.parse(jsonStr);
    if (!(guard || Message).guard(obj)) {
        throw new Error("Invalid message: " + jsonStr);
    }
    return obj as T;
}

/**
 * Convert Message object to json
 * @param message - message object
 * @returns stringified object
 * @throws if provided object is not a Message
 */
export function messageToJson(message: Message): string {
    if (!Message.guard(message)) {
        throw new Error("Invalid message: " + JSON.stringify(message));
    }
    return JSON.stringify(message);
}
