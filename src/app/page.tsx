"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Mail, Brain, Cpu, Server, Zap } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { BibleAiDemo } from "@/components/bibleai-demo";
import { VideoPreview } from "@/components/ui/video-preview";
import { Chat } from "@/components/chat";
import { AnimatedBlobs } from "@/components/ui/blobs";
import { projects } from "@/data/projects";

const SKILL_GROUPS = [
  {
    label: "AI / ML",
    skills: ["LLM Integration", "QLoRA Fine-Tuning", "RAG Pipelines", "LangChain", "LanceDB", "ChromaDB", "HuggingFace", "Ollama", "Unsloth", "Weights & Biases", "Python"],
  },
  {
    label: "Infrastructure",
    skills: ["Vercel", "Cloudflare R2", "Clerk", "Stripe", "Square", "RevenueCat", "PostHog", "Sentry", "Mailgun"],
  },
  {
    label: "Design",
    skills: ["Brand Strategy", "UI/UX", "Design Systems", "Creative Direction", "Adobe Creative Cloud", "Figma", "Midjourney", "Higgsfield", "Runway"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "tRPC", "Drizzle ORM", "Postgres", "Supabase", "Neon", "Firebase", "SQLite"],
  },
  {
    label: "Frontend",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
  },
  {
    label: "Mobile",
    skills: ["Expo", "React Native", "Swift"],
  },
];

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/robzilla1738",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/robcourson/",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM6.863 20.452H3.812V9h3.051v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "#contact",
    icon: <Mail className="size-4" />,
  },
];


function ExperienceItem({
  role,
  company,
  period,
  highlight,
  details,
  reduced,
  index,
}: {
  role: string;
  company: string;
  period: string;
  highlight: string;
  details?: string;
  reduced: boolean | null;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="flex gap-4"
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex flex-col items-center pt-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <div className="mt-1 h-full w-px bg-border" />
      </div>
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif" }}>{role}</span>
            <span className="text-sm font-sans text-muted-foreground">· {company}</span>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{period}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {highlight}
        </p>
        {details && (
          <>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  className="mt-2 text-sm leading-relaxed text-muted-foreground"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {details}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-[11px] text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ContactSection({ scroll }: { scroll: (delay?: number) => Record<string, unknown> }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reason, setReason] = useState<string | null>(null);

  const reasons = ["Hiring", "Freelance project", "Collaboration", "Just saying hi"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const fullMessage = reason ? `[${reason}]\n\n${form.message}` : form.message;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, message: fullMessage }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setReason(null);
    } catch {
      setStatus("error");
    }
  }

  return (
    <motion.section
      id="contact"
      className="rounded-2xl border border-border p-6 sm:p-8"
      {...scroll()}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Looking for a dev role where I can build real products and go deep
            on AI. If that sounds like your team, send me a message.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === "sent" ? (
            <motion.div
              key="sent"
              className="flex flex-col items-center gap-2 py-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-foreground text-background">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">Message sent</p>
              <p className="text-xs text-muted-foreground">I&apos;ll get back to you soon.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Reason chips */}
              <div className="flex flex-wrap gap-2">
                {reasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(reason === r ? null : r)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      reason === r
                        ? "border-foreground/30 bg-foreground/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Name + Email side by side */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                />
              </div>

              <textarea
                placeholder="What's on your mind?"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="resize-none rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
              />

              <div className="flex items-center justify-between gap-3">
                {status === "error" ? (
                  <p className="text-xs text-red-500">Something went wrong. Try again.</p>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === "sending" ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export default function Home() {
  const reduced = useReducedMotion();
  const [bibleAiOpen, setBibleAiOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [navContactOpen, setNavContactOpen] = useState(false);
  const [navForm, setNavForm] = useState({ name: "", email: "", message: "" });
  const [navFormStatus, setNavFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [navReason, setNavReason] = useState<string | null>(null);
  const navContactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = ["about", "work", "experience", "contact"];
    const onScroll = () => {
      const offset = 120;
      // If near the bottom, activate contact
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 50) {
        setActiveSection("contact");
        return;
      }
      let current = "about";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close nav contact dropdown on click outside
  useEffect(() => {
    if (!navContactOpen) return;
    function handleClick(e: MouseEvent) {
      if (navContactRef.current && !navContactRef.current.contains(e.target as Node)) {
        setNavContactOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navContactOpen]);

  async function handleNavContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNavFormStatus("sending");
    try {
      const fullMessage = navReason ? `[${navReason}]\n\n${navForm.message}` : navForm.message;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...navForm, message: fullMessage }),
      });
      if (!res.ok) throw new Error();
      setNavFormStatus("sent");
      setNavForm({ name: "", email: "", message: "" });
      setNavReason(null);
      setTimeout(() => { setNavContactOpen(false); setNavFormStatus("idle"); }, 2000);
    } catch {
      setNavFormStatus("error");
    }
  }

  const anim = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 } as const,
          animate: { opacity: 1, y: 0 } as const,
          transition: { duration: 0.4, delay } as const,
        };

  const scroll = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true } as const,
          transition: { duration: 0.4, delay } as const,
        };

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-20 px-6 pt-24 pb-12 sm:px-10 sm:pt-32">
      {/* Hero */}
      <section className="flex flex-col gap-4">
        <motion.h1
          className="text-4xl font-semibold tracking-tighter sm:text-6xl"
          {...anim(0)}
        >
          Hi, I&apos;m Robert
        </motion.h1>
        <motion.p
          className="max-w-[600px] text-muted-foreground md:text-xl"
          {...anim(0.1)}
        >
          Designer turned developer. I build production apps end-to-end —
          and I&apos;ve also fine-tuned two language models and built RAG pipelines
          along the way. 10 years of design, 4 years of engineering.
        </motion.p>
      </section>

      {/* About */}
      <motion.section id="about" className="flex flex-col gap-4" {...scroll()}>
        <h2 className="text-3xl font-bold">TL;DR</h2>
        <p className="text-muted-foreground md:text-xl leading-relaxed">
          I ran a design agency called{" "}
          <a
            href="#experience"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            Fieldtrip (+ more)
          </a>
          {" "}for almost a decade — brand identity, creative direction, the
          whole thing. Good at it, but frustrated. I kept handing off work to
          developers and getting back something that missed the point.
        </p>
        <p className="text-muted-foreground md:text-xl leading-relaxed">
          So I learned to code. Four years later I&apos;ve shipped a cross-platform
          app to the App Store with 12 production integrations, fine-tuned two
          LLMs (7B and 4.5B parameters), built RAG pipelines with vector search,
          and open-sourced an AI research tool. I went deep because
          surface-level wasn&apos;t going to cut it.
        </p>
      </motion.section>

      {/* Projects */}
      <section id="work" className="flex flex-col gap-6">
        <motion.div className="flex flex-col gap-2" {...scroll()}>
          <div className="flex items-center justify-center">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Projects
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {projects.map((project, i) => {
            const videoMap: Record<string, string> = {
              "Rhema": "/rhema-hero.mp4",
              "svvarm": "/svvarm-demo.mp4",
              "Memorwise": "/memorwise-promo.mp4",
              "Fieldtrip": "/fieldtrip-demo.mp4",
            };
            const videoSrc = videoMap[project.title];

            // Side-by-side model cards
            if (project.title === "BibleAI:7b") {
              const gemma = projects.find((p) => p.title === "GemmaBible:E4B");
              return (
                <div key="model-pair" className="grid gap-6 md:grid-cols-2">
                  <ProjectCard
                    project={project}
                    index={i}
                    extra={
                      <BibleAiDemo
                        onOpenChange={setBibleAiOpen}
                        howItWorks={[
                          { icon: <Brain className="size-4 text-purple-400" />, title: "Custom fine-tuned model", desc: "7B parameter LLM trained on 20 theological datasets covering Protestant, Catholic, and Orthodox traditions." },
                          { icon: <Cpu className="size-4 text-purple-400" />, title: "QLoRA on Qwen 2.5", desc: "Two-stage training: continued pre-training on biblical corpus, then QLoRA fine-tuning with rank-64 adapters." },
                          { icon: <Server className="size-4 text-purple-400" />, title: "Serverless GPU", desc: "Runs on a serverless Nvidia T4 GPU via HuggingFace. Scales to zero when idle. ~60s cold start, then fast." },
                          { icon: <Zap className="size-4 text-purple-400" />, title: "340K+ cross-references", desc: "Greek & Hebrew morphology, Strong's numbers, and misquote correction baked into the training data." },
                        ]}
                      />
                    }
                  />
                  {gemma && (
                    <ProjectCard
                      project={gemma}
                      index={i + 1}
                      extra={
                        <BibleAiDemo
                          onOpenChange={setBibleAiOpen}
                          modelName="GemmaBible:E4B"
                          apiEndpoint="/api/gemmabible"
                          buttonLabel="Try GemmaBible"
                          subtitle="Scholarly responses from the Gemma 4-based model."
                          grainId="gemma-grain"
                          supportsThinking
                          howItWorks={[
                            { icon: <Brain className="size-4 text-purple-400" />, title: "Gemma 4 base model", desc: "4.5B effective parameters built on Google's Gemma 4 E4B-it architecture." },
                            { icon: <Cpu className="size-4 text-purple-400" />, title: "QLoRA fine-tuning", desc: "Trained on 8,000 instruction examples across 11 specialized generators using Unsloth with rank-64 adapters." },
                            { icon: <Server className="size-4 text-purple-400" />, title: "Serverless GPU", desc: "Runs on a serverless Nvidia T4 GPU via HuggingFace. Scales to zero when idle. ~60s cold start, then fast." },
                            { icon: <Zap className="size-4 text-purple-400" />, title: "Cross-tradition theology", desc: "Comparative theology, Greek/Hebrew exegesis, systematic theology, and creedal analysis." },
                          ]}
                        />
                      }
                    />
                  )}
                </div>
              );
            }

            // Skip GemmaBible in the normal loop (rendered above)
            if (project.title === "GemmaBible:E4B") return null;

            const card = (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
              />
            );

            if (videoSrc) {
              return (
                <VideoPreview key={project.title} src={videoSrc} width={400} height={250} disabled={bibleAiOpen}>
                  <div>{card}</div>
                </VideoPreview>
              );
            }

            return card;
          })}
        </div>
      </section>

      {/* Skills */}
      <motion.section className="flex flex-col gap-6" {...scroll()}>
        <h2 className="text-3xl font-bold">Skills</h2>
        <div className="columns-2 gap-5 sm:columns-3">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="mb-5 flex break-inside-avoid flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground/90 transition-colors hover:border-foreground/20 hover:text-foreground sm:px-3"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Experience */}
      <section id="experience" className="flex flex-col gap-6">
        <motion.div className="flex flex-col gap-2" {...scroll()}>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Experience
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-1">
          <ExperienceItem
            role="Founder & Developer"
            company="Rhema"
            period="2026 – Present"
            highlight="Full-stack Bible study platform — web and iOS from one codebase. 12 production integrations, AI-powered study canvas with OpenAI tool-calling."
            reduced={reduced}
            index={0}
          />
          <ExperienceItem
            role="Founder"
            company="Fieldtrip"
            period="2015 – Present"
            highlight="Subscription design + dev business replacing complex project pricing with a flat monthly fee."
            details="Unlimited design requests handled one at a time. Fast turnarounds, unlimited revisions, custom designs for all branding needs. Predictable pricing that makes budgeting easy for clients."
            reduced={reduced}
            index={1}
          />
          <ExperienceItem
            role="Strategy & Partnerships"
            company="Children's Cup"
            period="2023 – 2026"
            highlight="Strategy and partnerships for a nonprofit serving 16,600+ children across 61 CarePoints in 6 countries."
            details="Worked on strategy and partnership development. The organization's program includes physical health initiatives, mental wellness support, and spiritual fullness activities designed to empower children."
            reduced={reduced}
            index={2}
          />
          <ExperienceItem
            role="Creative + Next Gen"
            company="Our Savior's Church"
            period="2020 – 2024"
            highlight="Creative direction for a 15,000-member church across 7 locations in South Louisiana."
            reduced={reduced}
            index={3}
          />
          <ExperienceItem
            role="Consultant"
            company="Ejento"
            period="2020 (COVID)"
            highlight="Technical recruiting for SpaceX, Scale AI, Cruise, GitLab, Skydio. Backed by Sequoia, a16z, Google Ventures."
            details="Augmented recruiting — worked in-house as an extension of client teams. Hired Go-To-Market, Operational, Engineering and People leaders for venture-backed startups. VC partners included Sequoia Capital, Andreessen-Horowitz, Google Ventures, First Round Capital, Accel Partners, Greylock, and more. Shut down March 2020 due to COVID-19."
            reduced={reduced}
            index={4}
          />
          <ExperienceItem
            role="Consultant"
            company="Freenome"
            period="2020 (COVID)"
            highlight="ML Platform work at an AI genomics startup ($238M Series B) focused on early cancer detection."
            details="Built infrastructure for computational researchers to ingest datasets and train models on petabytes of genomic data. Featurization pipelines and ML experimentation platform."
            reduced={reduced}
            index={5}
          />
          <ExperienceItem
            role="Technical Recruiter & PM"
            company="Tempo Automation"
            period="2018 – 2020"
            highlight="Closed 42 P0/P1 roles in 2 quarters. Managed PCB production for NASA, SpaceX, Tesla, Lockheed Martin."
            details="Solo internal recruiter for two quarters before building out the team. Worked with CEO on executive searches for VP of People, Product, Business Operations, Operations — all placed. Managed 7+ recruiting agencies and 10+ hiring managers across C/VP/Director levels. As Technical PM, managed PCB assembly production for customers in aerospace (NASA, SpaceX, Blue Origin), medical device, defense (Raytheon, Lockheed Martin), and autonomous vehicles (Tesla, Zoox). Cross-functional work with Software, Operations, Finance, Sales, Manufacturing, and Product teams."
            reduced={reduced}
            index={6}
          />
        </div>
      </section>


{/* Contact */}
      <ContactSection scroll={scroll} />

      {/* Navbar */}
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        initial={reduced ? undefined : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-10">
          <Image src="/logo.png" alt="RC" width={32} height={32} className="rounded-sm invert dark:invert-0" />
          <div className="flex items-center gap-4 sm:gap-6">
            {[
              { id: "about", label: "About" },
              { id: "work", label: "Projects" },
              { id: "experience", label: "Experience" },
              { id: "contact", label: "Contact" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`hidden text-sm transition-colors hover:text-foreground sm:block ${activeSection === link.id ? "text-foreground" : "text-muted-foreground"}`}
              >
                {link.label}
              </a>
            ))}
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) =>
                s.label === "Email" ? (
                  <div key={s.label} className="relative" ref={navContactRef}>
                    <button
                      onClick={() => {
                        // Mobile: scroll to contact section
                        if (window.innerWidth < 640) {
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                          return;
                        }
                        setNavContactOpen(!navContactOpen);
                        if (navFormStatus === "sent") { setNavFormStatus("idle"); }
                      }}
                      aria-label="Email"
                      className={`p-1 transition-colors hover:text-foreground ${navContactOpen ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.icon}
                    </button>
                    <AnimatePresence>
                      {navContactOpen && (
                        <motion.div
                          className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-xl"
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
                        >
                          <AnimatePresence mode="wait">
                            {navFormStatus === "sent" ? (
                              <motion.div
                                key="sent"
                                className="flex flex-col items-center gap-2 py-4"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <p className="text-xs text-muted-foreground">Sent!</p>
                              </motion.div>
                            ) : (
                              <motion.form
                                key="form"
                                onSubmit={handleNavContactSubmit}
                                className="flex flex-col gap-3"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="flex flex-wrap gap-1.5">
                                  {["Hiring", "Freelance", "Collab", "Hello"].map((r) => (
                                    <button
                                      key={r}
                                      type="button"
                                      onClick={() => setNavReason(navReason === r ? null : r)}
                                      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                                        navReason === r
                                          ? "border-foreground/30 bg-foreground/10 text-foreground"
                                          : "border-border text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    required
                                    value={navForm.name}
                                    onChange={(e) => setNavForm({ ...navForm, name: e.target.value })}
                                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                                  />
                                  <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={navForm.email}
                                    onChange={(e) => setNavForm({ ...navForm, email: e.target.value })}
                                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                                  />
                                </div>
                                <textarea
                                  placeholder="Message..."
                                  required
                                  rows={3}
                                  value={navForm.message}
                                  onChange={(e) => setNavForm({ ...navForm, message: e.target.value })}
                                  className="resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
                                />
                                <div className="flex items-center justify-between">
                                  {navFormStatus === "error" ? (
                                    <span className="text-[11px] text-red-500">Failed. Retry.</span>
                                  ) : <span />}
                                  <button
                                    type="submit"
                                    disabled={navFormStatus === "sending"}
                                    className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                                  >
                                    {navFormStatus === "sending" ? "..." : "Send"}
                                  </button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.icon}
                  </a>
                )
              )}
              <AnimatedThemeToggler className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4" />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Chat */}
      <Chat hidden={bibleAiOpen} />
    </div>
  );
}
