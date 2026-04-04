"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface VideoPreviewProps {
  children: React.ReactNode;
  src?: string;
  preview?: React.ReactNode;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export function VideoPreview({
  children,
  src,
  preview,
  width = 360,
  height = 220,
  disabled,
}: VideoPreviewProps) {
  const [hovered, setHovered] = useState(false);
  const [hasPointer, setHasPointer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasPointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (hovered && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [hovered]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const overLink = !!target.closest("a, [role='link']");

    if (overLink) {
      if (!hovered) setHovered(true);
    } else {
      if (hovered) setHovered(false);
    }

    mouseX.set(e.clientX - width / 2);
    mouseY.set(e.clientY - height - 20);
  };

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      <AnimatePresence>
        {hovered && !disabled && hasPointer && (
          <motion.div
            className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
            style={{
              left: springX,
              top: springY,
              width,
              height,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {src ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src={src}
                className="h-full w-full object-cover"
              />
            ) : preview ? (
              <div className="h-full w-full">{preview}</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
