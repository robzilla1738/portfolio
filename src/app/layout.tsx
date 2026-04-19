import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const title = "Robert Courson | Designer turned developer";
const description =
  "Full-stack developer with a design background and AI specialty. Fine-tuned LLMs, RAG pipelines, production apps end-to-end.";
const siteUrl = "https://www.robertcourson.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Robert Courson",
  },
  description,
  applicationName: "Robert Courson",
  authors: [{ name: "Robert Courson", url: siteUrl }],
  creator: "Robert Courson",
  publisher: "Robert Courson",
  keywords: [
    "Robert Courson",
    "designer turned developer",
    "full-stack developer",
    "AI engineer",
    "LLM fine-tuning",
    "RAG pipelines",
    "Next.js developer",
    "TypeScript",
    "Expo",
    "Rhema",
    "Memorwise",
    "svvarm",
    "GemmaBible",
    "Fieldtrip",
  ],
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Robert Courson",
    title,
    description,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Robert Courson. Designer turned developer.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Robert Courson",
  alternateName: "Rob Courson",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  jobTitle: "Full-stack Developer",
  description,
  email: "mailto:robertcourson96@gmail.com",
  sameAs: [
    "https://github.com/robzilla1738",
    "https://www.linkedin.com/in/robcourson/",
    "https://huggingface.co/rhemabible",
    "https://ollama.com/robzilla",
  ],
  knowsAbout: [
    "Full-stack web development",
    "TypeScript",
    "Next.js",
    "React",
    "Expo",
    "tRPC",
    "Postgres",
    "LLM fine-tuning",
    "QLoRA",
    "RAG pipelines",
    "OpenAI API",
    "Design systems",
    "Brand identity",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Rhema",
    url: "https://rhemabible.co",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Robert Courson",
  url: siteUrl,
  description,
  author: { "@type": "Person", name: "Robert Courson" },
  inLanguage: "en-US",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", dmSans.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
