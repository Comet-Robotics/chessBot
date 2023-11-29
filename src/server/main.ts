import express, { RequestHandler } from "express";
import ViteExpress from "vite-express";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";

import { router } from "./api";

const app = express();

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
 * Ensure all requests have a clientId cookie.
 */
app.use("/", checkAuthentication);

app.use("/api", router);

ViteExpress.listen(app, 3000, () => {
  console.log("Server is listening on port 3000.");
});
