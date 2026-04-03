import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { ticketRouter } from "./routes/tickets.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/tickets", ticketRouter);

app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: error.issues.map((issue) => issue.message),
    });
  }

  console.error(error);
  return res.status(500).json({ error: "InternalServerError" });
});

