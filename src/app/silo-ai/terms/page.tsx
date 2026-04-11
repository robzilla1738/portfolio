import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Silo AI",
  description: "Terms of use for the Silo AI iOS app.",
};

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <article className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
        <p className="mt-1 text-sm text-neutral-500">Effective: April 10, 2026</p>

        <p className="mt-8">By using Silo AI (&ldquo;the App&rdquo;), you agree to these terms.</p>

        <h2 className="mt-10 text-xl font-semibold">License</h2>
        <p className="mt-3">
          The App is licensed, not sold. You receive a non-exclusive, non-transferable license to use the App on
          devices you own, subject to Apple&apos;s Standard EULA and these additional terms.
        </p>

        <h2 className="mt-10 text-xl font-semibold">AI-Generated Content</h2>
        <p className="mt-3">
          The App runs AI models that generate text responses. AI output may be inaccurate, incomplete, or
          inappropriate. You are responsible for reviewing and verifying all AI-generated content before relying on it.
          The App is not a substitute for professional advice (medical, legal, financial, or otherwise).
        </p>

        <h2 className="mt-10 text-xl font-semibold">Third-Party Models and Services</h2>
        <p className="mt-3">
          The App downloads AI models from third-party sources (Hugging Face). These models are provided by their
          respective creators under their own licenses. The App also optionally connects to OpenRouter and OpenAI APIs
          using your own API keys. Your use of these services is governed by their respective terms.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Your Data</h2>
        <p className="mt-3">
          All data you create in the App (conversations, corpus, recordings) is stored locally on your device. You are
          responsible for backing up your device. We do not have access to your data and cannot recover it if your
          device is lost or damaged.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Acceptable Use</h2>
        <p className="mt-3">
          You agree not to use the App to generate content that is illegal, harmful, or violates the rights of others.
          You are solely responsible for all content you generate using the App.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Disclaimer of Warranties</h2>
        <p className="mt-3 uppercase text-sm">
          The App is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that AI models
          will produce accurate, complete, or appropriate results.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Limitation of Liability</h2>
        <p className="mt-3 uppercase text-sm">
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or
          consequential damages arising from your use of the App.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Changes</h2>
        <p className="mt-3">
          We may update these terms. Continued use of the App after changes constitutes acceptance.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-3">
          Questions? Contact:{" "}
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
