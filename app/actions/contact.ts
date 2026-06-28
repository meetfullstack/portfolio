"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormState = {
  success: boolean;
  error: string | null;
};

export async function sendContactEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
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
