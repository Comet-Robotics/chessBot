import useWebSocket from "react-use-websocket";
import {
    Message,
    messageToJson,
    MessageHandler,
    SendMessage,
    jsonToMessage,
} from "../common/message/message";
import { useMemo } from "react";
import {
    ClientToServerMessage,
    ServerToClientMessage,
} from "../common/message/client-server";

/**
 * The URL to use for connecting to the websocket backend.
 */
const WEBSOCKET_URL = "ws://localhost:3000/ws";

/**
 * A custom hook which allows using a websocket to connect to the server.
 *
 * @param handleMessage - A function which gets invoked each time a message is received.
 * @returns A function which can be used to send messages.
 */
export function useSocket(
    handleMessage?: MessageHandler<ServerToClientMessage>,
): SendMessage<ClientToServerMessage> {
    const { sendMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => {
            console.log("Connection established");
            sendMessage(messageToJson({ type: "REGISTER_WEBSOCKET" }));
        },
        onMessage: (msg: MessageEvent) => {
            const message = jsonToMessage(
                msg.data.toString(),
                ServerToClientMessage,
            );
            console.log("Handle message: " + JSON.stringify(message));

            if (handleMessage !== undefined) {
                handleMessage(message);
            }
        },
    });

    const sendMessageHandler = useMemo(() => {
        return (message: Message) => {
            const msgString = messageToJson(message);
            console.log("Sending message: " + msgString);
            sendMessage(msgString);
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
        }).then((response) => response.json());
    } catch (error) {
        return Promise.reject(error);
    }
}
