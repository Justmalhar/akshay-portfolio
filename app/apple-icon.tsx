import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c3b2e" }}>
        <div style={{ width: 108, height: 108, borderRadius: 54, background: "#f2e8d3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "#c9313d", display: "flex" }} />
        </div>
      </div>
    ),
    size
  );
}
