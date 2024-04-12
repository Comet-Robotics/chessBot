import useWebSocket from "react-use-websocket";
import { Message, RegisterWebsocketMessage } from "../common/message/message";
import { useMemo } from "react";
import { parseMessage } from "../common/message/parse-message";
import { SendMessage } from "../common/message/message";
import { MessageHandler } from "../common/message/message";

/**
 * The URL to use for connecting to the websocket backend.
 */
const WEBSOCKET_URL = "ws://localhost:3000/ws";

/**
 * A custom hook which allows using a websocket to connect to the server.
 *
 * @param onMessage - A function which gets invoked each time a message is received.
 * @param onOpen - A function which gets invoked when the socket is opened.
 * @returns A function which can be used to send messages.
 */
export function useSocket(
    onMessage?: MessageHandler,
    onOpen?: () => void,
): SendMessage {
    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
            sendMessage(new RegisterWebsocketMessage().toJson());
            if (onOpen !== undefined) {
                onOpen();
            }
        },
        onMessage: (msg: MessageEvent) => {
            const message = parseMessage(msg.data.toString());
            console.log("Handle message: " + message.toJson());

            if (onMessage !== undefined) {
                onMessage(message);
            }
        },
    });

    const sendMessageHandler = useMemo(() => {
        return (message: Message) => {
            console.log("Sending message: " + message.toJson());
            sendMessage(message.toJson());
        };
    }, [sendMessage]);
    return sendMessageHandler;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    try {
        const normalizedUrl = `/api${apiPath}?${new URLSearchParams(query)}`;
        return fetch(normalizedUrl, {
            method: "GET",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            if (response.status !== 200) {
                // Throw an error to switch to the .catch flow
                throw new Error("Invalid response");
            }
            return response.json();
        });
    } catch (error) {
        return Promise.reject(error);
    }
}
