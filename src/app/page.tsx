"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Mail, X } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { VideoPreview } from "@/components/ui/video-preview";
import { Chat } from "@/components/chat";
import { projects, type Project } from "@/data/projects";

interface DetailSource {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  body?: string;
  highlights?: string[];
  tech?: string[];
}

const PRIMARY_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Expo",
  "Node.js",
  "tRPC",
  "Postgres",
  "LLM Integration",
];

const ALSO_FAMILIAR: { name: string; category: AlsoCategory }[] = [
  { name: "RAG Pipelines", category: "AI / ML" },
  { name: "Python", category: "AI / ML" },
  { name: "QLoRA Fine-Tuning", category: "AI / ML" },
  { name: "Unsloth", category: "AI / ML" },
  { name: "HuggingFace", category: "AI / ML" },
  { name: "Ollama", category: "AI / ML" },
  { name: "LanceDB", category: "AI / ML" },
  { name: "ChromaDB", category: "AI / ML" },
  { name: "LangChain", category: "AI / ML" },
  { name: "Weights & Biases", category: "AI / ML" },
  { name: "Swift", category: "Mobile" },
  { name: "React Native", category: "Mobile" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "shadcn/ui", category: "Frontend" },
  { name: "Drizzle ORM", category: "Backend" },
  { name: "Neon", category: "Backend" },
  { name: "Supabase", category: "Backend" },
  { name: "Vercel", category: "Infrastructure" },
  { name: "Cloudflare R2", category: "Infrastructure" },
  { name: "Clerk", category: "Infrastructure" },
  { name: "Stripe", category: "Infrastructure" },
  { name: "RevenueCat", category: "Infrastructure" },
  { name: "PostHog", category: "Infrastructure" },
  { name: "Sentry", category: "Infrastructure" },
  { name: "Mailgun", category: "Infrastructure" },
  { name: "Figma", category: "Design" },
  { name: "Adobe Creative Cloud", category: "Design" },
  { name: "Midjourney", category: "Design" },
  { name: "Runway", category: "Design" },
];

type AlsoCategory =
  | "AI / ML"
  | "Mobile"
  | "Frontend"
  | "Backend"
  | "Infrastructure"
  | "Design";

const ALSO_CATEGORIES: AlsoCategory[] = [
  "AI / ML",
  "Frontend",
  "Backend",
  "Mobile",
  "Infrastructure",
  "Design",
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
  highlights,
  reduced,
  index,
  isActive,
  onShowDetails,
}: {
  role: string;
  company: string;
  period: string;
  highlight: string;
  details?: string;
  highlights?: string[];
  reduced: boolean | null;
  index: number;
  isActive?: boolean;
  onShowDetails?: (detail: DetailSource) => void;
}) {
  const hasMore = Boolean(details || (highlights && highlights.length > 0));
  return (
    <motion.div
      className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-1 pb-10 sm:grid-cols-[9rem_1fr] sm:gap-x-10 sm:pb-12"
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <span className="pt-0.5 text-xs tabular-nums text-muted-foreground">{period}</span>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-base font-medium text-foreground">{role}</h3>
          <span className="text-sm text-muted-foreground">· {company}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {highlight}
        </p>
        {hasMore && onShowDetails && (
          <button
            onClick={() =>
              onShowDetails({
                id: `exp-${company}`,
                title: role,
                subtitle: company,
                meta: period,
                body: details,
                highlights,
              })
            }
            className={`group/read flex items-center gap-1.5 self-start text-sm transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="underline underline-offset-2">
              {isActive ? "Hide" : "Read more"}
            </span>
            <Image
              src="/pixel-arrow.png"
              alt=""
              width={12}
              height={12}
              className={`size-3.5 opacity-60 transition-transform duration-500 ease-out [image-rendering:pixelated] invert dark:invert-0 ${
                isActive ? "rotate-90" : "group-hover/read:translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ContactSection({
  scroll,
  onOpen,
}: {
  scroll: (delay?: number) => Record<string, unknown>;
  onOpen: () => void;
}) {
  return (
    <motion.section id="contact" className="flex flex-col gap-5" {...scroll()}>
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Get in Touch
        </h2>
        <p className="max-w-md text-sm text-foreground">
          Looking for a dev role where I can build real products and go deep
          on AI. If that sounds like your team, send me a message.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        Get in touch
      </button>
    </motion.section>
  );
}

function ContactForm({ onClose }: { onClose: () => void }) {
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
    <>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Get in touch
        </p>
        <div className="-mt-1 flex items-center gap-2">
          <span className="hidden items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground sm:flex">
            Press
            <kbd className="inline-flex h-4 items-center justify-center rounded border border-border bg-background px-1 font-sans text-[10px] text-foreground/70">
              Esc
            </kbd>
            to close
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-lg font-medium leading-tight text-foreground">
          Send me a message
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          I&apos;ll get back to you soon.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            className="mt-6 flex flex-col items-start gap-2 py-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            className="mt-5 flex flex-col gap-3"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(reason === r ? null : r)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    reason === r
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input
                type="text"
                placeholder="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-sm border border-border bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-sm border border-border bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
            </div>

            <textarea
              placeholder="What's on your mind?"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="resize-none rounded-sm border border-border bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
              {status === "error" && (
                <p className="text-xs text-red-500">Something went wrong. Try again.</p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const reduced = useReducedMotion();
  const [activeDetail, setActiveDetail] = useState<DetailSource | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const openDetail = (detail: DetailSource) => {
    setChatOpen(false);
    setContactOpen(false);
    setActiveDetail((cur) => (cur?.id === detail.id ? null : detail));
  };

  const openChat = () => {
    setActiveDetail(null);
    setContactOpen(false);
    setChatOpen(true);
  };

  const openContact = () => {
    setActiveDetail(null);
    setChatOpen(false);
    setContactOpen(true);
  };
  const [activeSection, setActiveSection] = useState("about");
  const [alsoExpanded, setAlsoExpanded] = useState(false);
  const [alsoFilter, setAlsoFilter] = useState<AlsoCategory | null>(null);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const filteredAlso = alsoFilter
    ? ALSO_FAMILIAR.filter((item) => item.category === alsoFilter)
    : ALSO_FAMILIAR;

  useEffect(() => {
    const ids = ["about", "work", "experience", "contact"];
    const onScroll = () => {
      const offset = 120;
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

  // "/" opens chat, "Escape" closes chat or detail panel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const inInput = tag === "input" || tag === "textarea" || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        openChat();
      }
      if (e.key === "Escape") {
        setChatOpen(false);
        setActiveDetail(null);
        setContactOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const anim = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 } as const,
          animate: { opacity: 1, y: 0 } as const,
          transition: { duration: 0.4, delay } as const,
        };

  const scroll = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true } as const,
          transition: { duration: 0.4, delay } as const,
        };

  return (
    <div className="flex min-h-dvh max-w-2xl flex-col gap-16 px-6 pt-24 pb-16 sm:pl-16 sm:pr-8">
      {/* Hero */}
      <section className="flex flex-col gap-3">
        <motion.h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          {...anim(0)}
        >
          Hi, I&apos;m Robert
        </motion.h1>
        <motion.p
          className="max-w-[560px] text-foreground"
          {...anim(0.1)}
        >
          I kept handing off work to developers and getting back
          something that missed the point. So I learned to code.
        </motion.p>
      </section>

      {/* About */}
      <section id="about" className="flex flex-col gap-3">
        <motion.h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground" {...scroll()}>
          TL;DR
        </motion.h2>
        <motion.p className="leading-relaxed text-foreground" {...scroll(0.08)}>
          I ran a design agency called{" "}
          <a
            href="#experience"
            className="underline underline-offset-4 hover:text-muted-foreground"
          >
            Fieldtrip (+ more)
          </a>
          {" "}for almost a decade. Brand identity, creative direction, the
          whole thing. 10 years of design got me good at making things that
          look right. It didn&apos;t get me things that shipped.
        </motion.p>
        <motion.p className="leading-relaxed text-foreground" {...scroll(0.16)}>
          So I learned to code. Four years later I&apos;ve shipped a cross-platform
          app to the App Store, fine-tuned language models, and open-sourced
          an AI research tool. I went deep because surface-level wasn&apos;t going
          to cut it.
        </motion.p>
      </section>

      {/* Projects */}
      <section id="work" className="flex flex-col gap-6">
        <motion.h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground" {...scroll()}>
          Projects
        </motion.h2>

        <div className="flex flex-col gap-12 sm:gap-14">
          {projects.map((project, i) => {
            const videoMap: Record<string, string> = {
              "Rhema": "/rhema-hero.mp4",
              "svvarm": "/svvarm-demo.mp4",
              "Memorwise": "/memorwise-promo.mp4",
              "Fieldtrip": "/fieldtrip-demo.mp4",
            };
            const videoSrc = videoMap[project.title];

            const handleShowDetails = (p: Project) =>
              openDetail({
                id: `project-${p.title}`,
                title: p.title,
                subtitle: p.tag,
                highlights: p.highlights,
                tech: p.tech,
              });

            const card = (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                onShowDetails={handleShowDetails}
                isActive={activeDetail?.id === `project-${project.title}`}
              />
            );

            if (videoSrc) {
              return (
                <VideoPreview key={project.title} src={videoSrc} width={280} height={175}>
                  <div>{card}</div>
                </VideoPreview>
              );
            }

            return card;
          })}
        </div>
      </section>

      {/* Skills */}
      <section className="flex flex-col gap-4">
        <motion.h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground" {...scroll()}>
          Stack
        </motion.h2>
        <div className="flex flex-col gap-3">
          <motion.p className="leading-relaxed text-foreground" {...scroll(0.05)}>
            {PRIMARY_STACK.join(" · ")}
          </motion.p>
          <motion.div
            className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
          >
            <button
              type="button"
              onClick={() => setAlsoExpanded((v) => !v)}
              className="group flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground sm:w-32 sm:pt-1"
              aria-expanded={alsoExpanded}
            >
              <span>Also familiar</span>
              <Image
                src="/pixel-arrow.png"
                alt=""
                width={12}
                height={12}
                className={`size-3 opacity-70 transition-transform duration-500 ease-out [image-rendering:pixelated] invert dark:invert-0 ${alsoExpanded ? "rotate-90" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {alsoExpanded && (
                <motion.div
                  key="also-familiar-panel"
                  className="flex flex-1 flex-col gap-2 overflow-hidden"
                  initial={reduced ? undefined : { opacity: 0, height: 0 }}
                  animate={reduced ? undefined : { opacity: 1, height: "auto" }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.25 }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAlsoFilter(null)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        alsoFilter === null
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {ALSO_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAlsoFilter(cat)}
                        className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                          alsoFilter === cat
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {filteredAlso.map((item) => item.name).join(" · ")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="flex flex-col gap-6">
        <motion.h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground" {...scroll()}>
          Experience
        </motion.h2>

        <div className="flex flex-col">
          {[
            {
              role: "Founder & Developer",
              company: "Rhema",
              period: "2026 – Present",
              highlight: "Full-stack Bible study platform. Web and iOS from one codebase, with an AI-powered study canvas.",
              details:
                "Solo-building a cross-platform Bible study product. One TypeScript codebase ships to web via Next.js and to iOS via Expo, with a shared tRPC API layer and a shared design system. The AI study canvas uses OpenAI tool-calling to generate six visualization types straight from Scripture: timelines, genealogies, maps, cross-reference graphs, and others.",
              highlights: [
                "12 production integrations wired end-to-end: Clerk for auth, Stripe for web subscriptions, RevenueCat for iOS subscriptions, PostHog for product analytics, Sentry for error monitoring, Neon for Postgres, Cloudflare R2 for media",
                "Real-time cross-platform subscription sync between Stripe and RevenueCat so a user upgrading on the web is unlocked on their iPhone in seconds",
                "Continuous deploys on Vercel and EAS. Zero-downtime schema migrations via Drizzle",
              ],
            },
            {
              role: "Founder",
              company: "Fieldtrip",
              period: "2015 – Present",
              highlight: "Subscription design agency. Flat monthly pricing instead of per-project estimates.",
              details:
                "The subscription design agency I ran for most of a decade before I learned to code. Flat monthly pricing, $1,499 to $1,899, instead of per-project estimates. Clients get unlimited design requests handled one at a time, with 1 to 2 day turnarounds and unlimited revisions.",
              highlights: [
                "Scope covers websites, brand identity, logos, and video under one subscription. Creative direction, not just production work",
                "Built the ops playbook and tooling that actually delivers on 'unlimited, 1–2 day, unlimited revisions' without burning out the team",
                "Long-tail client retention by treating design as an ongoing relationship rather than a one-off deliverable",
                "This is the business that made me want to learn to code. I kept designing things I couldn't ship myself and handing off to developers who missed the point",
              ],
            },
            {
              role: "Strategy & Partnerships",
              company: "Children's Cup",
              period: "2023 – 2026",
              highlight: "Strategy and partnerships for a nonprofit operating community hubs across six countries.",
              details:
                "Strategy and partnership development for a nonprofit operating CarePoints, neighborhood-based community hubs that combine physical care, mental wellness, and spiritual formation in one location. Scope covered fundraising strategy, cross-program alignment, and partner relationship design.",
              highlights: [
                "Scaled programs touching 16,600+ children across 61 CarePoints in 6 countries",
                "Built partnerships across corporate, foundation, and grassroots donor pipelines",
                "CarePoint model integrates nutrition, pastoral care, education, and mental health support under one roof",
                "Worked across regional directors and local operators to align program delivery with on-the-ground realities in each country",
              ],
            },
            {
              role: "Creative + Next Gen",
              company: "Our Savior's Church",
              period: "2020 – 2024",
              highlight: "Creative direction for a 15,000-member church across 7 locations in South Louisiana.",
              details:
                "Creative direction for a multi-site church serving roughly 15,000 members across 7 campuses. Owned the visual identity, production pipeline, and Next Gen (student ministry) program.",
              highlights: [
                "Brand identity and creative direction across print, digital, and in-venue environmental design",
                "Next Gen programming reaching students from elementary through college across all 7 campuses",
                "Built internal design and production capacity on a largely volunteer team, with systems that survived staff turnover",
                "Weekly production cadence: stage design, graphics, video, and environmental design for live Sunday services",
              ],
            },
            {
              role: "Consultant",
              company: "Ejento",
              period: "2020 (COVID)",
              highlight: "Technical recruiting at a VC-backed firm placing candidates into venture-backed startups.",
              details:
                "Augmented recruiting firm working in-house as an extension of client hiring teams. Engagements ended abruptly in March 2020 when COVID froze most early-stage hiring overnight.",
              highlights: [
                "Hired Go-To-Market, Operational, Engineering, and People leaders for venture-backed startups",
                "Recruited candidates into SpaceX, Scale AI, Cruise, GitLab, Skydio",
                "VC partners on the client roster included Sequoia Capital, Andreessen Horowitz, Google Ventures, First Round Capital, Accel Partners, Greylock",
                "Full-cycle: sourcing, screening, close coordination with hiring managers, offer negotiation",
              ],
            },
            {
              role: "Consultant",
              company: "Freenome",
              period: "2020 (COVID)",
              highlight: "ML Platform work at an AI genomics startup focused on early cancer detection.",
              details:
                "AI genomics startup focused on early cancer detection through blood-based multi-omics. I was embedded on the ML Platform team. Work paused when COVID shut down wet-lab operations and reshuffled priorities across the company.",
              highlights: [
                "Built ingestion and featurization pipelines for petabyte-scale genomic datasets",
                "Contributed to an internal ML experimentation platform so computational researchers could train models without hand-rolling infrastructure",
                "Context: $238M Series B at the time. Team working across ML and cancer biology",
              ],
            },
            {
              role: "Technical Recruiter & PM",
              company: "Tempo Automation",
              period: "2018 – 2020",
              highlight: "Two jobs in one: lead recruiter during a hiring surge, then technical PM on the production floor.",
              details:
                "Two jobs in one. Started as the solo internal recruiter during a hiring surge, then moved into technical PM on the production floor as the recruiting team came online behind me.",
              highlights: [
                "Closed 42 P0/P1 roles across 2 quarters as the sole internal recruiter",
                "Partnered with the CEO on executive searches. VP of People, VP of Product, VP of Business Operations, VP of Operations. All placed",
                "Managed 7+ recruiting agencies and 10+ hiring managers across C, VP, and Director levels",
                "As Technical PM, managed PCB assembly production for aerospace (NASA, SpaceX, Blue Origin), defense (Raytheon, Lockheed Martin), medical devices, and autonomous vehicles (Tesla, Zoox)",
                "Cross-functional coordination across Software, Operations, Finance, Sales, Manufacturing, and Product teams",
              ],
            },
          ].map((item, i) => (
            <ExperienceItem
              key={item.company}
              role={item.role}
              company={item.company}
              period={item.period}
              highlight={item.highlight}
              details={item.details}
              highlights={item.highlights}
              reduced={reduced}
              index={i}
              onShowDetails={openDetail}
              isActive={activeDetail?.id === `exp-${item.company}`}
            />
          ))}
        </div>
      </section>

      {/* Contact */}
      <ContactSection scroll={scroll} onOpen={openContact} />

      {/* Navbar */}
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 bg-background"
        initial={reduced ? undefined : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex h-14 items-center gap-5 px-6 sm:gap-7 sm:pl-16 sm:pr-8">
          <Image src="/logo.png" alt="RC" width={28} height={28} className="rounded-sm invert" />
          {[
            { id: "about", label: "About" },
            { id: "work", label: "Projects" },
            { id: "experience", label: "Experience" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`hidden text-sm transition-colors hover:text-foreground sm:block ${activeSection === link.id ? "text-foreground" : "text-muted-foreground"}`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openContact}
            className={`hidden text-sm transition-colors hover:text-foreground sm:block ${contactOpen ? "text-foreground" : "text-muted-foreground"}`}
          >
            Contact
          </button>
          <button
            type="button"
            data-chat-opener
            onClick={openChat}
            className={`hidden text-sm transition-colors hover:text-foreground sm:block ${chatOpen ? "text-foreground" : "text-muted-foreground"}`}
          >
            Ask
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSocialsOpen((v) => !v)}
              aria-expanded={socialsOpen}
              className={`flex items-center gap-1.5 text-sm transition-colors hover:text-foreground ${socialsOpen ? "text-foreground" : "text-muted-foreground"}`}
            >
              Connect
              <Image
                src="/pixel-arrow.png"
                alt=""
                width={12}
                height={12}
                className={`size-3 opacity-80 transition-transform duration-500 ease-out [image-rendering:pixelated] invert dark:invert-0 ${socialsOpen ? "rotate-90" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {socialsOpen && (
                <motion.div
                  className="flex items-center gap-3 overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {SOCIALS.map((s, i) =>
                    s.label === "Email" ? (
                      <motion.button
                        key={s.label}
                        type="button"
                        onClick={openContact}
                        aria-label="Email"
                        className={`shrink-0 p-1 transition-colors hover:text-foreground ${contactOpen ? "text-foreground" : "text-muted-foreground"}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.2, delay: 0.06 + i * 0.04 }}
                      >
                        {s.icon}
                      </motion.button>
                    ) : (
                      <motion.a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.2, delay: 0.06 + i * 0.04 }}
                      >
                        {s.icon}
                      </motion.a>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* Right-rail "Ask" affordance (desktop only, centered in right whitespace) */}
      <div
        className="pointer-events-none fixed z-30 hidden lg:block"
        style={{
          left: "calc(50vw + 21rem)",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <AnimatePresence>
          {!chatOpen && !activeDetail && !contactOpen && (
            <motion.button
              type="button"
              data-chat-opener
              onClick={openChat}
              aria-label="Ask AI about Robert's work"
              className="group pointer-events-auto flex flex-col items-start gap-1.5 text-left transition-colors"
              initial={reduced ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                Ask me anything
                <span className="inline-block h-3.5 w-[2px] animate-blink bg-foreground" />
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Press
                <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-background px-1.5 font-sans text-[10px] text-foreground/70 transition-colors group-hover:border-foreground/40 group-hover:text-foreground">
                  /
                </kbd>
                to start
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat */}
      <Chat open={chatOpen} onOpenChange={setChatOpen} hidden={!!activeDetail || contactOpen} />

      {/* Floating detail panel */}
      <AnimatePresence>
        {activeDetail && (() => {
          const detailContent = (
            <>
              <div className="flex items-start justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Details
                </p>
                <div className="-mt-1 flex items-center gap-2">
                  <span className="hidden items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground sm:flex">
                    Press
                    <kbd className="inline-flex h-4 items-center justify-center rounded border border-border bg-background px-1 font-sans text-[10px] text-foreground/70">
                      Esc
                    </kbd>
                    to close
                  </span>
                  <button
                    onClick={() => setActiveDetail(null)}
                    aria-label="Close details"
                    className="-mr-1 shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-medium leading-tight text-foreground">
                  {activeDetail.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{activeDetail.subtitle}</p>
                {activeDetail.meta && (
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{activeDetail.meta}</p>
                )}
              </div>

              {activeDetail.body && (
                <motion.p
                  className="mt-5 text-sm leading-relaxed text-foreground"
                  initial={reduced ? undefined : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 }}
                >
                  {activeDetail.body}
                </motion.p>
              )}

              {activeDetail.highlights && activeDetail.highlights.length > 0 && (
                <ul className={`${activeDetail.body ? "mt-6" : "mt-5"} space-y-3 text-sm leading-relaxed text-foreground`}>
                  {activeDetail.highlights.map((h, idx) => (
                    <motion.li
                      key={h}
                      className="flex gap-2"
                      initial={reduced ? undefined : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.05 + idx * 0.04 }}
                    >
                      <span className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-foreground" />
                      <span>{h}</span>
                    </motion.li>
                  ))}
                </ul>
              )}

              {activeDetail.tech && activeDetail.tech.length > 0 && (
                <div className="mt-7">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Tech
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {activeDetail.tech.join(" · ")}
                  </p>
                </div>
              )}
            </>
          );

          return (
            <>
              {/* Mobile backdrop */}
              <motion.div
                className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveDetail(null)}
              />

              {/* Mobile / tablet: bottom sheet */}
              <motion.aside
                key={`sheet-${activeDetail.title}`}
                className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                {!reduced && (
                  <motion.div
                    className="pointer-events-none absolute left-0 right-0 -top-16 h-40"
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
                      maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-t-3xl opacity-75 blur-2xl dark:opacity-60"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 18% 30%, #6366f1 0%, transparent 55%), radial-gradient(circle at 70% 20%, #ec4899 0%, transparent 55%), radial-gradient(circle at 40% 70%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 88% 60%, #a855f7 0%, transparent 55%)",
                      }}
                      animate={{ scale: [1, 1.06, 0.96, 1.02, 1], x: [0, 12, -10, 5, 0], y: [0, -4, 6, -2, 0] }}
                      transition={{
                        scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
                        x: { duration: 21, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 17, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                  </motion.div>
                )}
                <div className="relative max-h-[75vh] overflow-y-auto rounded-t-2xl bg-background px-6 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] shadow-2xl">
                  {detailContent}
                </div>
              </motion.aside>

              {/* Desktop: centered in right whitespace */}
              <div
                className="pointer-events-none fixed z-40 hidden lg:block"
                style={{
                  left: "calc(50vw + 21rem)",
                  top: "calc(50% + 1.75rem)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  {!reduced && (
                    <motion.div
                      className="pointer-events-none absolute -inset-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      aria-hidden="true"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-3xl opacity-75 blur-2xl dark:opacity-60"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 22% 18%, #6366f1 0%, transparent 55%), radial-gradient(circle at 78% 32%, #ec4899 0%, transparent 55%), radial-gradient(circle at 32% 78%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 85% 82%, #a855f7 0%, transparent 55%)",
                        }}
                        animate={{ rotate: [0, 8, -6, 3, 0], scale: [1, 1.06, 0.96, 1.02, 1], x: [0, 8, -6, 4, 0], y: [0, -5, 7, -3, 0] }}
                        transition={{
                          rotate: { duration: 24, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
                          x: { duration: 21, repeat: Infinity, ease: "easeInOut" },
                          y: { duration: 17, repeat: Infinity, ease: "easeInOut" },
                        }}
                      />
                    </motion.div>
                  )}
                  <motion.aside
                    key={`panel-${activeDetail.title}`}
                    className="pointer-events-auto relative w-[360px] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-lg xl:w-[420px]"
                    initial={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  >
                    {detailContent}
                  </motion.aside>
                </div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Contact popout */}
      <AnimatePresence>
        {contactOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContactOpen(false)}
            />

            {/* Mobile bottom sheet */}
            <motion.aside
              key="contact-sheet"
              className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden"
              initial={reduced ? undefined : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              {!reduced && (
                <motion.div
                  className="pointer-events-none absolute left-0 right-0 -top-16 h-40"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-t-3xl opacity-75 blur-2xl dark:opacity-60"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 18% 30%, #6366f1 0%, transparent 55%), radial-gradient(circle at 70% 20%, #ec4899 0%, transparent 55%), radial-gradient(circle at 40% 70%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 88% 60%, #a855f7 0%, transparent 55%)",
                    }}
                    animate={{ scale: [1, 1.06, 0.96, 1.02, 1], x: [0, 12, -10, 5, 0], y: [0, -4, 6, -2, 0] }}
                    transition={{
                      scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
                      x: { duration: 21, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 17, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                </motion.div>
              )}
              <div className="relative max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background px-6 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] shadow-2xl">
                <ContactForm onClose={() => setContactOpen(false)} />
              </div>
            </motion.aside>

            {/* Desktop side-rail */}
            <div
              className="pointer-events-none fixed z-40 hidden lg:block"
              style={{
                left: "calc(50vw + 21rem)",
                top: "calc(50% + 1.75rem)",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative">
                {!reduced && (
                  <motion.div
                    className="pointer-events-none absolute -inset-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    aria-hidden="true"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-3xl opacity-75 blur-2xl dark:opacity-60"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 22% 18%, #6366f1 0%, transparent 55%), radial-gradient(circle at 78% 32%, #ec4899 0%, transparent 55%), radial-gradient(circle at 32% 78%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 85% 82%, #a855f7 0%, transparent 55%)",
                      }}
                      animate={{ rotate: [0, 8, -6, 3, 0], scale: [1, 1.06, 0.96, 1.02, 1], x: [0, 8, -6, 4, 0], y: [0, -5, 7, -3, 0] }}
                      transition={{
                        rotate: { duration: 24, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 18, repeat: Infinity, ease: "easeInOut" },
                        x: { duration: 21, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 17, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                  </motion.div>
                )}
                <motion.aside
                  key="contact-panel"
                  className="pointer-events-auto relative w-[360px] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-lg xl:w-[420px]"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                >
                  <ContactForm onClose={() => setContactOpen(false)} />
                </motion.aside>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
