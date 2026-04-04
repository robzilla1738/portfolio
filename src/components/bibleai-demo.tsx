"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, RotateCcw, X, Server, Brain, Cpu, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShineBorder } from "@/components/ui/shine-border";

const DEFAULT_SUGGESTIONS = [
  "What does John 3:16 mean?",
  "Explain justification across traditions",
  "Greek meaning of agape",
  "Who were the Church Fathers?",
];

interface ModelDemoProps {
  onOpenChange?: (open: boolean) => void;
  modelName?: string;
  modelTag?: string;
  apiEndpoint?: string;
  buttonLabel?: string;
  subtitle?: string;
  suggestions?: string[];
  howItWorks?: { icon: React.ReactNode; title: string; desc: string }[];
  grainId?: string;
  supportsThinking?: boolean;
}

export function BibleAiDemo({
  onOpenChange,
  modelName = "BibleAI:7b",
  modelTag = "Live model",
  apiEndpoint = "/api/bibleai",
  buttonLabel = "Try BibleAI Now",
  subtitle = "Scholarly responses from the fine-tuned 7B model.",
  suggestions = DEFAULT_SUGGESTIONS,
  howItWorks,
  grainId = "bibleai-grain",
  supportsThinking = false,
}: ModelDemoProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [cold, setCold] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [error, setError] = useState("");
  const [thinking, setThinking] = useState(false);
  const retryCountRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() {
    setOpen(false);
    onOpenChange?.(false);
    setPrompt("");
    setInputValue("");
    setResponse("");
    setError("");
    setCold(false);
  }

  function reset() {
    setPrompt("");
    setResponse("");
    setError("");
    setCold(false);
    setInputValue("");
    setThinking(false);
    retryCountRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function send(text: string) {
    text = text.trim();
    if (!text || loading) return;

    setPrompt(text);
    setInputValue("");
    setResponse("");
    setError("");
    setLoading(true);
    setCold(false);
    if (retryCountRef.current === 0) retryCountRef.current = 0; // only reset on fresh sends

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (res.status === 202) {
        // Auto-retry up to 6 times (60 seconds total)
        if (retryCountRef.current < 6) {
          setCold(true);
          retryCountRef.current++;
          await new Promise((r) => setTimeout(r, 10000));
          if (!open) return; // closed while waiting
          setCold(false);
          return send(text);
        }
        setCold(true);
        setLoading(false);
        return;
      }

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error || "Rate limit reached. Try again later.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      // Once streaming starts, hide loading/cold states
      setLoading(false);
      setCold(false);

      const decoder = new TextDecoder();
      let content = "";
      let isThinking = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Process chunk character by character for control signals
        for (let i = 0; i < chunk.length; i++) {
          if (chunk[i] === "\x00" && i + 1 < chunk.length) {
            const signal = chunk[i + 1];
            if (signal === "T") {
              // Thinking started
              isThinking = true;
              setThinking(true);
              i++; // skip signal byte
              continue;
            }
            if (signal === "R") {
              // Real content starting
              isThinking = false;
              setThinking(false);
              i++; // skip signal byte
              continue;
            }
          }
          // Only append real content
          if (!isThinking) {
            content += chunk[i];
            setResponse(content);
          }
        }
      }
      setThinking(false);
      setHasResponded(true);
    } catch {
      setError(`Failed to reach ${modelName}. Try again.`);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(inputValue);
  }

  return (
    <>
      {/* Trigger — rendered inline where the component is placed */}
      <ShineBorder
        borderRadius={20}
        borderWidth={1}
        duration={12}
        color={["#a855f7", "#7c3aed", "#60a5fa"]}
        className="inline-flex cursor-pointer bg-background"
      >
        <button
          onClick={() => { setOpen(true); onOpenChange?.(true); }}
          className="flex items-center px-4 py-1.5 text-xs font-medium text-foreground"
        >
          {buttonLabel}
        </button>
      </ShineBorder>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={close}>
              <motion.div
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ height: "min(80vh, 700px)" }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div
                  className="bibleai-card relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-white shadow-2xl"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}
                >
                  <style jsx>{`
                    .bibleai-card {
                      background-color: hsla(240, 15%, 9%, 1);
                    }
                  `}</style>
                  {/* Gradient overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
                    style={{
                      backgroundImage: [
                        "radial-gradient(at 88% 40%, hsla(240,15%,9%,1) 0px, transparent 85%)",
                        "radial-gradient(at 49% 30%, hsla(240,15%,9%,1) 0px, transparent 85%)",
                        "radial-gradient(at 14% 26%, hsla(240,15%,9%,1) 0px, transparent 85%)",
                        "radial-gradient(at 0% 64%, hsla(263,93%,56%,1) 0px, transparent 85%)",
                        "radial-gradient(at 41% 94%, hsla(284,100%,84%,1) 0px, transparent 85%)",
                        "radial-gradient(at 100% 99%, hsla(306,100%,57%,1) 0px, transparent 85%)",
                      ].join(","),
                    }}
                  />
                  {/* Grain noise */}
                  <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full rounded-2xl opacity-[0.10]">
                    <filter id={grainId}>
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter={`url(#${grainId})`} />
                  </svg>

                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{modelName}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/70">
                        {modelTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(response || error || cold) && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:text-white"
                        >
                          <RotateCcw className="size-3" />
                          New
                        </button>
                      )}
                      <button
                        onClick={close}
                        className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6" ref={responseRef}>
                    {/* Empty state */}
                    {!response && !loading && !error && !cold && !prompt && (
                      <motion.div
                        className="flex h-full flex-col items-center justify-center gap-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div>
                          <h3 className="text-2xl font-semibold sm:text-3xl">Ask {modelName} anything</h3>
                          <p className="mt-1 text-sm text-white/70">
                            {subtitle}
                          </p>
                          <p className="mt-2 text-xs text-white/60">
                            First message takes about 60 seconds while the GPU warms up. After that, responses are fast.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {suggestions.map((s, i) => (
                            <motion.button
                              key={s}
                              onClick={() => send(s)}
                              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + i * 0.05 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* User question */}
                    {prompt && (
                      <div className="mb-5 flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm leading-relaxed text-black">
                          {prompt}
                        </div>
                      </div>
                    )}

                    {/* Cold start */}
                    {cold && (
                      <motion.div
                        className="rounded-2xl rounded-bl-md bg-white/10 p-5"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-medium">Model is loading</p>
                        <p className="mt-1 text-sm text-white/70">
                          {modelName} runs on a serverless GPU that scales to zero when idle. First request takes about 60 seconds to load the model. Hit retry and it should be ready.
                        </p>
                        <button
                          onClick={() => { setCold(false); send(prompt); }}
                          className="mt-3 flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm transition-colors hover:border-white/30 hover:text-white"
                        >
                          <RotateCcw className="size-3.5" />
                          Retry
                        </button>
                      </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                      <motion.div
                        className="rounded-2xl rounded-bl-md bg-white/10 p-5 text-sm text-white/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Loading — how it works */}
                    {loading && !cold && (
                      <motion.div
                        className="flex flex-col gap-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {/* Spinner */}
                        <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-white/10 px-5 py-3.5">
                          <Loader2 className="size-4 animate-spin text-purple-400" />
                          <span className="text-sm text-white/70">{modelName} is generating a response...</span>
                        </div>

                        {/* How it works — only on first/cold request */}
                        {!hasResponded && howItWorks && <motion.div
                          className="rounded-xl border border-white/15/50 p-5"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 }}
                        >
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60">How this works</p>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {howItWorks.map((item, i) => (
                              <motion.div
                                key={item.title}
                                className="flex gap-3"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2 + i * 0.15 }}
                              >
                                <div className="mt-0.5 shrink-0">{item.icon}</div>
                                <div>
                                  <p className="text-xs font-medium">{item.title}</p>
                                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">{item.desc}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>}
                      </motion.div>
                    )}

                    {/* Thinking indicator */}
                    {thinking && (
                      <motion.div
                        className="flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 px-5 py-3.5"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="size-3.5 animate-spin text-white/70 shrink-0" />
                        <span className="text-xs font-medium text-white/70">Thinking...</span>
                      </motion.div>
                    )}

                    {/* Response */}
                    {response && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-full rounded-2xl rounded-bl-md bg-white/10 px-5 py-4 overflow-hidden break-words">
                          <div className="chat-markdown text-sm leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {response}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="relative z-10 border-t border-white/10 px-6 py-4">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a theology question..."
                        disabled={loading || thinking}
                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50 disabled:opacity-50"
                      />
                      <motion.button
                        type="submit"
                        disabled={loading || !inputValue.trim()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Send className="size-4" />
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
