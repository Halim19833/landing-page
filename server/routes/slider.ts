import { RequestHandler } from "express";
import { z } from "zod";
import { SliderImage, SliderResponse, UpdateSliderRequest } from "@shared/api";
import fs from "fs";
import path from "path";

const dataPath = path.resolve(process.cwd(), "server", "data", "slider.json");

function ensureDir() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readImages(): SliderImage[] {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(raw) as SliderImage[];
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Defaults
  return [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1600&auto=format&fit=crop",
      alt: "Team collaborating in modern office",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
      alt: "Developer working on laptop",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop",
      alt: "UI design process on board",
    },
  ];
}

function writeImages(images: SliderImage[]) {
  ensureDir();
  fs.writeFileSync(dataPath, JSON.stringify(images, null, 2));
}

const sliderImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  alt: z.string().optional(),
});

export const getSlider: RequestHandler = (_req, res) => {
  const response: SliderResponse = { images: readImages() };
  res.json(response);
};

export const updateSlider: RequestHandler = (req, res) => {
  const bodySchema = z.object({ images: z.array(sliderImageSchema).min(1) });
  const parsed = bodySchema.safeParse(req.body as UpdateSliderRequest);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Invalid payload" });
  }
  writeImages(parsed.data.images as SliderImage[]);
  res.json({ ok: true });
};
