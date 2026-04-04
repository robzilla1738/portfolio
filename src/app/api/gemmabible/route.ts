import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_ENDPOINT_URL = process.env.HF_GEMMABIBLE_ENDPOINT_URL;

const SYSTEM_PROMPT = `You are GemmaBible, a scholarly Bible study assistant grounded in the Berean Standard Bible (BSB). You exist solely to help people study the Bible, understand theology, and apply Scripture to life.

CORE PRINCIPLES:
1. SCRIPTURE FIRST: Always quote the BSB text exactly. Use "Book Chapter:Verse (BSB)" format.
2. PRECISION: Never paraphrase when quoting. If uncertain, say so.
3. MULTI-TRADITION: On debated matters, present Protestant, Catholic, and Orthodox perspectives fairly.
4. LINGUISTIC DEPTH: Reference Greek and Hebrew terms with transliteration and Strong's numbers.
5. CORRECTION: Gently correct misquoted scripture with exact BSB text.

FORMATTING RULES:
- Use plain markdown only. Never use LaTeX, MathJax, or $ delimiters.
- Write Greek words in plain Unicode Greek characters (e.g., ἀγάπη, κόσμος, πιστεύω) followed by transliteration in parentheses.
- Example: ἀγάπη (agapē, Strong's G26) — not $\\text{agapao}$.
- Use **bold** for emphasis, > for Scripture block quotes, and - for lists.

BOUNDARIES: Only answer Bible, theology, church history, and faith questions. Politely decline non-theological topics.`;

export async function POST(req: NextRequest) {
  if (!HF_API_TOKEN || !HF_ENDPOINT_URL) {
    return Response.json(
      { error: "GemmaBible endpoint not configured" },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, remaining, resetAt } = rateLimit(`gemma-${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });

  if (!allowed) {
    const minsLeft = Math.ceil((resetAt - Date.now()) / 60000);
    return Response.json(
      { error: `Rate limit reached. Try again in ${minsLeft} minutes.`, rateLimited: true },
      { status: 429 }
    );
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (prompt.length < 3 || prompt.length > 2000) {
    return Response.json({ error: "Invalid prompt length" }, { status: 400 });
  }

  const res = await fetch(`${HF_ENDPOINT_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "rhemabible/GemmaBible",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 2048,
      stream: true,
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (res.status === 503 || res.status === 502) {
    return Response.json(
      { error: "Model is loading. Try again in a minute.", cold: true },
      { status: 202 }
    );
  }

  if (!res.ok) {
    const err = await res.text();
    console.error("HF GemmaBible error:", res.status, err);
    return Response.json(
      { error: "GemmaBible is unavailable right now. Try again shortly." },
      { status: 503 }
    );
  }

  // Stream SSE from HF endpoint → plain text to client
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = res.body?.getReader();

  if (!reader) {
    return Response.json({ error: "No stream from model" }, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let inThinkBlock = false;
      let sentThinkingSignal = false;
      let contentBuf = ""; // buffer to detect <think> at start
      let passedThinkCheck = false;
      let thinkAccum = ""; // accumulate think block to find </think>
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;
              if (!delta) continue;

              // Check reasoning_content field (some APIs use this)
              if (delta.reasoning_content != null) {
                if (!sentThinkingSignal) {
                  sentThinkingSignal = true;
                  controller.enqueue(encoder.encode("\x00T"));
                }
                continue;
              }

              const content = delta.content;
              if (!content) continue;

              // Buffer initial content to detect <think> tags
              if (!passedThinkCheck) {
                contentBuf += content;
                // Check if we have enough to determine
                if (contentBuf.length >= 7 || (!contentBuf.trimStart().startsWith("<") && contentBuf.length > 1)) {
                  const trimmedBuf = contentBuf.trimStart();
                  if (trimmedBuf.startsWith("<think>")) {
                    // Thinking model with <think> tags
                    inThinkBlock = true;
                    sentThinkingSignal = true;
                    controller.enqueue(encoder.encode("\x00T"));
                    // Process remaining content after <think>
                    const afterTag = trimmedBuf.slice(7);
                    if (afterTag.includes("</think>")) {
                      const endIdx = afterTag.indexOf("</think>");
                      const realContent = afterTag.slice(endIdx + 8);
                      inThinkBlock = false;
                      if (realContent) {
                        controller.enqueue(encoder.encode("\x00R"));
                        controller.enqueue(encoder.encode(realContent));
                      }
                    }
                    // else still in think block, content dropped
                  } else {
                    // No thinking — flush buffered content
                    controller.enqueue(encoder.encode(contentBuf));
                  }
                  passedThinkCheck = true;
                }
                continue;
              }

              // After initial check — handle ongoing think blocks
              if (inThinkBlock) {
                // Accumulate and look for </think> closing tag
                thinkAccum += content;
                const closeIdx = thinkAccum.indexOf("</think>");
                if (closeIdx !== -1) {
                  const realContent = thinkAccum.slice(closeIdx + 8);
                  inThinkBlock = false;
                  thinkAccum = "";
                  controller.enqueue(encoder.encode("\x00R"));
                  if (realContent) {
                    controller.enqueue(encoder.encode(realContent));
                  }
                }
                continue;
              }

              // Normal content
              controller.enqueue(encoder.encode(content));
            } catch {
              // skip malformed SSE lines
            }
          }
        }
        // Flush any remaining buffered content
        if (!passedThinkCheck && contentBuf) {
          controller.enqueue(encoder.encode(contentBuf));
        }
      } catch (err) {
        console.error("GemmaBible stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
