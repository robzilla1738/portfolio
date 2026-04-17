import { ImageResponse } from "next/og";

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
          padding: "96px 120px",
          backgroundColor: "#ffffff",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 14,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8a8a8a",
          }}
        >
          Robert Courson
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            marginTop: 32,
          }}
        >
          Designer turned developer.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#555",
            marginTop: 28,
            lineHeight: 1.45,
            maxWidth: 860,
          }}
        >
          Full-stack apps, fine-tuned LLMs, RAG pipelines. 10 years of design, 4 years writing code.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 64,
            fontSize: 20,
            color: "#8a8a8a",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", color: "#0a0a0a" }}>
            Rhema · Memorwise · svvarm · GemmaBible
          </div>
          <div style={{ display: "flex" }}>robertcourson.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
