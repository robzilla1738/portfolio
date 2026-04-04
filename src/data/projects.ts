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
    hook: "Full-stack Bible study platform: 78 books, 3 translations, 90K+ verse commentaries. The AI study canvas uses OpenAI tool-calling to generate timelines, genealogies, and maps from Scripture. One codebase for web and iOS.",
    highlights: [
      "12 production integrations: Clerk, Stripe, RevenueCat, PostHog, Sentry, Neon, Cloudflare R2",
      "OpenAI tool-calling drives the study canvas \u2014 6 visualization types including timelines, genealogies, and maps",
      "Cross-platform subscription sync between Stripe (web) and RevenueCat (iOS) in real time",
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
      "RAG pipeline with LanceDB vector search \u2014 every answer cites its source document",
      "8 LLM providers supported. Runs fully local with Ollama or connects to OpenAI, Anthropic, Gemini",
      "MCP server with 35 tools across 12 categories ships with every install",
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
    hook: "AI-generated interfaces all look the same. This is a design director plugin for Claude Code \u2014 8,600+ lines covering color theory, typography, layout, and 38 anti-slop detection patterns. Every design decision in one context window.",
    highlights: [
      "Scores designs 0\u2013100 for AI genericness across 38 patterns, with specific fixes for each",
      "OKLCH color architecture, fluid type scales with clamp() formulas, 19 curated font pairings",
      "Published on the Claude Code marketplace. Open source, MIT license",
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
      "$1,499\u2013$1,899/month flat rate. Websites, brand identity, logos, video",
      "1\u20132 day turnaround, unlimited revisions. Built the ops to actually deliver on that",
      "This is where I hit the wall that made me want to code \u2014 I kept designing things I couldn\u2019t build",
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
    title: "BibleAI:7b",
    hook: "7B-parameter LLM fine-tuned on Qwen 2.5 for biblical scholarship. Two-stage training: continued pre-training on a 17MB theological corpus, then QLoRA fine-tuning across 20 datasets spanning Protestant, Catholic, and Orthodox sources.",
    highlights: [
      "17MB training corpus weighted for fair coverage across Protestant, Catholic, and Orthodox traditions",
      "Greek and Hebrew morphological analysis with 340K+ cross-references and Strong\u2019s numbers",
      "Trained to detect and correct misquoted Scripture \u2014 not just generate text",
    ],
    tech: [
      "Python",
      "Unsloth",
      "QLoRA",
      "HuggingFace",
      "Weights & Biases",
      "RunPod",
      "Ollama",
    ],
    links: [
      { label: "Ollama", url: "https://ollama.com/robzilla/bibleai" },
      { label: "HuggingFace", url: "https://huggingface.co/rhemabible/BibleAI" },
    ],
  },
  {
    tag: "Machine Learning \u00b7 Fine-Tuned LLM",
    title: "GemmaBible:E4B",
    hook: "4.5B effective parameter model fine-tuned on Gemma 4 E4B-it. QLoRA with rank-64 adapters on 8,000 instruction examples \u2014 comparative theology, Greek/Hebrew exegesis, creedal analysis.",
    highlights: [
      "Built on Google\u2019s Gemma 4 E4B-it \u2014 their latest efficient architecture with 4.5B effective parameters",
      "11 specialized training generators for systematic theology and cross-tradition analysis",
      "Precise BSB Scripture quoting, Strong\u2019s numbers, and misquotation correction",
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
      { label: "Ollama", url: "https://ollama.com/robzilla/gemmabible" },
      { label: "HuggingFace", url: "https://huggingface.co/rhemabible/GemmaBible" },
    ],
  },
];
