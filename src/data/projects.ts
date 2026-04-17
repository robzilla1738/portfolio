export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  tag: string;
  title: string;
  hook: string;
  highlights: string[];
  tech: string[];
  url?: string;
  links?: ProjectLink[];
}

export const projects: Project[] = [
  {
    tag: "Full-Stack Platform \u00b7 Web & iOS",
    title: "Rhema",
    hook: "Full-stack Bible study platform for web and iOS from one codebase. The AI study canvas turns any verse into timelines, genealogies, maps, and cross-reference graphs.",
    highlights: [
      "Content scope: 3 translations, 90K+ verse commentaries, full theological reference library wired into the study canvas",
      "12 production integrations wired end-to-end: Clerk (auth), Stripe (web payments), RevenueCat (iOS subscriptions), PostHog (analytics), Sentry (monitoring), Neon (Postgres), Cloudflare R2 (media), Mailgun (transactional email), and more",
      "OpenAI tool-calling drives the study canvas \u2014 6 visualization types including timelines, genealogies, maps, cross-reference graphs, and commentary sidebars generated directly from verses",
      "Cross-platform subscription sync between Stripe (web) and RevenueCat (iOS) in real time, so upgrades on one device unlock features on the other in seconds",
      "Shared TypeScript codebase across Next.js (web) and Expo (iOS) with a unified tRPC API and Drizzle/Neon Postgres backend",
    ],
    tech: [
      "Next.js",
      "Expo",
      "TypeScript",
      "tRPC",
      "Neon Postgres",
      "OpenAI",
      "Clerk",
      "Stripe",
      "RevenueCat",
      "Cloudflare R2",
    ],
    url: "https://rhemabible.co",
  },
  {
    tag: "Open-Source AI Tool",
    title: "Memorwise",
    hook: "Local-first alternative to NotebookLM. Ingest PDFs, video, audio, URLs \u2014 ask questions, get cited answers. Everything stays on your machine.",
    highlights: [
      "RAG pipeline with LanceDB vector search and SQLite metadata \u2014 every answer cites its source document, with inline references back to the exact page or timestamp",
      "8 LLM providers supported. Runs fully local with Ollama, or plugs into OpenAI, Anthropic, Gemini, Groq, Mistral, DeepSeek, and OpenRouter via a unified provider layer",
      "Ingestion handles PDFs, transcribed audio, transcribed video, web URLs, and plain text \u2014 all normalized into the same chunked, embedded format",
      "MCP server with 35 tools across 12 categories ships with every install, so any MCP-compatible client can query the knowledge base directly",
      "Open source under MIT. Built for privacy-first knowledge work: nothing leaves your machine unless you explicitly wire a hosted provider",
    ],
    tech: [
      "Next.js",
      "React 19",
      "SQLite",
      "LanceDB",
      "Ollama",
      "Zustand",
      "Tailwind",
    ],
    url: "https://memorwise.com",
  },
  {
    tag: "Claude Code Plugin",
    title: "svvarm",
    hook: "AI-generated interfaces all look the same. This is a design director plugin for Claude Code, built from studying how senior designers make decisions. Every design choice in one context window.",
    highlights: [
      "Scores any design 0\u2013100 for AI genericness across 38 distinct anti-slop patterns, with specific, actionable fixes for each pattern flagged",
      "OKLCH-first color architecture with perceptually-uniform lightness steps, contrast-checked for WCAG AA out of the box",
      "Fluid type scales built on clamp() formulas, 19 curated font pairings, and prescriptive rules for line-height, measure, and hierarchy",
      "Covers layout (spacing systems, grid logic), motion (timing curves, reduced-motion compliance), and accessibility as first-class concerns",
      "Published on the Claude Code marketplace. Open source, MIT license. Designed to be dropped into any Claude Code project and immediately raise the design ceiling",
    ],
    tech: [
      "Claude Code",
      "Markdown",
      "Python",
      "OKLCH",
      "WCAG AA",
      "Open Source",
    ],
    url: "https://github.com/robzilla1738/svvarm",
  },
  {
    tag: "Design Business",
    title: "Fieldtrip",
    hook: "The design agency I ran before I learned to code. Monthly subscription for unlimited design \u2014 websites, brand identity, logos, video. No project-by-project pricing.",
    highlights: [
      "$1,499\u2013$1,899/month flat rate replacing the chaos of per-project estimates \u2014 predictable pricing, predictable throughput",
      "1\u20132 day turnaround with unlimited revisions. Built the internal ops playbook and request-queue tooling that actually delivers on that promise without burning out the team",
      "Scope covers websites, brand identity, logos, and video under one subscription \u2014 full creative direction, not just production work",
      "Long-tail client retention by treating design as an ongoing relationship, not one-off deliverables",
      "This is where I hit the wall that made me want to code. Designing things I couldn\u2019t ship myself stopped being acceptable",
    ],
    tech: [
      "Brand Strategy",
      "Visual Design",
      "Web Design",
      "Subscription Model",
    ],
    url: "https://letsfieldtrip.co",
  },
  {
    tag: "Machine Learning \u00b7 Fine-Tuned LLM",
    title: "GemmaBible:E4B",
    hook: "Gemma 4 E4B refined for Bible, theology, and church history. Trained explicitly against fabrication: it won\u2019t invent verses, Greek, or scholar quotes.",
    highlights: [
      "Three-stage training: Continued Pre-Training (CPT) on a curated theological corpus, then Supervised Fine-Tuning (SFT) on 15,289 instruction examples, then Direct Preference Optimization (DPO) on 967 human preference pairs",
      "SFT details: 3 epochs, LoRA rank 64, trainable params 169M of 8.16B (2.08%), final eval loss 0.4368, final train loss 0.1852",
      "DPO details: 2 epochs, \u03b2 = 0.1, LoRA rank 32, learning rate 5e-6, final train loss 0.061",
      "Trained explicitly against fabrication \u2014 does not invent verses, references, Greek, or scholar quotes. If uncertain, it says so",
      "Scope-locked to Bible / theology / church history / faith Q&A. Cites the Berean Standard Bible (BSB) for exact quoting",
      "Shipped as merged safetensors, Q8_0 GGUF, and BF16 GGUF. Published on Ollama as \u201cbibleaiq8\u201d and \u201cbibleaibf16\u201d with training logs and checksums for full reproducibility",
    ],
    tech: [
      "Python",
      "Unsloth",
      "QLoRA",
      "Gemma 4",
      "HuggingFace",
      "Weights & Biases",
    ],
    links: [
      { label: "Ollama", url: "https://ollama.com/robzilla/bibleai" },
      { label: "HuggingFace", url: "https://huggingface.co/rhemabible/BibleAI" },
    ],
  },
];
