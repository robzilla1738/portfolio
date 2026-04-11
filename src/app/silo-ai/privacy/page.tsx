import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Silo AI",
  description: "Privacy policy for the Silo AI iOS app.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <article className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-sm text-neutral-500">Effective: April 10, 2026</p>

        <p className="mt-8">
          Silo AI (&ldquo;the App&rdquo;) is developed by Robert Courson. This policy describes how the App handles your data.
        </p>

        <h2 className="mt-10 text-xl font-semibold">On-Device Processing</h2>
        <p className="mt-3">
          Silo AI is designed to run entirely on your device. All AI inference, text embedding, speech recognition,
          text-to-speech, and corpus storage happen locally using on-device models.{" "}
          <strong>No user data is sent to our servers because we do not operate any servers.</strong>
        </p>

        <h2 className="mt-10 text-xl font-semibold">Data We Do Not Collect</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>We do not collect personal information, usage analytics, crash reports, or telemetry.</li>
          <li>We do not use cookies, advertising identifiers, or tracking pixels.</li>
          <li>We do not access your contacts, location, calendar, or health data.</li>
          <li>We do not create user accounts or require sign-in.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Data Stored on Your Device</h2>
        <p className="mt-3">The following data is stored locally on your device and never leaves it:</p>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li><strong>Conversations</strong> &mdash; Chat messages between you and the AI models.</li>
          <li><strong>Corpus</strong> &mdash; Files, photos, voice memos, Apple Notes, and meeting transcripts you add to your personal knowledge base.</li>
          <li><strong>Pinned Memory</strong> &mdash; Messages you pin for long-term recall.</li>
          <li><strong>Projects</strong> &mdash; Workspace names, icons, and custom system prompts.</li>
          <li><strong>Model Files</strong> &mdash; Downloaded AI model weights (GGUF format).</li>
          <li><strong>Preferences</strong> &mdash; App settings stored in UserDefaults.</li>
          <li><strong>API Keys</strong> &mdash; If you choose to configure OpenRouter or OpenAI API keys, they are stored in the iOS Keychain on your device.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Optional Cloud Features</h2>
        <p className="mt-3">
          The following features are <strong>disabled by default</strong> and only activate when you explicitly configure them with your own API keys:
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>
            <strong>OpenRouter API</strong> &mdash; If you enter an OpenRouter API key, chat messages are sent to
            OpenRouter&apos;s servers for inference with cloud models (e.g., Claude, GPT). OpenRouter&apos;s{" "}
            <a href="https://openrouter.ai/privacy" className="underline hover:text-blue-500">privacy policy</a> applies.
          </li>
          <li>
            <strong>OpenAI Whisper API</strong> &mdash; If you enable the OpenAI Whisper API for transcription, audio
            recordings are sent to OpenAI&apos;s servers. OpenAI&apos;s{" "}
            <a href="https://openai.com/privacy" className="underline hover:text-blue-500">privacy policy</a> applies.
          </li>
        </ul>
        <p className="mt-3">When these features are disabled (the default), no data leaves your device.</p>

        <h2 className="mt-10 text-xl font-semibold">Model Downloads</h2>
        <p className="mt-3">
          When you download an AI model, the App fetches the model file from Hugging Face (huggingface.co). This is a
          standard HTTPS file transfer. Hugging Face may log the download request per their privacy policy. No personal
          data is included in the request.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Web Search</h2>
        <p className="mt-3">
          When you enable web search (globe icon), the App sends your query to DuckDuckGo, Bing, or Wikipedia to
          retrieve search results. These services may log search queries per their respective privacy policies. No
          personal data beyond the search query is sent.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Microphone and Camera</h2>
        <p className="mt-3">
          The App requests microphone access for voice input and meeting recording. Camera access is requested for OCR
          photo capture. All audio and image processing happens on-device. Audio recordings for meetings are stored
          temporarily and deleted after transcription.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Children&apos;s Privacy</h2>
        <p className="mt-3">
          The App is not directed at children under 13 and does not knowingly collect data from children.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Changes to This Policy</h2>
        <p className="mt-3">
          We may update this policy from time to time. The effective date at the top indicates when it was last revised.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3">
          Questions about this policy? Contact:{" "}
          <a href="mailto:robert@robertcourson.com" className="underline hover:text-blue-500">
            robert@robertcourson.com
          </a>
        </p>

        <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} Robert Courson. All rights reserved.</p>
        </div>
      </article>
    </main>
  );
}
