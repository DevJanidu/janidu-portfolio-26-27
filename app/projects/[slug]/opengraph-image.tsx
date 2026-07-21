import { ImageResponse } from "next/og";
import { projects } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Software project case study by Janidu Yapa";

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
  const title = project?.title ?? "Project";
  const tagline = project?.tagline ?? "A software project by Janidu Yapa";

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
            JaniduDev · Case Study
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#CAF0F8",
              fontSize: 30,
              fontWeight: 500,
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              color: "#90E0EF",
              fontSize: 24,
              fontWeight: 400,
              display: "flex",
            }}
          >
            By Janidu Yapa
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
