import { RequestHandler } from "express";
import { z } from "zod";
import { ContactFormData, ContactResponse } from "@shared/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
  recaptchaToken: z.string().optional(),
});

async function verifyRecaptcha(token?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // not configured => allow for now
  if (!token) return false;
  try {
    const resp = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }).toString(),
      },
    );
    const data = (await resp.json()) as { success: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export const postContact: RequestHandler = async (req, res) => {
  const parsed = schema.safeParse(req.body as ContactFormData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
    });
    const response: ContactResponse = {
      ok: false,
      message: "Validation failed",
      fieldErrors,
    };
    return res.status(400).json(response);
  }

  const captchaOk = await verifyRecaptcha(parsed.data.recaptchaToken);
  if (!captchaOk) {
    const response: ContactResponse = {
      ok: false,
      message: "reCAPTCHA verification failed",
      fieldErrors: { recaptchaToken: "Invalid captcha" },
    };
    return res.status(400).json(response);
  }

  // In a real app, send an email or persist to DB here.
  const response: ContactResponse = {
    ok: true,
    message: "Thank you! We'll get back to you soon.",
  };
  res.json(response);
};
