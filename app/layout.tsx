import type { Metadata, Viewport } from "next";
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { profile, siteUrl } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Analytics } from "@/components/analytics";

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

const homepageTitle = "Janidu Yapa | Software Engineer & Full-Stack Developer";
const homepageDescription =
  "Janidu Yapa is a software engineer and full-stack developer in Kandy, Sri Lanka, building ERP systems, POS software, AI-powered web applications, booking systems, and modern business software.";

// Only include verification entries that actually have a real token — never
// ship an empty content="" meta tag or an invented value.
const verification: Metadata["verification"] = {};
if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
  verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
  verification.other = {
    "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homepageTitle,
    template: "%s | Janidu Yapa",
  },
  description: homepageDescription,
  applicationName: "JaniduDev",
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  keywords: [
    "Janidu Yapa",
    "Janidu Dhakshitha Yapa",
    "JaniduDev",
    "Janidu Yapa software engineer",
    "Janidu Yapa full-stack developer",
    "Janidu Yapa Sri Lanka",
    "Janidu Yapa Kandy",
    "software engineer in Kandy",
    "full-stack developer in Sri Lanka",
    "ERP developer Sri Lanka",
    "POS software developer Sri Lanka",
    "AI application developer Sri Lanka",
    "Next.js developer Sri Lanka",
    "Spring Boot developer Sri Lanka",
    "software engineer portfolio Sri Lanka",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: homepageTitle,
    description: homepageDescription,
    siteName: "JaniduDev",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "strict-origin-when-cross-origin",
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
  other: {
    "darkreader-lock": "true", // Prevents Dark Reader from causing hydration mismatches
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Janidu Yapa",
  alternateName: "JaniduDev",
  url: `${siteUrl}/`,
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
        <JsonLd data={websiteJsonLd} />
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {/* Site-wide: every Framer Motion animation automatically respects
            the visitor's OS-level prefers-reduced-motion setting. */}
        <MotionConfig reducedMotion="user">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </MotionConfig>
        <Analytics />
      </body>
    </html>
  );
}
