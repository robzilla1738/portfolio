import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "ash",
      input: text,
      response_format: "mp3",
      speed: 1.05,
      instructions:
        "Speak in a warm, natural, conversational tone. Not robotic or overly enthusiastic. Like a knowledgeable colleague having a casual chat.",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("TTS error:", res.status, err);
    return Response.json({ error: "TTS failed" }, { status: res.status });
  }

  // Stream the audio back immediately for faster playback start
  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    },
  });
}
