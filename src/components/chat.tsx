"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Send, Mic, Volume2, VolumeOff, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- AI Orb (blue rotating glow circle) ---

function AiOrb({ size = 24 }: { size?: number }) {
  return (
    <div
      className="ai-orb relative rounded-full"
      style={{ width: size, height: size }}
    >
      <style jsx>{`
        @keyframes orbGlow {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 ${size * 0.033}px ${size * 0.067}px 0 #a855f7 inset,
              0 ${size * 0.067}px ${size * 0.1}px 0 #7c3aed inset,
              0 ${size * 0.2}px ${size * 0.2}px 0 #5b21b6 inset,
              0 0 ${size * 0.04}px ${size * 0.015}px rgba(56, 189, 248, 0.3),
              0 0 ${size * 0.08}px ${size * 0.02}px rgba(0, 93, 255, 0.2);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 ${size * 0.033}px ${size * 0.067}px 0 #60a5fa inset,
              0 ${size * 0.067}px ${size * 0.033}px 0 #0284c7 inset,
              0 ${size * 0.133}px ${size * 0.2}px 0 #7c3aed inset,
              0 0 ${size * 0.04}px ${size * 0.015}px rgba(56, 189, 248, 0.3),
              0 0 ${size * 0.08}px ${size * 0.02}px rgba(0, 93, 255, 0.2);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 ${size * 0.033}px ${size * 0.067}px 0 #4dc8fd inset,
              0 ${size * 0.067}px ${size * 0.1}px 0 #7c3aed inset,
              0 ${size * 0.2}px ${size * 0.2}px 0 #5b21b6 inset,
              0 0 ${size * 0.04}px ${size * 0.015}px rgba(56, 189, 248, 0.3),
              0 0 ${size * 0.08}px ${size * 0.02}px rgba(0, 93, 255, 0.2);
          }
        }
        .ai-orb {
          animation: orbGlow 4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-orb { animation: none; }
        }
      `}</style>
    </div>
  );
}

// --- Types ---

// --- Live Waveform (scrolling bars + timer) ---

function LiveWaveform({ analyser, startTime }: { analyser: AnalyserNode | null; startTime: number }) {
  const [history, setHistory] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState("0:00");
  const rafRef = useRef<number>(0);
  const historyRef = useRef<number[]>([]);
  const lastPush = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      rafRef.current = requestAnimationFrame(tick);
      analyser!.getByteFrequencyData(data);

      // Timer
      const sec = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);

      // Push a new bar every ~60ms
      const now = Date.now();
      if (now - lastPush.current > 60) {
        lastPush.current = now;
        // Average the lower frequency bins for a single bar value
        let sum = 0;
        const bins = Math.min(32, data.length);
        for (let i = 0; i < bins; i++) sum += data[i];
        const avg = sum / bins / 255;
        const h = 2 + avg * 26;
        historyRef.current = [...historyRef.current, h];
        // Keep last 200 bars
        if (historyRef.current.length > 200) historyRef.current = historyRef.current.slice(-200);
        setHistory([...historyRef.current]);
      }
    }

    historyRef.current = [];
    lastPush.current = 0;
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, startTime]);

  // Auto-scroll to the right
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [history]);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{elapsed}</span>
      <div
        ref={containerRef}
        className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden"
      >
        {history.map((h, i) => (
          <div
            key={i}
            className="w-[2.5px] shrink-0 rounded-full bg-white/70"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// --- Playback Waveform (animated bars) ---

function PlaybackWaveform() {
  const bars = 24;
  return (
    <div className="flex h-8 w-full items-center justify-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-white/60"
          animate={{
            height: ["4px", `${8 + Math.random() * 16}px`, "4px"],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What has Robert built?",
  "What's his tech stack?",
  "Tell me about Rhema",
  "Design to dev story?",
];

const THINKING_MESSAGES = [
  "Looking into that",
  "Pulling up details",
  "Checking my notes",
  "One sec",
];

const PANEL_W = 400;
const PANEL_H = 540;
const PILL_H = 44;

// --- Chat Component ---

export function Chat({ hidden }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingStart, setRecordingStart] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcmCtxRef = useRef<AudioContext | null>(null);
  const responseDoneRef = useRef(false);
  const openRef = useRef(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Only auto-scroll when user sends a message, not during streaming
  const shouldScrollRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (!shouldScrollRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    shouldScrollRef.current = false;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, scrollToBottom]);

  useEffect(() => {
    openRef.current = open;
    if (open) setTimeout(() => inputRef.current?.focus(), 400);
  }, [open]);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      responseDoneRef.current = true;
      if (wsRef.current) {
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
      if (pcmCtxRef.current) pcmCtxRef.current.close().catch(() => {});
      if (audioRef.current) audioRef.current.pause();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function close() {
    stopRecording();
    stopAudio();
    // Kill WebSocket completely — null out handlers before closing
    // so no events fire during or after close
    responseDoneRef.current = true;
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onopen = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    audioChunksRef.current = [];
    setMessages([]);
    setInput("");
    setThinking(false);
    setLoading(false);
    setSpeaking(false);
    setOpen(false);
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (pcmCtxRef.current) {
      pcmCtxRef.current.close().catch(() => {});
      pcmCtxRef.current = null;
    }
    setSpeaking(false);
  }

  // --- Realtime API voice flow ---

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Int16Array[]>([]);

  async function playTts(text: string) {
    if (!ttsEnabled || !openRef.current) return;
    stopAudio();
    setSpeaking(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok || !openRef.current) { setSpeaking(false); return; }

      const blob = await res.blob();
      if (!openRef.current) { setSpeaking(false); return; }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch {
      setSpeaking(false);
    }
  }

  function playPcm16(chunks: Int16Array[]) {
    if (chunks.length === 0 || !openRef.current) return;

    // Stop any existing PCM playback first
    if (pcmCtxRef.current) {
      pcmCtxRef.current.close().catch(() => {});
      pcmCtxRef.current = null;
    }

    setSpeaking(true);

    const totalLen = chunks.reduce((a, c) => a + c.length, 0);
    const merged = new Int16Array(totalLen);
    let offset = 0;
    for (const c of chunks) { merged.set(c, offset); offset += c.length; }

    const float32 = new Float32Array(merged.length);
    for (let i = 0; i < merged.length; i++) float32[i] = merged[i] / 32768;

    const ctx = new AudioContext({ sampleRate: 24000 });
    pcmCtxRef.current = ctx;
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setSpeaking(false);
      ctx.close().catch(() => {});
      if (pcmCtxRef.current === ctx) pcmCtxRef.current = null;
    };
    source.start();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000 } });
      streamRef.current = stream;

      // Analyser for waveform
      const ctx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      setAnalyser(node);

      // PCM capture for realtime API
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(ctx.destination);

      chunksRef.current = [];
      const pcmChunks: ArrayBuffer[] = [];

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, Math.floor(float32[i] * 32768)));
        }
        pcmChunks.push(int16.buffer);
      };

      // Store pcmChunks ref for sending later
      chunksRef.current = pcmChunks as unknown as Blob[];

      setRecordingStart(Date.now());
      setRecording(true);
    } catch {
      // mic permission denied
    }
  }

  async function stopRecording() {
    setRecording(false);
    setAnalyser(null);

    // Stop processor and stream
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const pcmChunks = chunksRef.current as unknown as ArrayBuffer[];
    if (!pcmChunks || pcmChunks.length < 3) return;

    // Merge PCM chunks
    const totalLen = pcmChunks.reduce((a, c) => a + c.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let off = 0;
    for (const c of pcmChunks) {
      merged.set(new Uint8Array(c), off);
      off += c.byteLength;
    }
    // Chunk the conversion to avoid stack overflow on large arrays
    let binaryStr = "";
    const chunkSize = 8192;
    for (let i = 0; i < merged.length; i += chunkSize) {
      const slice = merged.subarray(i, Math.min(i + chunkSize, merged.length));
      binaryStr += String.fromCharCode.apply(null, slice as unknown as number[]);
    }
    const audioBase64 = btoa(binaryStr);

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    // Send via Realtime API
    // Bail if chat was closed during async gap
    if (responseDoneRef.current) return;

    setLoading(true);
    setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
    setThinking(true);

    try {
      // Get ephemeral session
      const sessionRes = await fetch("/api/realtime/session", { method: "POST" });
      if (!sessionRes.ok) throw new Error("Session failed");
      if (responseDoneRef.current) return; // closed during fetch

      const session = await sessionRes.json();
      const ephemeralKey = session.client_secret?.value;
      if (!ephemeralKey) throw new Error("No ephemeral key");

      // Connect WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-realtime-1.5`,
        ["realtime", `openai-insecure-api-key.${ephemeralKey}`, "openai-beta.realtime-v1"]
      );
      wsRef.current = ws;

      let transcriptText = "";
      audioChunksRef.current = [];

      ws.onopen = () => {
        // Send the audio
        ws.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_audio", audio: audioBase64 }],
          },
        }));
        ws.send(JSON.stringify({ type: "response.create" }));
      };

      let assistantAdded = false;
      responseDoneRef.current = false;

      ws.onmessage = (event) => {
        // Ignore all events after response is complete
        if (responseDoneRef.current) return;

        const msg = JSON.parse(event.data);

        // User transcript
        if (msg.type === "conversation.item.input_audio_transcription.completed") {
          const userText = msg.transcript?.trim();
          if (userText) {
            setMessages((prev) => [...prev, { role: "user", content: userText }]);
          }
        }

        // Response started — clear thinking, add empty assistant message
        if (msg.type === "response.created" || msg.type === "response.output_item.added") {
          if (!assistantAdded) {
            setThinking(false);
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
            assistantAdded = true;
          }
        }

        // Assistant audio transcript delta (text version of audio output)
        if (msg.type === "response.audio_transcript.delta" || msg.type === "response.output_audio_transcript.delta") {
          const delta = msg.delta || "";
          transcriptText += delta;
          const snap = transcriptText;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: snap },
          ]);
        }

        // Assistant text delta (text-only modality)
        if (msg.type === "response.text.delta" || msg.type === "response.output_text.delta") {
          const delta = msg.delta || "";
          transcriptText += delta;
          const snap = transcriptText;
          if (!assistantAdded) {
            setThinking(false);
            setMessages((prev) => [...prev, { role: "assistant", content: snap }]);
            assistantAdded = true;
          } else {
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: snap },
            ]);
          }
        }

        // Assistant audio delta
        if (msg.type === "response.audio.delta" || msg.type === "response.output_audio.delta") {
          if (msg.delta && ttsEnabled) {
            const binary = atob(msg.delta);
            const int16 = new Int16Array(binary.length / 2);
            for (let i = 0; i < int16.length; i++) {
              int16[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
            }
            audioChunksRef.current.push(int16);
          }
        }

        // Error
        if (msg.type === "error") {
          responseDoneRef.current = true;
          setThinking(false);
          setLoading(false);
          setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg.error?.message || "Something went wrong"}` }]);
          ws.close();
          wsRef.current = null;
        }

        // Response done — play audio once then fully shut down
        if (msg.type === "response.done") {
          responseDoneRef.current = true;
          setLoading(false);

          // Grab chunks and clear immediately to prevent double-play
          const chunks = [...audioChunksRef.current];
          audioChunksRef.current = [];

          // Only play if chat is still open
          if (ttsEnabled && chunks.length > 0 && openRef.current) {
            playPcm16(chunks);
          }

          ws.onmessage = null;
          ws.close();
          wsRef.current = null;
        }
      };

      ws.onerror = () => {
        responseDoneRef.current = true;
        ws.onmessage = null;
        setThinking(false);
        setLoading(false);
        audioChunksRef.current = [];
        setMessages((prev) => [...prev, { role: "assistant", content: "Voice connection failed. Try typing instead." }]);
        ws.close();
        wsRef.current = null;
      };
    } catch {
      setThinking(false);
      setLoading(false);
      // Fallback: use transcribe + text chat
      const formData = new FormData();
      const blob = new Blob([merged], { type: "audio/pcm" });
      formData.append("audio", blob, "audio.webm");
      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        if (res.ok) {
          const { text } = await res.json();
          if (text) send(text, true);
        }
      } catch {}
    }
  }

  async function send(text: string, fromVoice = false) {
    text = text.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    shouldScrollRef.current = true;
    setMessages(next);
    setInput("");
    setLoading(true);

    setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
    setThinking(true);

    const minThink = new Promise((r) => setTimeout(r, 800));

    try {
      const [res] = await Promise.all([
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        }),
        minThink,
      ]);

      if (!res.ok) throw new Error("Request failed");

      setThinking(false);


      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let content = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        const snapshot = content;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: snapshot },
        ]);
      }

      // Auto-play TTS if sent via voice and chat is still open
      if (fromVoice && content && openRef.current) {
        playTts(content);
      }
    } catch {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {

      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" style={{ width: `min(${PANEL_W}px, calc(100vw - 32px))`, display: hidden ? "none" : undefined }}>
      <motion.div
        ref={wrapperRef}
        initial={false}
        animate={{
          width: open ? Math.min(PANEL_W, typeof window !== "undefined" ? window.innerWidth - 32 : PANEL_W) : 140,
          height: open ? Math.min(PANEL_H, typeof window !== "undefined" ? window.innerHeight - 32 : PANEL_H) : PILL_H,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 40,
          mass: 0.8,
        }}
        className="relative ml-auto"
      >
        <div
          className={`chat-card relative flex h-full w-full flex-col overflow-hidden ${open ? "chat-card--open" : "border border-border bg-background shadow-2xl"}`}
          style={{
            borderRadius: open ? 16 : 22,
            boxShadow: open ? "0 0 0 1px rgba(255,255,255,0.12)" : undefined,
          }}
        >
          <style jsx>{`
            .chat-card--open {
              background-color: hsla(240, 15%, 9%, 1);
              color: hsl(0, 0%, 100%);
            }
          `}</style>
        {/* Gradient overlay — behind all content */}
        {open && (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              borderRadius: 16,
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
        )}
        {/* Grain noise */}
        {open && (
          <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-[0.10]" style={{ borderRadius: 16 }}>
            <filter id="chat-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#chat-grain)" />
          </svg>
        )}

        {/* Collapsed pill */}
        <AnimatePresence>
          {!open && (
            <motion.button
              className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 px-4"
              onClick={() => {
                stopAudio();
                responseDoneRef.current = true;
                if (wsRef.current) {
                  wsRef.current.onmessage = null;
                  wsRef.current.close();
                  wsRef.current = null;
                }
                audioChunksRef.current = [];
                responseDoneRef.current = false;
                setMessages([]);
                setInput("");
                setThinking(false);
                setLoading(false);
                setSpeaking(false);
                setOpen(true);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-label="Open AI chat"
            >
              <AiOrb size={20} />
              <span className="text-sm font-medium text-foreground">Ask AI</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="flex h-full flex-col text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {/* Header */}
              <div className="relative z-10 flex items-center gap-3 px-5 py-4">
                <Image src="/logo.png" alt="RC" width={28} height={28} />
                <p className="text-base font-semibold">Ask about my work</p>
              </div>

              <div className="relative z-10 h-px bg-white/10" />

              {/* Messages */}
              <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {messages.length === 0 && !thinking && (
                  <motion.div
                    className="flex flex-col gap-4 pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <p className="text-lg font-semibold tracking-tight text-white">
                      Ask me anything about Robert&apos;s projects, skills, or experience.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed overflow-hidden break-words ${
                        msg.role === "user"
                          ? "bg-white text-black rounded-br-md"
                          : "bg-[hsla(240,15%,15%,0.95)] text-white rounded-bl-md backdrop-blur-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        msg.content ? (
                          <div className="chat-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : null
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking — blue orb loader */}
                <AnimatePresence>
                  {thinking && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md bg-[hsla(240,15%,15%,0.95)] backdrop-blur-sm px-4 py-3">
                        <AiOrb size={16} />
                        <span className="text-xs text-white/70">{thinkingText}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={bottomRef} className="h-px" />
              </div>

              {/* Input */}
              <div className="relative z-10 h-px bg-white/10" />
              <div className="relative z-10">
              <AnimatePresence mode="wait">
                {recording ? (
                  /* Recording state — live waveform */
                  <motion.div
                    key="recording"
                    className="flex items-center gap-2 px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LiveWaveform analyser={analyser} startTime={recordingStart} />
                    <motion.button
                      type="button"
                      onClick={stopRecording}
                      aria-label="Stop recording"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <Square className="size-3" />
                      </motion.div>
                    </motion.button>
                  </motion.div>
                ) : speaking ? (
                  /* TTS playback state — animated bars */
                  <motion.div
                    key="speaking"
                    className="flex items-center gap-2 px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex-1">
                      <PlaybackWaveform />
                    </div>
                    <motion.button
                      type="button"
                      onClick={stopAudio}
                      aria-label="Stop playback"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Square className="size-3" />
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Default input state */
                  <motion.form
                    key="input"
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (speaking) stopAudio();
                        setTtsEnabled(!ttsEnabled);
                      }}
                      aria-label={ttsEnabled ? "Mute voice" : "Enable voice"}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      whileTap={{ scale: 0.9 }}
                    >
                      {ttsEnabled ? <Volume2 className="size-3.5" /> : <VolumeOff className="size-3.5" />}
                    </motion.button>

                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask something..."
                      disabled={loading}
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60 disabled:opacity-50"
                    />

                    <motion.button
                      type="button"
                      onClick={startRecording}
                      disabled={loading}
                      aria-label="Start recording"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mic className="size-3.5" />
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label="Send message"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="size-3.5" />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
