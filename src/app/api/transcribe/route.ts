import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;

  if (!audio) {
    return Response.json({ error: "No audio file" }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", audio, "audio.webm");
  body.append("model", "gpt-4o-mini-transcribe");
  body.append("response_format", "text");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Transcription error:", res.status, err);
    return Response.json({ error: "Transcription failed" }, { status: res.status });
  }

  const text = await res.text();
  return Response.json({ text: text.trim() });
}
