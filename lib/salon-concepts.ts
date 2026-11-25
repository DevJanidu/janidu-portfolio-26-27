// ---------------------------------------------------------------------------
// Salon Collection — Verified design concepts & salon scope tiers
// Source: https://salon-demo-coral-eta.vercel.app/concepts#packages
//
// All 11 live previews currently published on the showcase domain are verified
// with real 1280x720 screenshots. Additional concepts (up to 19) can be appended
// here with `verified: true` as soon as their routes go live.
// ---------------------------------------------------------------------------

export const SALON_CONCEPT_GALLERY_URL =
  "https://salon-demo-coral-eta.vercel.app/concepts#packages";
export const TOTAL_PLANNED_SALON_CONCEPTS = 19;

export type SalonPackageTier = "Starter" | "Standard" | "Premium";

export type SalonConcept = {
  number: string;
  slug: string;
  title: string;
  label: "Design concept";
  tier: SalonPackageTier;
  bookingApproach: string;
  palette: string;
  suits: string;
  styleSummary: string;
  screenshot: string;
  screenshotAlt: string;
  demoUrl: string;
  featuredOnHome: boolean;
  verified: boolean;
};

export type SalonTierScope = {
  tier: SalonPackageTier;
  tag: string;
  summary: string;
  includes: string[];
  revisions: string;
};

export const salonTierScopes: SalonTierScope[] = [
  {
    tier: "Starter",
    tag: "Single-page essentials",
    summary:
      "A focused, mobile-friendly salon page with your core service list, photo gallery, opening hours, Google Maps directions, and direct WhatsApp or booking link.",
    includes: [
      "Mobile-first single-page salon website",
      "Services overview, small gallery, opening hours, and map",
      "Direct WhatsApp or online booking button",
    ],
    revisions: "1 revision round included",
  },
  {
    tier: "Standard",
    tag: "Most popular",
    summary:
      "A full branded salon showcase with a detailed service menu, promotions or bridal packages section, and a private dashboard to update services, prices, and photos yourself.",
    includes: [
      "Detailed categorized service menu and expanded gallery",
      "Dedicated bridal packages or seasonal promotions section",
      "Private dashboard to add or edit services, prices, and gallery photos",
      "WhatsApp or external booking platform link",
    ],
    revisions: "2 revision rounds included",
  },
  {
    tier: "Premium",
    tag: "Multi-page suite",
    summary:
      "A 3 to 5 page salon website with dedicated pages for services, packages, gallery, and inquiries, plus full content controls and inquiry status tracking.",
    includes: [
      "3 to 5 custom pages with inquiry form and foundational SEO",
      "Full dashboard for services, packages, promotions, reviews, and hours",
      "Built-in inquiry tracker (mark leads as new, replied, or closed)",
      "WhatsApp plus integration with your booking system (such as Setmore)",
    ],
    revisions: "3 revision rounds included",
  },
];

export const salonConcepts: SalonConcept[] = [
  {
    number: "03",
    slug: "swiss-classic",
    title: "Swiss Classic",
    label: "Design concept",
    tier: "Premium",
    bookingApproach: "Service directory & instant book",
    palette: "Pure White · Jet Black · Hairline Grid",
    suits:
      "Suits busy hair, color, and skin clinics where decisive clients want to scan exact prices on the first screen and book a specific service right away.",
    styleSummary:
      "Puts a clean typographic service index in the first viewport with upfront prices, category details, and per-service Book buttons.",
    screenshot: "/assets/salon-concepts/03-swiss-classic.png",
    screenshotAlt:
      "Swiss Classic salon design concept showing a structured service index with prices and Book buttons on the first screen",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/classic",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "08",
    slug: "sage-blossom",
    title: "Sage Blossom",
    label: "Design concept",
    tier: "Standard",
    bookingApproach: "First-appointment guide",
    palette: "Botanical Sage · Petal Pink · Warm Stone",
    suits:
      "Suits holistic day spas, facial studios, and neighborhood salons that want to put nervous or first-time visitors at ease before they book.",
    styleSummary:
      "Walks new guests through three calm steps: choosing the right service, knowing how to prepare for arrival, and confirming a time online.",
    screenshot: "/assets/salon-concepts/08-sage-blossom.png",
    screenshotAlt:
      "Sage Blossom salon design concept showing a three-step first-visit appointment guide in soft sage and warm stone tones",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/sage",
    featuredOnHome: true,
    verified: true,
  },
  {
    number: "01",
    slug: "milan-marble",
    title: "Milan Marble",
    label: "Design concept",
    tier: "Premium",
    bookingApproach: "Editorial lookbook to booking",
    palette: "Gallery White · Runway Black · Warm Bronze",
    suits:
      "Suits upscale hair salons, color specialists, and bridal studios whose photography and signature looks sell the appointment.",
    styleSummary:
      "Opens with a full-bleed editorial cover and lookbook that connects featured hair and beauty looks directly to matching services and booking.",
    screenshot: "/assets/salon-concepts/01-milan-marble.png",
    screenshotAlt:
      "Milan Marble salon design concept showing a full-bleed fashion editorial cover with service menu, packages, and Book an Appointment button",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/marble",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "02",
    slug: "lucia-atelier",
    title: "Lucia Atelier",
    label: "Design concept",
    tier: "Premium",
    bookingApproach: "Transformation stories & consultation",
    palette: "Pure White · Warm Cream · Coral Salmon",
    suits:
      "Suits corrective color studios, skin ateliers, and med-spas where clients look for before-and-after results and expert consultations.",
    styleSummary:
      "Leads visitors from real client stories and concern-based navigation straight to the matching specialist service and consultation form.",
    screenshot: "/assets/salon-concepts/02-lucia-atelier.png",
    screenshotAlt:
      "Lucia Atelier salon design concept showing warm architectural arches, studio hours, and coral Book Now button",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/lucia",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "07",
    slug: "obsidian-noir",
    title: "Obsidian Noir",
    label: "Design concept",
    tier: "Standard",
    bookingApproach: "Portfolio-to-menu discovery",
    palette: "Obsidian Black · Porcelain · Warm Gold",
    suits:
      "Suits evening styling lounges, luxury barbers, and high-contrast beauty studios with strong portrait photography.",
    styleSummary:
      "Pairs dark obsidian framing with look plates that show the exact service price and link straight into the full menu or booking modal.",
    screenshot: "/assets/salon-concepts/07-obsidian-noir.png",
    screenshotAlt:
      "Obsidian Noir salon design concept with black and gold editorial layout showing featured haircut pricing and booking buttons",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/noir",
    featuredOnHome: true,
    verified: true,
  },
  {
    number: "11",
    slug: "zen-tokyo",
    title: "Zen Tokyo",
    label: "Design concept",
    tier: "Standard",
    bookingApproach: "Quiet treatment walkthrough",
    palette: "Warm Stone · Sumi Ink · Matcha Bronze",
    suits:
      "Suits head spas, massage therapy studios, and quiet wellness sanctuaries focused on unhurried rituals.",
    styleSummary:
      "Uses generous negative space and a calm vertical sequence to explain what each treatment includes before asking the guest to book.",
    screenshot: "/assets/salon-concepts/11-zen-tokyo.png",
    screenshotAlt:
      "Zen Tokyo salon design concept showing minimalist stone layout and hot-stone massage photography",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/tokyo",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "12",
    slug: "sol-terracotta",
    title: "Sol Terracotta",
    label: "Design concept",
    tier: "Standard",
    bookingApproach: "Studio atmosphere & promotions",
    palette: "Sunlit Sand · Clay Terracotta · Deep Olive",
    suits:
      "Suits warm boutique salons, curl specialists, and sun-lit beauty studios that highlight seasonal packages.",
    styleSummary:
      "Welcomes visitors with a warm visual tour of the studio interior before presenting the full treatment menu and seasonal offers.",
    screenshot: "/assets/salon-concepts/12-sol-terracotta.png",
    screenshotAlt:
      "Sol Terracotta salon design concept featuring warm clay terracotta accents, studio tour navigation, and Book an Appointment button",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/terracotta",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "13",
    slug: "aura-wellness",
    title: "Aura Wellness",
    label: "Design concept",
    tier: "Standard",
    bookingApproach: "Guided service finder",
    palette: "Lavender Mist · Deep Indigo · Soft Plum",
    suits:
      "Suits holistic spas, aromatherapy clinics, and multi-treatment beauty salons where visitors want help picking the right package.",
    styleSummary:
      "Opens by asking what the visitor wants to book today, matching their goal to recommended studio treatments, details, and booking links.",
    screenshot: "/assets/salon-concepts/13-aura-wellness.png",
    screenshotAlt:
      "Aura Wellness salon design concept asking What would you like to book today above spa oil treatment photography",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/aura",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "14",
    slug: "ivory-champagne",
    title: "Ivory Champagne",
    label: "Design concept",
    tier: "Starter",
    bookingApproach: "Location & hours first",
    palette: "Warm Ivory · Champagne · Espresso",
    suits:
      "Suits local neighborhood salons and walk-in friendly spas where nearby clients check street address, hours, and directions first.",
    styleSummary:
      "Displays street address, open days, directions, and direct booking above the fold in a bright ivory and champagne palette.",
    screenshot: "/assets/salon-concepts/14-ivory-champagne.png",
    screenshotAlt:
      "Ivory Champagne salon design concept showing bright salon mirror interior, Bellevue address bar, Get Directions, and Book an Appointment",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/",
    featuredOnHome: true,
    verified: true,
  },
  {
    number: "17",
    slug: "golden-white",
    title: "Golden White",
    label: "Design concept",
    tier: "Starter",
    bookingApproach: "Framed studio introduction",
    palette: "Pure White · Brushed Gold · Soft Cream",
    suits:
      "Suits bridal makeup artists, brow and lash studios, and boutique hair salons looking for an airy, classic presentation.",
    styleSummary:
      "Frames portrait photography around a centered studio welcome with immediate buttons for the service menu, directions, and booking.",
    screenshot: "/assets/salon-concepts/17-golden-white.png",
    screenshotAlt:
      "Golden White salon design concept with framed bridal and hair portraits around centered gold-accented typography",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/golden",
    featuredOnHome: false,
    verified: true,
  },
  {
    number: "18",
    slug: "clean-white-black",
    title: "Clean White Black",
    label: "Design concept",
    tier: "Starter",
    bookingApproach: "Fast menu scan",
    palette: "Pure White · Crisp Black · Neutral Gray",
    suits:
      "Suits modern nail bars, threading and waxing studios, and express salons where speed and price clarity come first.",
    styleSummary:
      "Leads with large, high-contrast service categories and starting prices right on the first screen, followed by a clean gallery and map.",
    screenshot: "/assets/salon-concepts/18-clean-white-black.png",
    screenshotAlt:
      "Clean White Black monochrome salon design concept listing large service categories with starting prices and Book an Appointment button",
    demoUrl: "https://salon-demo-coral-eta.vercel.app/concepts/monochrome",
    featuredOnHome: false,
    verified: true,
  },
];

export function getVerifiedSalonConcepts(): SalonConcept[] {
  return salonConcepts.filter((concept) => concept.verified);
}

export function getFeaturedSalonConcepts(): SalonConcept[] {
  return getVerifiedSalonConcepts()
    .filter((concept) => concept.featuredOnHome)
    .slice(0, 3);
}

export function getSalonConceptBySlug(
  slug: string | null | undefined
): SalonConcept | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return (
    getVerifiedSalonConcepts().find(
      (concept) => concept.slug === normalized
    ) ?? null
  );
}
