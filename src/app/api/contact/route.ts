import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export async function POST(req: NextRequest) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json({ error: "Email not configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`contact-${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });

  if (!allowed) {
    return Response.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return Response.json({ error: "Input too long" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact" <${GMAIL_USER}>`,
    to: GMAIL_USER,
    replyTo: email,
    subject: `Portfolio: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  return Response.json({ ok: true });
}
