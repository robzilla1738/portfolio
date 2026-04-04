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
      repetition_penalty: 1.15,
      stream: true,
    }),
    signal: AbortSignal.timeout(180000),
  });

  // Cold start — don't count against rate limit
  if (res.status === 503 || res.status === 502) {
    return Response.json(
      { error: "Model is loading. Try again in a minute.", cold: true },
      { status: 202 }
    );
  }

  // Rate limit only after confirming model is awake
  const { allowed, resetAt } = rateLimit(`gemma-${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    const minsLeft = Math.ceil((resetAt - Date.now()) / 60000);
    return Response.json(
      { error: `Rate limit reached. Try again in ${minsLeft} minutes.`, rateLimited: true },
      { status: 429 }
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
      let contentBuf = "";
      let passedThinkCheck = false;
      let thinkAccum = "";
      // Repetition detection
      let recentOutput = "";
      const REP_WINDOW = 200;
      const REP_THRESHOLD = 4;

      function checkRepetition(text: string): boolean {
        recentOutput += text;
        if (recentOutput.length > REP_WINDOW * 2) {
          recentOutput = recentOutput.slice(-REP_WINDOW * 2);
        }
        if (recentOutput.length < 40) return false;
        // Check if any 10+ char substring repeats 4+ times
        const chunk = recentOutput.slice(-REP_WINDOW);
        for (let len = 10; len <= 30; len++) {
          const pattern = chunk.slice(-len);
          let count = 0;
          let idx = 0;
          while ((idx = chunk.indexOf(pattern, idx)) !== -1) { count++; idx += 1; }
          if (count >= REP_THRESHOLD) return true;
        }
        return false;
      }

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
                // Stream thinking content to client
                controller.enqueue(encoder.encode(delta.reasoning_content));
                continue;
              }

              const content = delta.content;
              if (!content) continue;

              // Buffer initial content to detect <think> tags
              if (!passedThinkCheck) {
                contentBuf += content;
                if (contentBuf.length >= 7 || (!contentBuf.trimStart().startsWith("<") && contentBuf.length > 1)) {
                  const trimmedBuf = contentBuf.trimStart();
                  if (trimmedBuf.startsWith("<think>")) {
                    inThinkBlock = true;
                    sentThinkingSignal = true;
                    controller.enqueue(encoder.encode("\x00T"));
                    const afterTag = trimmedBuf.slice(7);
                    if (afterTag.includes("</think>")) {
                      const endIdx = afterTag.indexOf("</think>");
                      const thinkContent = afterTag.slice(0, endIdx);
                      const realContent = afterTag.slice(endIdx + 8);
                      inThinkBlock = false;
                      if (thinkContent) controller.enqueue(encoder.encode(thinkContent));
                      if (realContent) {
                        controller.enqueue(encoder.encode("\x00R"));
                        controller.enqueue(encoder.encode(realContent));
                      }
                    }
                  } else {
                    // If we were streaming thinking via reasoning_content, signal end of thinking
                    if (sentThinkingSignal) {
                      controller.enqueue(encoder.encode("\x00R"));
                    }
                    controller.enqueue(encoder.encode(contentBuf));
                  }
                  passedThinkCheck = true;
                }
                continue;
              }

              // Handle ongoing think blocks — stream content
              if (inThinkBlock) {
                thinkAccum += content;
                const closeIdx = thinkAccum.indexOf("</think>");
                if (closeIdx !== -1) {
                  const thinkContent = thinkAccum.slice(0, closeIdx);
                  const realContent = thinkAccum.slice(closeIdx + 8);
                  inThinkBlock = false;
                  if (thinkContent) controller.enqueue(encoder.encode(thinkContent));
                  thinkAccum = "";
                  controller.enqueue(encoder.encode("\x00R"));
                  if (realContent) {
                    controller.enqueue(encoder.encode(realContent));
                  }
                } else {
                  // Stream thinking content as it arrives
                  if (thinkAccum.length > 8) {
                    const safe = thinkAccum.slice(0, -8); // keep last 8 chars in case </think> is split
                    if (safe) controller.enqueue(encoder.encode(safe));
                    thinkAccum = thinkAccum.slice(-8);
                  }
                }
                continue;
              }

              // Normal content — check for repetition
              if (checkRepetition(content)) {
                controller.enqueue(encoder.encode("\n\n*[Response truncated — model entered a repetition loop]*"));
                controller.close();
                return;
              }
              controller.enqueue(encoder.encode(content));
            } catch {
              // skip malformed SSE lines
            }
          }
        }
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
