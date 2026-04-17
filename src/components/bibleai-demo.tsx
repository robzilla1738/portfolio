"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, RotateCcw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const [thinkingText, setThinkingText] = useState("");
  const [thinkingDone, setThinkingDone] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [thinkDuration, setThinkDuration] = useState(0);
  const thinkStartRef = useRef(0);
  const retryCountRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const thinkingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [thinkingText]);

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
    setThinkingText("");
    setThinkingDone(false);
    setThinkingExpanded(false);
    setThinkDuration(0);
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
    if (retryCountRef.current === 0) retryCountRef.current = 0;

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (res.status === 202) {
        if (retryCountRef.current < 6) {
          setCold(true);
          retryCountRef.current++;
          await new Promise((r) => setTimeout(r, 10000));
          if (!open) return;
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

      setLoading(false);
      setCold(false);

      const decoder = new TextDecoder();
      let content = "";
      let thinkContent = "";
      let isThinking = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (let i = 0; i < chunk.length; i++) {
          if (chunk[i] === "\x00" && i + 1 < chunk.length) {
            const signal = chunk[i + 1];
            if (signal === "T") {
              isThinking = true;
              setThinking(true);
              setThinkingDone(false);
              setThinkingText("");
              thinkContent = "";
              thinkStartRef.current = Date.now();
              i++;
              continue;
            }
            if (signal === "R") {
              isThinking = false;
              setThinking(false);
              setThinkingDone(true);
              setThinkDuration(Math.round((Date.now() - thinkStartRef.current) / 1000));
              i++;
              continue;
            }
          }
          if (isThinking) {
            thinkContent += chunk[i];
            setThinkingText(thinkContent);
          } else {
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
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); onOpenChange?.(true); }}
        className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85"
      >
        {buttonLabel}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
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
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{modelName}</span>
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {modelTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(response || error || cold) && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        >
                          <RotateCcw className="size-3" />
                          New
                        </button>
                      )}
                      <button
                        onClick={close}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6" ref={responseRef}>
                    {/* Empty state */}
                    {!response && !loading && !error && !cold && !prompt && (
                      <motion.div
                        className="flex h-full flex-col items-center justify-center gap-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ask {modelName} anything</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {subtitle}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground/80">
                            First message takes about 60 seconds while the GPU warms up. After that, responses are fast.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {suggestions.map((s, i) => (
                            <motion.button
                              key={s}
                              onClick={() => send(s)}
                              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:px-4 sm:py-2 sm:text-sm"
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
                        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-foreground px-4 py-3 text-sm leading-relaxed text-background">
                          {prompt}
                        </div>
                      </div>
                    )}

                    {/* Cold start */}
                    {cold && (
                      <div className="space-y-4">
                        <motion.div
                          className="flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                Waking up the GPU. Takes about 60 seconds on first request
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-muted-foreground">
                                Still loading.
                              </span>
                              <button
                                onClick={() => { setCold(false); retryCountRef.current = 0; send(prompt); }}
                                className="text-sm text-foreground underline underline-offset-2 hover:text-muted-foreground"
                              >
                                Retry
                              </button>
                            </>
                          )}
                        </motion.div>

                        {/* How it works cards */}
                        {howItWorks && howItWorks.length > 0 && (
                          <motion.div
                            className="grid gap-3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {howItWorks.map((item, i) => (
                              <motion.div
                                key={item.title}
                                className="flex items-start gap-3 rounded-xl border border-border px-4 py-3"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                              >
                                <div className="mt-0.5 shrink-0">{item.icon}</div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <motion.div
                        className="rounded-2xl rounded-bl-md bg-muted p-5 text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Loading spinner */}
                    {loading && !cold && (
                      <motion.div
                        className="flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">Generating response...</span>
                      </motion.div>
                    )}

                    {/* Thinking */}
                    {thinking && (
                      <motion.div
                        className="rounded-2xl rounded-bl-md border border-border px-4 py-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-3 animate-spin text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                        {thinkingText && (
                          <p
                            ref={thinkingRef}
                            className="scrollbar-none mt-2 text-xs leading-relaxed text-muted-foreground/80 max-h-40 overflow-y-auto whitespace-pre-wrap"
                          >
                            {thinkingText}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Collapsed thinking */}
                    {thinkingDone && thinkingText && !thinking && (
                      <div className="rounded-2xl rounded-bl-md border border-border">
                        <button
                          type="button"
                          onClick={() => setThinkingExpanded(!thinkingExpanded)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
                        >
                          <svg
                            className={`size-3 text-muted-foreground transition-transform ${thinkingExpanded ? "rotate-0" : "-rotate-90"}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="text-xs text-muted-foreground">
                            Thought for {thinkDuration} second{thinkDuration !== 1 ? "s" : ""}
                          </span>
                        </button>
                        <AnimatePresence>
                          {thinkingExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p
                                className="scrollbar-none px-4 pb-3 text-xs leading-relaxed text-muted-foreground/80 max-h-60 overflow-y-auto whitespace-pre-wrap"
                              >
                                {thinkingText}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Response */}
                    {response && (
                      <motion.div
                        className={`flex justify-start ${thinkingDone ? "mt-3" : ""}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-full rounded-2xl rounded-bl-md bg-muted px-5 py-4 break-words">
                          <div className="chat-markdown text-sm leading-relaxed text-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {response}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-border px-6 py-4">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a theology question..."
                        disabled={loading || thinking}
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                      />
                      <motion.button
                        type="submit"
                        disabled={loading || !inputValue.trim()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85 disabled:opacity-20"
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
