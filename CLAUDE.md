# Robert Courson Portfolio

Personal portfolio website for Robert Courson — designer turned developer.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, TypeScript 5)
- **Styling:** Tailwind CSS v4, OKLCH color system, CSS variables
- **Components:** shadcn/ui (Base UI primitives), CVA for variants
- **Animations:** Framer Motion 12, `prefers-reduced-motion` respected throughout
- **Icons:** Lucide React, @lobehub/icons (brand icons for GitHub, HuggingFace, Ollama)
- **Markdown:** react-markdown + remark-gfm (chat, BibleAI, and GemmaBible responses)
- **Font:** Geist (variable, via next/font), Instrument Serif (headings in experience section)

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout: Geist font, dark mode, TooltipProvider
    page.tsx            # Single-page portfolio (hero, about, skills, projects, experience, contact)
    globals.css         # OKLCH theme tokens, chat markdown styles, model response styles
    api/
      chat/route.ts     # Portfolio AI assistant (OpenAI gpt-5.4-nano, tool calling)
      bibleai/route.ts  # BibleAI:7b proxy (HuggingFace Inference Endpoint, llama.cpp, SSE streaming)
      gemmabible/route.ts # GemmaBible:E4B proxy (HuggingFace Inference Endpoint, llama.cpp, SSE streaming, thinking support)
      realtime/session/route.ts  # OpenAI Realtime API ephemeral session tokens
      transcribe/route.ts        # OpenAI Whisper transcription (gpt-4o-mini-transcribe)
      tts/route.ts               # OpenAI text-to-speech (gpt-4o-mini-tts, "ash" voice)
  components/
    chat.tsx            # AI chat panel with morph animation, voice I/O, streaming. Accepts `hidden` prop.
    bibleai-demo.tsx    # Reusable model demo modal (used for both BibleAI and GemmaBible). Props: modelName, apiEndpoint, buttonLabel, subtitle, howItWorks, supportsThinking, grainId. Cold-start auto-retry, thinking indicator, SSE streaming.
    project-card.tsx    # Project card with highlights, tech badges, contextual link icons (h-full for grid alignment)
    pixel-bear.tsx      # Easter egg: pixelated bear in navbar. Click to wake, walks across navbar, parachutes down page, bounces on trampoline, flies back. State machine with useReducer. Portal for floating phase.
    ui/
      badge.tsx         # shadcn badge (6 variants)
      button.tsx        # shadcn button (6 variants, 8 sizes, nativeButton support)
      shine-border.tsx  # Animated gradient border effect (CSS mask + radial gradient)
      tooltip.tsx       # shadcn tooltip (Base UI)
      video-preview.tsx # Cursor-following hover preview for project cards. Props: src, preview, disabled. Hides over buttons/links, re-shows on card body.
      blobs.tsx         # Animated spinning color blobs with text overlay (used as BibleAI preview)
      world-map.tsx     # Dotted world map with animated connection lines
      animated-theme-toggler.tsx # Theme toggle with circular clip-path view transition
  data/
    projects.ts         # 7 projects: Rhema, Memorwise, svvarm, Fieldtrip, BibleAI:7b, GemmaBible:E4B
  lib/
    rate-limit.ts       # In-memory IP-based rate limiter (sliding window, auto-cleanup every 5 min)
    utils.ts            # cn() -- clsx + tailwind-merge
```

## Environment Variables

```
OPENAI_API_KEY              # OpenAI -- chat (gpt-5.4-nano), realtime (gpt-realtime-1.5), TTS, transcription
OPENROUTER_API_KEY          # OpenRouter -- not actively used, kept as fallback
HF_API_TOKEN                # HuggingFace -- authenticates both model inference endpoints
HF_BIBLEAI_ENDPOINT_URL    # HuggingFace Inference Endpoint URL for BibleAI:7b (llama.cpp GGUF, us-east-1)
HF_GEMMABIBLE_ENDPOINT_URL # HuggingFace Inference Endpoint URL for GemmaBible:E4B (llama.cpp GGUF, eu-west-1)
```

## AI Chat System

### Portfolio Assistant (`/api/chat`)
- **Model:** `gpt-5.4-nano` via OpenAI API directly
- **Tool calling:** 5 tools -- `get_all_projects`, `get_project_details`, `get_tech_stack`, `get_career_timeline`, `get_contact_info`. Max 5 rounds per request.
- **System prompt:** Scoped to Robert only. Refuses non-portfolio questions with a redirect.
- **Streaming:** Text chunked at ~15 chars with 18ms delays for fluid output.
- **Rate limit:** 30 requests/hour per IP.

### Voice Mode
- **Recording:** MediaRecorder captures PCM16 via ScriptProcessorNode. Live waveform via AnalyserNode frequency data (scrolling bars + timer).
- **Ephemeral keys:** Backend creates session via `/api/realtime/session`, client connects to `wss://api.openai.com/v1/realtime` with the ephemeral key.
- **Model:** `gpt-realtime-1.5` with "ash" voice, PCM16 codec, input transcription via `gpt-4o-mini-transcribe`.
- **Audio playback:** PCM16 chunks decoded and played via AudioContext/BufferSource. Animated playback bars shown during output.
- **TTS fallback:** For text-typed messages sent via voice, uses `/api/tts` (gpt-4o-mini-tts).
- **Input states:** Three crossfading states in the input bar -- default (text input + mic + send), recording (live waveform + stop), playback (animated bars + stop).

### Chat UI (`chat.tsx`)
- **Collapsed:** "Ask AI" pill (140x44px) with animated orb (CSS box-shadow rotation keyframes). Faint `border-border` for visibility.
- **Expanded:** Morphs from pill to panel (400x540px) via spring animation (stiffness 500, damping 40).
- **Header:** RC logo image + "Ask about my work" title.
- **Purple gradient card** with grain noise overlay (feTurbulence SVG filter).
- **State management:** All audio/WebSocket refs cleaned up on close. `responseDoneRef` + `openRef` guards prevent audio replay. WebSocket handlers nulled before close. Component unmount cleanup effect.
- **Click outside to close.** All state (messages, audio, WebSocket, chunks) cleared on every open and close.
- **Hidden when BibleAI/GemmaBible modal is open** via `hidden` prop from page-level `bibleAiOpen` state.

### Model Demos (`bibleai-demo.tsx`)
Reusable component for both BibleAI:7b and GemmaBible:E4B. Configured via props.

#### BibleAI:7b
- **Model:** GGUF (Q5_K_M quantization) of fine-tuned Qwen 2.5, trained on 20 theological datasets.
- **Hosting:** HuggingFace Inference Endpoint with llama.cpp engine on Nvidia T4 GPU (16GB).
- **API route:** `/api/bibleai` -- SSE streaming from HF endpoint, max_tokens 2048, parses `data:` lines.
- **Scale to zero:** After 15 min idle. Cold start ~60s. $0.50/hr while running, $0 when idle.

#### GemmaBible:E4B
- **Model:** GGUF (Q5_K_M quantization) of fine-tuned Google Gemma 4 E4B-it, 4.5B effective parameters, trained on 8,000 instruction examples.
- **Hosting:** HuggingFace Inference Endpoint with llama.cpp engine on Nvidia T4 GPU (16GB).
- **API route:** `/api/gemmabible` -- SSE streaming, max_tokens 2048, thinking token support via `\x00THINK\x00` markers.
- **Thinking model:** Sends `delta.reasoning_content` tokens with markers. Frontend shows "Thinking" indicator with streaming preview, then hides it when real content arrives.
- **Scale to zero:** After 15 min idle. Cold start ~60s. $0.50/hr while running, $0 when idle.

#### Shared Demo UI Features
- Full-screen modal with purple gradient background + grain noise overlay.
- Backdrop click to close (click handler on centering container + stopPropagation on modal content).
- ShineBorder trigger button with purple gradient.
- Suggestion chips for common questions.
- "How it works" explainer cards (only shown on first request, hidden after first successful response).
- Cold-start auto-retry: up to 6 retries at 10s intervals. Shows "Model is loading" card during cold start. Loading spinner only shows when `!cold` (mutually exclusive).
- Rate limit: 10 requests/hour per IP (keyed separately: `ip` for BibleAI, `gemma-ip` for GemmaBible).
- Bot protection: Rejects prompts under 3 chars or over 2000 chars.
- System prompts include formatting rules: no LaTeX, use plain Unicode Greek characters, markdown only.
- `onOpenChange` prop communicates open state to parent for hiding Chat pill and disabling VideoPreview.

## Pixel Bear Easter Egg (`pixel-bear.tsx`)

A small pixelated bear replaces the logo in the navbar. Purely black and white, minimal.

### Sprite System
- 10x10 grid rendered at 3px per pixel (30px total, centered in 32px container).
- 3 frames: `sleep` (no eyes), `awake` (eyes as black dots), `land` (squatting).
- Two palettes: dark mode (white bear on dark bg) and light mode (dark bear on light bg).
- `BearSprite` component: memoized SVG renderer with `shapeRendering="crispEdges"`.
- Parachute: separate SVG semicircle with 3 strings, scale animation on deploy.

### State Machine (`useReducer`)
```
idle → waking → walking → edge → freefall → parachute → bounce → flyback → walkback → returning → idle
```

### Animation Phases
- **Idle:** Bear sleeps. Hover shows "Hibernating" speech bubble below with blinking `...` (CSS `content` animation).
- **Waking:** Blink animation (sleep/awake frames alternate over 600ms).
- **Walking:** rAF loop, 2.5px/frame, Y-bounce every 12px. Walks to right edge of navbar inner container.
- **Edge:** 500ms pause. Captures screen position via `getBoundingClientRect()` for portal handoff.
- **Freefall:** Bear portals to `document.body` with `position: fixed`. Accelerating gravity for ~18 frames.
- **Parachute:** Chute deploys with spring scale animation. Bear sways (sin wave ±20px, ±3deg rotation). Page auto-scrolls to bottom at 12-25px/frame (accelerating). Trampoline appears at viewport bottom immediately.
- **Bounce:** Bear squashes on trampoline (scaleY 0.6) for 350ms. Trampoline compresses.
- **Flyback:** Timed 1.2s ease-in-out cubic animation. Bear + scroll + X position all interpolate smoothly to navbar. 720-degree decelerating spin. Target X accounts for `walkX` offset so handoff to inline bear is seamless.
- **Walkback:** Inline bear walks left at 3px/frame back to logo position.
- **Returning:** 400ms settle, then resets to idle/sleep.

### Edge Cases
- **Reduced motion:** Click triggers a wink (awake frame for 800ms), no animation.
- **Click during animation:** Ignored (state !== "idle" guard).
- **Dark mode observer:** MutationObserver on `<html>` class attribute updates palette.
- **Portal:** Floating bear uses `createPortal(el, document.body)` with `z-index: 9999` during freefall/parachute/bounce/flyback.
- **Trampoline:** Separate portal at `z-index: 9998`, fixed to viewport bottom.

## Page Sections

1. **Navbar** -- fixed top bar with backdrop blur (z-50). Pixel bear (replaces logo) left, text links (About, Projects, Experience, Contact) + social icons (GitHub, LinkedIn, Email) + theme toggler right. `navbarInnerRef` passed to PixelBear for walk boundary calculation. Max-w-5xl.
2. **Hero** -- "Hi, I'm Robert" + designer-to-developer subtitle.
3. **TL;DR** -- two paragraphs telling the design-to-dev story. Fieldtrip inline link.
4. **Projects** -- centered divider with "Projects" label.
   - First 4 projects stacked: Rhema, Memorwise, svvarm, Fieldtrip. Each wrapped in `VideoPreview` for cursor-following hover previews (except Fieldtrip if no video).
   - Last 2 projects side-by-side: BibleAI:7b + GemmaBible:E4B in `grid md:grid-cols-2`. Each has its own "Try" button opening the shared demo modal. No hover video on these.
   - Each card: title + tag, hook description, 3 bullet highlights, tech badges, contextual link icons (Globe for websites, GitHub/HuggingFace/Ollama brand icons detected by URL).
   - `VideoPreview` disabled when any model demo modal is open (`bibleAiOpen` state).
5. **Skills** -- categorized grid (AI/ML, Infrastructure, Design, Backend, Frontend, Mobile) with rounded pill badges.
6. **Experience** -- centered divider with "Experience" label. 7 roles with vertical timeline (dots + connecting lines). Each has Instrument Serif role title, company, date range, one-line highlight, and expandable "Read more" for full details (animated height + opacity). Roles: Rhema (2026-present), Fieldtrip (2015-present), Children's Cup, Our Savior's Church, Ejento, Freenome, Tempo Automation.
7. **Contact** -- bordered rounded card with "Get in Touch" heading + email link.
8. **Chat** -- floating morph panel (fixed bottom-right). Hidden when model demo is open.

## Key Patterns

- **Animation:** `useReducedMotion()` checked in every animated component. Two animation helpers in page.tsx: `anim(delay)` for on-mount entrance, `scroll(delay)` for scroll-triggered via `whileInView`. Experience items use per-component `expanded` state.
- **Dark mode:** Hardcoded `dark` class on `<html>`. OKLCH color tokens in globals.css for both `:root` and `.dark`. Theme toggler uses View Transition API with circular clip-path.
- **Buttons as links:** Use `nativeButton={false}` with `render={<a>}` prop for Base UI Button component when rendering anchor elements.
- **Brand icons:** @lobehub/icons default exports for GitHub, HuggingFace, Ollama. Detected by URL pattern in `getLinkIcon()` function inside project-card.tsx.
- **Markdown rendering:** `.chat-markdown` class in globals.css handles all prose styling -- paragraphs, headings, code, blockquotes (blue left border for scripture), lists, tables, links, horizontal rules. Used by chat, BibleAI, and GemmaBible demos.
- **Rate limiting:** In-memory Map keyed by IP. Sliding window with configurable limit and window duration. Auto-cleans expired entries every 5 minutes. Applied to `/api/chat` (30/hr), `/api/bibleai` (10/hr), `/api/gemmabible` (10/hr, keyed as `gemma-{ip}`).
- **Audio cleanup:** Multiple guard layers prevent audio replay bugs -- `responseDoneRef`, `openRef`, `pcmCtxRef` tracking, WebSocket handler nulling, component unmount cleanup effect.
- **Modal state lifting:** `bibleAiOpen` state lifted to page.tsx via `onOpenChange` callback. Controls: hiding Chat pill (`hidden` prop), disabling VideoPreview hover (`disabled` prop).
- **Cursor-following previews:** `VideoPreview` uses `useMotionValue` + `useSpring` for smooth cursor tracking. Hides over interactive elements (buttons/links), re-shows when mouse returns to card body. Supports both `<video>` src and custom React `preview` elements.
- **SSE streaming:** Both model API routes use true server-sent event streaming from HuggingFace endpoints (`stream: true`). Parse `data:` lines, extract `delta.content`, pipe as plain text to client. GemmaBible additionally handles `delta.reasoning_content` with `\x00THINK\x00` markers.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Deployment

Designed for Vercel. All API routes are edge/serverless functions. Model inference is external (HuggingFace Inference Endpoints). No database -- all data is static in `projects.ts` and inline in `page.tsx`. Logo at `public/logo.png`. Videos at `public/*.mp4`.

## External Services

| Service | Purpose | Cost |
|---------|---------|------|
| OpenAI API | Chat (gpt-5.4-nano), voice (gpt-realtime-1.5), TTS, transcription | Per-token |
| HuggingFace Inference Endpoints | BibleAI:7b (T4 GPU, us-east-1) + GemmaBible:E4B (T4 GPU, eu-west-1), both llama.cpp | $0.50/hr each while running, $0 idle |
| Vercel | Hosting & deployment | Free tier |
