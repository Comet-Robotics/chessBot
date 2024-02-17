import express, { RequestHandler, Express } from "express";
import ViteExpress from "vite-express";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";
import { apiRouter, clientManager, websocketHandler } from "./api/api";
import expressWebSocket from "express-ws";

const app = expressWebSocket(express()).app;

app.use(express.json());
app.use(cookieParser());

/**
 * Attaches a unique clientId to req if it does not already exist.
 * The cookie is automatically sent back to the client, stored in the browser, and included by the client in all future requests.
 */
const checkAuthentication: RequestHandler = (req, res, next) => {
    if (!req.cookies.clientId) {
        res.cookie("clientId", uuid(), {
            // Expires after 1 day
            maxAge: 86400000,
            // Cookie isn't available to client
            httpOnly: true,
        });
    }
    return next();
};

/**
 * Returns the player type based off of their client id.
 * 0 is the host (player1), 1 is the client (player2), 2 is spectators
 */
const addClientToManager: RequestHandler = (req, res) => {
    res.json({playerType: clientManager.assignConnection(req.cookies.clientId)});
}

/**
 * Ensure all requests have a clientId cookie.
 */
app.use(checkAuthentication);

/**
 * Call the middleware when the play against a human button is clicked.
 */
app.post("/human", addClientToManager);

app.ws("/ws", websocketHandler);

app.use("/api", apiRouter);

ViteExpress.listen(app as unknown as Express, 3000, () => {
    console.log("Server is listening on port 3000.");
});
