import type { Metadata, Viewport } from "next";
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = "https://janidudev.lycolabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s · ${profile.firstName}`,
  },
  description: profile.intro,
  keywords: [
    "developer portfolio",
    "full-stack developer portfolio",
    "Janidu Dhakshitha Yapa",
    "Sri Lanka software engineer",
    "React developer",
    "Spring Boot engineer",
    "Next.js portfolio",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.name} — ${profile.title}`,
    description: profile.intro,
    siteName: `${profile.firstName}.dev`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description: profile.intro,
  },
  robots: { index: true, follow: true },
  other: {
    "darkreader-lock": "true", // Prevents Dark Reader from causing hydration mismatches
  },
};

export const viewport: Viewport = {
  themeColor: "#252422",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh" suppressHydrationWarning>
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
        >
          Skip to content
        </a>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
