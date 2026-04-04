"use client";

import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

export function ShineBorder({
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 10,
  color = "#ffffff",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn("shine-border-wrap relative", className)}
      style={
        {
          "--sb-radius": `${borderRadius}px`,
          "--sb-width": `${borderWidth}px`,
          "--sb-duration": `${duration}s`,
          "--sb-gradient": `radial-gradient(transparent, transparent, ${
            Array.isArray(color) ? color.join(",") : color
          }, transparent, transparent)`,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        .shine-border-wrap {
          border-radius: var(--sb-radius);
        }
        .shine-border-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: var(--sb-radius);
          padding: var(--sb-width);
          background-image: var(--sb-gradient);
          background-size: 300% 300%;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          animation: shine-pulse var(--sb-duration) infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes shine-pulse {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .shine-border-wrap::before { animation: none; }
        }
      `}</style>
      {children}
    </div>
  );
}
