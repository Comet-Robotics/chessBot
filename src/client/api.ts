/**
 * The URL to use for connecting to the websocket backend.
 */
export const WEBSOCKET_URL = "ws://localhost:3000/ws";

/**
 * Makes a post request to the backend.
 *
 * @param apiPath - The path to post to. Should generally include a leading slash.
 */
export async function post(
    apiPath: string,
    query: Record<string, string> = {},
    body: object = {}
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
    query: Record<string, string> = {}
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
