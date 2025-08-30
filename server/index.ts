import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getSlider, updateSlider } from "./routes/slider";
import { postContact } from "./routes/contact";
import {
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "./routes/messages";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Slider routes
  app.get("/api/slider", getSlider);
  app.put("/api/slider", updateSlider);

  // Contact route
  app.post("/api/contact", postContact);

  // Messages API (temporary JSON-file persistence)
  app.get("/api/messages", listMessages);
  app.post("/api/messages", createMessage);
  app.patch("/api/messages/:id", updateMessage);
  app.delete("/api/messages/:id", deleteMessage);

  return app;
}
