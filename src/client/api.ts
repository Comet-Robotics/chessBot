/**
 * Makes a post request to the backend.
 */
export async function post(
  apiPath: string,
  query: Record<string, string> = {},
  body: object = {}
): Promise<any> {
  try {
    let normalizedUrl = `/api/${apiPath}`;
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
