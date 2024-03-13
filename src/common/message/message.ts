import { Union, Static } from "runtypes";
import { CLIENT_TO_SERVER, SERVER_TO_CLIENT } from "./client-server";

export const Message = Union(CLIENT_TO_SERVER, SERVER_TO_CLIENT);
export type Message = Static<typeof Message>;

/**
 * A function which can be used to send a message somewhere.
 */
export type SendMessage = (message: Message) => void;

/**
 * A function which receives messages and should do stuff with them.
 */
export type MessageHandler = (message: Message) => void;

/**
 * Convert json to Message object
 * @param jsonStr - json string
 * @returns parsed Message object
 * @throws if json string is not a Message object
 */
export function jsonToMessage(jsonStr: string): Message {
    const obj = JSON.parse(jsonStr);
    if (!Message.guard(obj)) {
        throw new Error("Invalid message: " + jsonStr);
    }
    return obj as Message;
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
