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
    } else if (!hovered && videoRef.current) {
      videoRef.current.pause();
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

    const padding = 16;
    const offset = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.min(Math.max(padding, e.clientX + offset), vw - width - padding);
    const y = Math.min(Math.max(padding, e.clientY + offset), vh - height - padding);
    mouseX.set(x);
    mouseY.set(y);
  };

  const showPreview = hovered && !disabled && hasPointer;

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {/* Persistent preload: video stays in the DOM so metadata + first frame
          are cached before hover. Visibility is toggled via opacity. */}
      {src && hasPointer && !disabled && (
        <motion.video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="metadata"
          src={src}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-white/10 object-cover shadow-2xl"
          style={{ left: springX, top: springY, width, height }}
          animate={{
            opacity: showPreview ? 1 : 0,
            scale: showPreview ? 1 : 0.92,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}

      {/* Non-video preview (unchanged): only render on hover */}
      {!src && preview && (
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              style={{ left: springX, top: springY, width, height }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <div className="h-full w-full">{preview}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
