import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 21,
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "monospace",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          R
        </span>
        <div
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: 3,
            background: "#10b981",
            right: 5,
            bottom: 6,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
