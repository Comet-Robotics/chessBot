# Server Client Interface

The server and the client (e.g. browser tab) have two ways of communicating - a REST API and web sockets.

Web sockets provide fast, two-way communication. 

The REST API provides a one way interface, where the client makes a request to the server and then receives a response. 

We use the REST API for one-shot communication between the server and the client where the client expects a direct response to it's request from the server. For example, `getIds` is implemented as a REST API `get` request since we logically want the server to provide the requested ids immediately in response to the request. 

