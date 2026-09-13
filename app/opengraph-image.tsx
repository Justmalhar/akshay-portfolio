import { ImageResponse } from "next/og";
import { seo, site } from "@/lib/content";

export const alt = `${site.fullName} — ${seo.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card people see when the site is shared on LinkedIn, Slack, X or iMessage. */
export default function Image() {
  const balls = ["#c9313d", "#e9c33d", "#1d7a3d", "#2b5aa6", "#0f0f10"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c3b2e",
          backgroundImage: "radial-gradient(circle at 30% 0%, #14503e 0%, #0a3126 55%, #072318 100%)",
          padding: 64,
          border: "14px solid #4a2f18",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#e7c980", fontSize: 26, letterSpacing: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#c9313d", display: "flex" }} />
          AKSHAY JAGTAP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#f2e8d3", fontSize: 104, lineHeight: 1.05, letterSpacing: -3, display: "flex" }}>
            Precision. Patience.
          </div>
          <div style={{ color: "#e7c980", fontSize: 104, lineHeight: 1.05, letterSpacing: -3, display: "flex" }}>
            Position.
          </div>
          <div style={{ color: "#cfd9d1", fontSize: 30, marginTop: 26, maxWidth: 940, lineHeight: 1.4, display: "flex" }}>
            Senior software engineer and tech lead. Petabyte-scale data platforms and the production LLM agents on top of them.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {balls.map((c) => (
              <div key={c} style={{ width: 34, height: 34, borderRadius: 17, background: c, display: "flex" }} />
            ))}
            <div style={{ width: 34, height: 34, borderRadius: 17, background: "#f2e8d3", display: "flex" }} />
          </div>
          <div style={{ color: "#9db3a6", fontSize: 24, letterSpacing: 4, display: "flex" }}>SUNNYVALE · CALIFORNIA</div>
        </div>
      </div>
    ),
    size
  );
}
