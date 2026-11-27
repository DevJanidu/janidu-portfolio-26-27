import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Janidu Dev | Websites & Online Booking for Small Businesses",
    short_name: "JaniduDev",
    description:
      "Freelance web designer and developer building custom websites, service menus, and online booking for small businesses worldwide.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#091C44",
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
