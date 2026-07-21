import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Janidu Yapa | Software Engineer & Full-Stack Developer",
    short_name: "JaniduDev",
    description:
      "Portfolio of Janidu Yapa, a software engineer and full-stack developer in Kandy, Sri Lanka.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
