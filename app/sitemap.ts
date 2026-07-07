import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";

const base = "https://janidudev.lycolabs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectRoutes,
  ];
}
