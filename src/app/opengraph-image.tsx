import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#070a12",
          backgroundImage:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(124,92,255,0.28), transparent 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #7C5CFF 0%, #20D4FF 100%)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "7px solid #0E1322",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#F7F8FC" }}>
          CondoPilot AI
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9AA4B2" }}>
          An AI agent that doesn&apos;t just answer. It acts.
        </div>
      </div>
    ),
    { ...size },
  );
}
