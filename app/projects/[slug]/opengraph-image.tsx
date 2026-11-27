import { ImageResponse } from "next/og";
import { profile, projects } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Website project case study by Janidu Dev";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const title = project?.title ?? "Project Case Study";
  const tagline = project?.tagline ?? "Designed and built by Janidu Dev";
  const category = project?.category ?? "Featured Project";

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
            color: "#1D4ED8",
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "flex",
          }}
        >
          {category}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#111827",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#4B5563",
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            color: "#4B5563",
            fontSize: 24,
            fontWeight: 500,
            display: "flex",
          }}
        >
          Designed &amp; built by {profile.publicName} · janidudev.com
        </div>
      </div>
    ),
    { ...size }
  );
}
