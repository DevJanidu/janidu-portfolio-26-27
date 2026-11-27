import { ImageResponse } from "next/og";
import { heroContent, profile } from "@/lib/data";

export const alt =
  "Janidu Dev — Websites & Online Booking for Small Businesses";
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
          background: "#FAF9F6",
          color: "#111827",
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderTop: "10px solid #1D4ED8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#1D4ED8",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
              display: "flex",
            }}
          >
            {profile.publicName} · JaniduDev
          </div>
          <div
            style={{
              color: "#4B5563",
              fontSize: 22,
              display: "flex",
            }}
          >
            {profile.location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              color: "#111827",
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {heroContent.headline}
          </div>
          <div
            style={{
              color: "#4B5563",
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 940,
              display: "flex",
            }}
          >
            {heroContent.subheadline}
          </div>
        </div>

        <div
          style={{
            color: "#1D4ED8",
            fontSize: 22,
            fontWeight: 600,
            display: "flex",
          }}
        >
          janidudev.com · Serving US, UK, Australia &amp; Sri Lanka
        </div>
      </div>
    ),
    { ...size }
  );
}
