"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";
import Ollama from "@lobehub/icons/es/Ollama";
import HuggingFace from "@lobehub/icons/es/HuggingFace";
import Github from "@lobehub/icons/es/Github";
import type { Project } from "@/data/projects";
import type { ReactNode } from "react";

function getLinkIcon(url: string): ReactNode {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return <Github size={16} />;
  if (lower.includes("huggingface.co")) return <HuggingFace size={16} />;
  if (lower.includes("ollama.com")) return <Ollama size={16} />;
  return <Globe className="size-4" />;
}

export function ProjectCard({
  project,
  index,
  extra,
}: {
  project: Project;
  index: number;
  extra?: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.4, delay: index * 0.05 }
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold leading-tight sm:text-3xl">{project.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{project.tag}</p>
        </div>
        {(project.url || project.links || extra) && (
          <div className="flex shrink-0 items-center gap-2">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${project.title}`}
                title={project.url.includes("github.com") ? "GitHub" : "Website"}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {getLinkIcon(project.url)}
              </a>
            )}
            {project.links?.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                title={link.label}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {getLinkIcon(link.url)}
              </a>
            ))}
            {extra}
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {project.hook}
      </p>

      <ul className="space-y-1 text-sm leading-relaxed text-muted-foreground">
        {project.highlights.map((h) => (
          <li key={h} className="flex gap-1.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
            {h}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span key={t} className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/90 transition-colors hover:border-foreground/20 hover:text-foreground">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
