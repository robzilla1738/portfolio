import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Robert Courson — Designer turned developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 100px",
          backgroundColor: "#1a1a1a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Robert Courson
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#a0a0a0",
            marginTop: 20,
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          Designer turned developer. Full-stack apps, fine-tuned LLMs, RAG pipelines. 10 years of design, 4 years of engineering.
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >
          {["Next.js", "TypeScript", "Python", "QLoRA", "RAG", "OpenAI", "React Native"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 16,
                  color: "#999",
                  border: "1px solid #333",
                  borderRadius: 999,
                  padding: "8px 20px",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 100,
            fontSize: 18,
            color: "#555",
          }}
        >
          robcourson.com
        </div>
      </div>
    ),
    { ...size }
  );
}
