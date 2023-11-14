import express from "express";
import ViteExpress from "vite-express";

const app = express();


app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

// Use an express router to redirect /api to backend/api

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
