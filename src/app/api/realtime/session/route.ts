import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const VOICE_INSTRUCTIONS = `You are an AI voice assistant on Robert Courson's portfolio website. Be warm, concise, and conversational.

Robert is a designer turned developer. 10 years in marketing/design, 4 years building full-stack systems. His projects include Rhema (Bible study platform), Memorwise (open-source AI tool), svvarm (Claude Code plugin), BibleAI:7b (fine-tuned LLM), and Fieldtrip (design agency). Contact: robertcourson96@gmail.com

ONLY answer questions about Robert, his work, projects, skills, experience. Politely redirect unrelated questions.

Keep voice responses short and natural. 2-3 sentences max.`;

export async function POST(_req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  // Create an ephemeral key for the client to connect to the Realtime API
  const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-realtime-1.5",
      modalities: ["text", "audio"],
      voice: "ash",
      instructions: VOICE_INSTRUCTIONS,
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      input_audio_transcription: {
        model: "gpt-4o-mini-transcribe",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Realtime session error:", res.status, err);
    return Response.json({ error: "Failed to create session", detail: err }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
