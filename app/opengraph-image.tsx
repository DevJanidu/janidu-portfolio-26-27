import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const alt = "Janidu Yapa — Software Engineer & Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #03045E 0%, #023E8A 45%, #0077B6 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#00B4D8",
              display: "flex",
            }}
          />
          <div
            style={{
              color: "#90E0EF",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1,
              display: "flex",
            }}
          >
            JaniduDev
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              color: "#CAF0F8",
              fontSize: 34,
              fontWeight: 500,
              display: "flex",
            }}
          >
            Software Engineer &amp; Full-Stack Developer
          </div>
          <div
            style={{
              color: "#90E0EF",
              fontSize: 24,
              fontWeight: 400,
              display: "flex",
            }}
          >
            Kandy, Sri Lanka · ERP · POS · AI-powered web applications
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
