import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

const homepageTitle =
  "Janidu Yapa | Websites & Online Booking for Small Businesses";
const homepageDescription =
  "Freelance web designer and developer based in Kandy, Sri Lanka, building custom websites, service menus, and online booking for salons, spas, and small businesses in the US, UK, Australia, and Sri Lanka.";

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
  category: "business",
  keywords: [
    "Janidu Yapa",
    "JaniduDev",
    "freelance web designer for small businesses",
    "salon website designer",
    "spa website design and online booking",
    "law firm website design",
    "small business web developer",
    "freelance web developer Sri Lanka",
    "custom booking website for salons",
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
    "darkreader-lock": "true",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh" suppressHydrationWarning>
        <JsonLd data={websiteJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <MotionConfig reducedMotion="user">
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </MotionConfig>
        <Analytics />
      </body>
    </html>
  );
}
