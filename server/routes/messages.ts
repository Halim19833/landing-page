import { RequestHandler } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import {
  CreateMessageRequest,
  ListMessagesResponse,
  MessageItem,
} from "@shared/api";

const DATA_PATH = path.join(import.meta.dirname, "../messages.json");

function readAll(): MessageItem[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const arr = JSON.parse(raw) as MessageItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeAll(items: MessageItem[]) {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
  } catch {}
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  country: z.string().optional(),
  type: z.string().optional(),
  mobile: z.string().optional(),
});

export const listMessages: RequestHandler = (req, res) => {
  const { country, type } = req.query as { country?: string; type?: string };
  let items = readAll();
  if (country) items = items.filter((i) => i.country === country);
  if (type) items = items.filter((i) => i.type === type);
  const response: ListMessagesResponse = { items };
  res.json(response);
};

export const createMessage: RequestHandler = (req, res) => {
  const parsed = createSchema.safeParse(req.body as CreateMessageRequest);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid payload" });
  const now = new Date().toISOString();
  const item: MessageItem = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    country: parsed.data.country,
    type: parsed.data.type,
    mobile: parsed.data.mobile,
    read: false,
    approved: false,
    at: now,
  };
  const items = readAll();
  items.unshift(item);
  writeAll(items);
  res.status(201).json({ item });
};

export const updateMessage: RequestHandler = (req, res) => {
  const { id } = req.params as { id: string };
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const patch = req.body as Partial<MessageItem>;
  const updated = { ...items[idx], ...patch } as MessageItem;
  items[idx] = updated;
  writeAll(items);
  res.json({ item: updated });
};

export const deleteMessage: RequestHandler = (req, res) => {
  const { id } = req.params as { id: string };
  const items = readAll();
  const next = items.filter((i) => i.id !== id);
  writeAll(next);
  res.json({ ok: true });
};
