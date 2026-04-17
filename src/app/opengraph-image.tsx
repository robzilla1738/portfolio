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
          justifyContent: "flex-start",
          padding: "96px 120px",
          backgroundColor: "#ffffff",
          color: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
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
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            marginTop: 48,
          }}
        >
          Designer turned
          <br />
          developer.
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#555",
            marginTop: 36,
            lineHeight: 1.45,
            maxWidth: 860,
          }}
        >
          Full-stack apps, fine-tuned LLMs, RAG pipelines. 10 years of design, 4 years writing code.
        </div>

        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#8a8a8a",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {["Rhema", "Memorwise", "svvarm", "GemmaBible"].map((tag, i) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span style={{ color: "#0a0a0a" }}>{tag}</span>
                {i < 3 && <span style={{ color: "#c8c8c8" }}>·</span>}
              </div>
            ))}
          </div>
          <div>robcourson.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
