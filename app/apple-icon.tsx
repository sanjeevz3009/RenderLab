import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 108,
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "monospace",
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          R
        </span>
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "#10b981",
            right: 28,
            bottom: 32,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
