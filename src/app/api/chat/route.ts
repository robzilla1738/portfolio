import { NextRequest } from "next/server";
import { projects } from "@/data/projects";
import { rateLimit } from "@/lib/rate-limit";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-5.4-nano";

const SYSTEM_PROMPT = `You are an AI assistant embedded on Robert Courson's portfolio website. You are friendly, concise, and knowledgeable.

Robert Courson is a full-stack developer with an AI specialty. He ships production apps end-to-end — web, mobile, backend, infrastructure — and also fine-tunes LLMs and builds RAG pipelines. Before engineering, he spent 10 years in design (brand strategy, creative direction, running a design agency), so he builds things that actually work for users. Contact: robertcourson96@gmail.com, GitHub: github.com/robzilla1738, LinkedIn: linkedin.com/in/robertcourson

His current main project is Rhema, a full-stack Bible study platform with web and iOS apps. He also fine-tuned two language models for biblical scholarship: BibleAI:7b (based on Qwen 2.5, 7B params) and GemmaBible:E4B (based on Google Gemma 4, 4.5B effective params). Both can be tried live on this website. Other projects include Memorwise (local-first NotebookLM alternative) and svvarm (a Claude Code design director plugin).

You have tools to look up Robert's projects, tech stack, career timeline, and contact info. Always use them when answering questions about Robert rather than guessing.

Use markdown: **bold**, \`code\`, bullet lists. Keep answers concise.

IMPORTANT: You ONLY answer questions related to Robert Courson — his work, projects, skills, experience, background, and how to contact him. If someone asks about anything unrelated (general knowledge, coding help, math, politics, other people, etc.), politely decline and redirect them. Say something like: "I'm here to help with questions about Robert and his work. Is there something about his projects or experience I can help with?"

Do NOT answer unrelated questions under any circumstances, even if the user insists.`;

// --- Tools ---

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_all_projects",
      description: "Get a summary of all of Robert's projects",
      parameters: { type: "object" as const, properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_project_details",
      description: "Get full details about a specific project by name",
      parameters: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const, description: "Project name: Rhema, Memorwise, svvarm, Fieldtrip, BibleAI:7b, or GemmaBible:E4B" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_tech_stack",
      description: "Get Robert's full tech stack by category",
      parameters: { type: "object" as const, properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_career_timeline",
      description: "Get Robert's career timeline from design to development",
      parameters: { type: "object" as const, properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_contact_info",
      description: "Get Robert's contact information and social links",
      parameters: { type: "object" as const, properties: {} },
    },
  },
];

function executeTool(name: string, args: Record<string, string>): unknown {
  switch (name) {
    case "get_all_projects":
      return projects.map((p) => ({
        title: p.title,
        tag: p.tag,
        hook: p.hook,
        url: p.url || (p.links ? p.links.map((l) => `${l.label}: ${l.url}`).join(", ") : null),
      }));

    case "get_project_details": {
      const q = (args.name || "").toLowerCase().trim();
      const project = projects.find((p) => p.title.toLowerCase() === q);
      if (!project) return { error: `Not found. Available: ${projects.map((p) => p.title).join(", ")}` };
      return {
        title: project.title,
        tag: project.tag,
        hook: project.hook,
        highlights: project.highlights,
        tech: project.tech,
        url: project.url || null,
        links: project.links || null,
      };
    }

    case "get_tech_stack":
      return {
        ai_ml: ["LLM Integration", "QLoRA Fine-Tuning", "RAG Pipelines", "LangChain", "LanceDB", "ChromaDB", "HuggingFace", "Ollama", "Unsloth", "Weights & Biases", "Python"],
        infrastructure: ["Vercel", "Cloudflare R2", "Clerk", "Stripe", "Square", "RevenueCat", "PostHog", "Sentry", "Mailgun"],
        design: ["Brand Strategy", "UI/UX", "Design Systems", "Creative Direction", "Adobe Creative Cloud", "Figma", "Midjourney", "Higgsfield", "Runway"],
        backend: ["Node.js", "tRPC", "Drizzle ORM", "Postgres", "Supabase", "Neon", "Firebase", "SQLite"],
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
        mobile: ["Expo", "React Native", "Swift"],
      };

    case "get_career_timeline":
      return [
        { period: "2026–present", role: "Founder & Developer", company: "Rhema", details: "Full-stack Bible study platform with web and iOS apps, 12 production integrations (Clerk, Stripe, RevenueCat, PostHog, Sentry, Neon, Cloudflare R2), and AI-powered study tools including an OpenAI-driven study canvas with 6 visualization types." },
        { period: "2015–present", role: "Founder", company: "Fieldtrip", details: "Subscription design + dev business. Flat monthly rate ($1,499–$1,899) for websites, brand identity, logos, and video. 1–2 day turnaround, unlimited revisions. This is what made Robert want to code — he kept designing things and depending on someone else to build them." },
        { period: "2023–2026", role: "Strategy & Partnerships", company: "Children's Cup", details: "Strategy and partnership development for nonprofit serving 16,600+ children across 61 CarePoints in 6 countries. Programs include physical health, mental wellness, and spiritual development." },
        { period: "2020–2024", role: "Creative + Next Gen", company: "Our Savior's Church", details: "Creative direction for a 15,000-member church across 7 locations in South Louisiana." },
        { period: "2020", role: "Consultant", company: "Ejento", details: "Augmented recruiting for venture-backed startups — hired Go-To-Market, Operational, Engineering and People leaders. Recruited for SpaceX, Scale AI, Cruise, GitLab, Skydio. VC partners included Sequoia, a16z, Google Ventures, First Round Capital, Accel, Greylock. Shut down March 2020 due to COVID-19." },
        { period: "2020", role: "Consultant", company: "Freenome", details: "AI genomics startup on the mission of early cancer detection ($238M Series B). ML Platform work enabling computational researchers to ingest datasets and train models on petabytes of data." },
        { period: "2018–2020", role: "Technical Recruiter & PM", company: "Tempo Automation", details: "Solo internal recruiter — closed 42 P0/P1 roles in two quarters. Placed VP of People, Product, Business Operations, Operations. As Technical PM, managed PCB assembly production for NASA, SpaceX, Blue Origin, Tesla, Zoox, Raytheon, Lockheed Martin." },
        { differentiator: "Full-stack developer who came from design. Ships cross-platform apps, fine-tunes LLMs, builds RAG systems, and designs the interfaces himself. 10 years in design, 4 years in engineering. Most developers can't design. Most designers can't ship production code. Robert does both." },
      ];

    case "get_contact_info":
      return {
        email: "robertcourson96@gmail.com",
        github: "https://github.com/robzilla1738",
        linkedin: "https://www.linkedin.com/in/robcourson/",
      };

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Types ---

interface ChatMessage {
  role: string;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: string;
  function: { name: string; arguments: string };
}

// --- Handler ---

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  // Rate limit: 30 requests per hour per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(ip, { limit: 30, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return Response.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 });
  }

  const conversation: ChatMessage[] = [...messages];

  // Tool-call loop (max 5 rounds)
  for (let round = 0; round < 5; round++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversation],
        tools,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", res.status, err);
      return Response.json({ error: "Chat failed", detail: err }, { status: res.status });
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) {
      return Response.json({ error: "No response" }, { status: 500 });
    }

    // No tool calls — stream the final text back
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      const text = msg.content || "";
      const encoder = new TextEncoder();

      const words = text.split(/(\s+)/);
      const chunks: string[] = [];
      let buf = "";
      for (const w of words) {
        buf += w;
        if (buf.length >= 15 || /[.!?,;:\n]$/.test(buf.trim())) {
          chunks.push(buf);
          buf = "";
        }
      }
      if (buf) chunks.push(buf);

      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 18));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Execute tool calls
    conversation.push({
      role: "assistant",
      content: msg.content || null,
      tool_calls: msg.tool_calls,
    });

    for (const tc of msg.tool_calls) {
      let args: Record<string, string> = {};
      try { args = JSON.parse(tc.function.arguments); } catch {}

      const result = executeTool(tc.function.name, args);
      conversation.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  return Response.json({ error: "Too many tool rounds" }, { status: 500 });
}
