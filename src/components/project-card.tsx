"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import Ollama from "@lobehub/icons/es/Ollama";
import HuggingFace from "@lobehub/icons/es/HuggingFace";
import Github from "@lobehub/icons/es/Github";
import type { Project } from "@/data/projects";
import type { ReactNode } from "react";

function getLinkIcon(url: string): ReactNode {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return <Github size={14} />;
  if (lower.includes("huggingface.co")) return <HuggingFace size={14} />;
  if (lower.includes("ollama.com")) return <Ollama size={14} />;
  return <Globe className="size-3.5" />;
}

export function ProjectCard({
  project,
  index,
  extra,
  onShowDetails,
  isActive,
}: {
  project: Project;
  index: number;
  extra?: React.ReactNode;
  onShowDetails?: (project: Project) => void;
  isActive?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.4, delay: index * 0.04 }
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-medium text-foreground">{project.title}</h3>
        <span className="flex items-baseline gap-x-2 text-sm text-muted-foreground">
          <span>{project.tag}</span>
          {(project.url || project.links) && (
            <span className="flex translate-y-[2px] items-center gap-2">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${project.title}`}
                  title={project.url.includes("github.com") ? "GitHub" : "Website"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {getLinkIcon(link.url)}
                </a>
              ))}
            </span>
          )}
        </span>
        {extra && <span className="ml-auto flex items-center gap-3">{extra}</span>}
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        {project.hook}
      </p>

      {project.highlights.length > 0 && onShowDetails && (
        <button
          onClick={() => onShowDetails(project)}
          className={`group/details flex items-center gap-1 self-start text-xs transition-colors ${
            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="underline underline-offset-2">
            {isActive ? "Hide details" : "Show details"}
          </span>
          <ArrowRight
            className={`size-3 transition-transform duration-200 ${
              isActive ? "rotate-180" : "group-hover/details:translate-x-0.5"
            }`}
          />
        </button>
      )}

      <p className="text-xs text-muted-foreground/70">
        {project.tech.join(" · ")}
      </p>
    </motion.div>
  );
}
