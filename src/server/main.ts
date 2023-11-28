import express from "express";
import ViteExpress from "vite-express";

import { router } from "./api";

const app = express();

app.use(express.json());

app.use("/api", router);

// Use an express router to redirect /api to backend/api

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
