import useWebSocket from "react-use-websocket";
import { Message, RegisterWebsocketMessage } from "../common/message/message";

/**
 * The URL to use for connecting to the websocket backend.
 */
const WEBSOCKET_URL = "ws://localhost:3000/ws";

export type SendMessage = (message: Message) => void;
export type MessageHandler = (message: Message) => void;

/**
 * A custom hook which connects to the server.
 * @param handleMessage - A function which gets invoked each time a message is received.
 * @returns A function which can be used to send messages.
 */
export function useSocket(handleMessage: MessageHandler): SendMessage {
    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
            sendMessage(new RegisterWebsocketMessage().toJson());
        },
        onMessage: (msg: MessageEvent) => {
            const message = JSON.parse(msg.data.toString());
            handleMessage(message);
        },
    });

    return (message: Message) => {
        sendMessage(message.toJson());
    };
}

/**
 * Makes a post request to the backend.
 *
 * @param apiPath - The path to post to. Should generally include a leading slash.
 */
export async function post(
    apiPath: string,
    query: Record<string, string> = {},
    body: object = {},
): Promise<any> {
    try {
        let normalizedUrl = `/api${apiPath}`;
        if (query) {
            normalizedUrl += `?${new URLSearchParams(query)}`;
        }
        return fetch(normalizedUrl, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((response) => response.json());
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * Makes a get request to the backend.
 *
 * @param apiPath - The path to post to. Should generally include a leading slash.
 */
export async function get(
    apiPath: string,
    query: Record<string, string> = {},
): Promise<any> {
    try {
        let normalizedUrl = `/api${apiPath}`;
        if (query) {
            normalizedUrl += `?${new URLSearchParams(query)}`;
        }
        return fetch(normalizedUrl, {
            method: "GET",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
        }).then((response) => response.json());
    } catch (error) {
        return Promise.reject(error);
    }
}
