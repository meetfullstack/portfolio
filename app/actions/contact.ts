"use server";

import { Resend } from "resend";
import { z } from "zod";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(254, "Email is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

type FormState = {
  success: boolean;
  error: string | null;
};

// In-memory rate limit: 3 submissions per 10 minutes per IP.
// Resets on server restart / is per-instance in serverless — a pragmatic
// baseline, not a substitute for a proper store like Upstash if abuse grows.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const submissions = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = submissions.get(key);

  if (!entry || now > entry.resetAt) {
    submissions.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function sendContactEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot — real users never fill this, bots often do. Pretend success
  // so bots don't learn to look for a different signal.
  if (formData.get("website")) {
    return { success: true, error: null };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return {
      success: false,
      error: "Too many messages sent. Please try again later.",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = schema.safeParse(raw);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: firstError };
  }

  const { name, email, message } = result.data;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: "meetupadhyay158@gmail.com",
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("Resend error:", err);
    return {
      success: false,
      error: "Failed to send message. Please try again.",
    };
  }
}
