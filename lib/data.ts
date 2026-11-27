// ---------------------------------------------------------------------------
// Single source of truth for site copy, projects, process, and payment rules.
// ---------------------------------------------------------------------------

export const siteUrl = "https://www.janidudev.com";

export const profile = {
  name: "Janidu Dhakshitha Yapa",
  publicName: "Janidu Dev",
  firstName: "Janidu",
  title: "Freelance Web Designer & Developer for Small Businesses",
  location: "Kandy, Sri Lanka",
  clientMarkets:
    "Based in Kandy, Sri Lanka. Working with small business owners in the US, UK, Australia, Sri Lanka, and worldwide.",
  email: "hello@janidudev.com",
  whatsapp: "+94 72 625 4163",
  whatsappHref: "https://wa.me/94726254163",
  socials: {
    linkedin: "https://www.linkedin.com/in/janidu-yapa-40217a332/",
  },
  responseTime: "Usually replies within 1 business day",
  aboutParagraph:
    "I'm Janidu Dev, an independent web designer and developer based in Kandy, Sri Lanka, building custom websites for small businesses across the US, UK, Australia, Sri Lanka, and beyond. Because you work directly with me from first draft to launch, your layout, service menu, online booking flow, and mobile speed are handled by one person without agency handoffs.",
  experienceLine:
    "BEng (Hons) Software Engineering graduate from London Metropolitan University with commercial experience building online booking platforms, client intake portals, and custom business software.",
};

export const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#process", label: "Process" },
  { href: "/reviews", label: "Reviews" },
  { href: "/#about", label: "About" },
];

export const heroContent = {
  headline: "I design and build websites for small businesses.",
  subheadline:
    "Custom websites with clear service menus, online booking, and structured inquiries for salons, spas, and professional service firms.",
  primaryAction: {
    label: "View projects",
    href: "#live-showcase",
  },
  secondaryAction: {
    label: "Start a project",
    href: "#contact",
  },
};

// --- Projects ---------------------------------------------------------------
export type ProjectLinkType = "live" | "demo";

export type ProjectScreen = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  cardLead: string;
  cardCapabilities: string[];
  description: string;
  cardImage: string;
  cardImageAlt: string;
  images: string[];
  screens: ProjectScreen[];
  externalUrl: string;
  externalLinkType: ProjectLinkType;
  featured: boolean;
  featuredLayout: "wide" | "compact";
  supportsLiveEmbed?: boolean;
  caseStudy: {
    brief: string;
    whatIBuilt: string[];
    verifiedOutcomes: string[];
  };
};

export function getExternalProjectLabel(type: ProjectLinkType): string {
  return type === "live" ? "Live site" : "Open demo";
}

export const projects: Project[] = [
  // --- Featured Salon Builds from salon-demo-coral-eta.vercel.app/concepts ---
  {
    slug: "milan-marble",
    title: "Milan Marble",
    category: "Salon website · Fashion editorial",
    tagline:
      "Full-bleed editorial lookbook connecting signature salon looks directly to services and online booking.",
    cardLead:
      "Built for upscale hair salons and color specialists where clients browse signature looks, inspect treatment details, and book an appointment from any section.",
    cardCapabilities: [
      "Editorial lookbook linked directly to matching salon treatments",
      "Dedicated service menu, gallery, and client inquiry workflow",
      "Interactive appointment booking and WhatsApp consultation access",
    ],
    description:
      "A multi-page salon design built around high-impact photography and effortless navigation from visual inspiration to the service menu and booking.",
    cardImage: "/assets/salon-concepts/01-milan-marble.png",
    cardImageAlt:
      "Milan Marble salon website showing editorial hair cover, service menu, and Book an Appointment button",
    images: ["/assets/salon-concepts/01-milan-marble.png"],
    screens: [
      {
        src: "/assets/salon-concepts/01-milan-marble.png",
        alt: "Milan Marble homepage cover with editorial lookbook navigation, service menu, and Book an Appointment button",
        title: "Editorial cover and direct booking",
        caption:
          "Pairs full-bleed salon photography with a clean navigation bar for Lookbook, Service Menu, Enquire, Visit, and Book an Appointment.",
      },
    ],
    externalUrl: "https://salon-demo-coral-eta.vercel.app/concepts/marble",
    externalLinkType: "demo",
    featured: true,
    featuredLayout: "wide",
    supportsLiveEmbed: true,
    caseStudy: {
      brief:
        "High-end hair salons and bridal studios rely on visual craft. Milan Marble was built so prospective clients can browse finished looks like a magazine editorial and jump straight to the matching service or appointment booking form.",
      whatIBuilt: [
        "A full-bleed editorial hero with clean top navigation covering Lookbook, Service Menu, Enquire, and Visit.",
        "Direct pathways from featured hair and beauty looks into detailed service descriptions and booking actions.",
        "Multi-page salon architecture supporting easy updates to services, promotions, and incoming inquiries.",
      ],
      verifiedOutcomes: [
        "Live interactive preview published at salon-demo-coral-eta.vercel.app/concepts/marble.",
        "Ready to customize with any salon's brand photography, service menu, and booking system.",
      ],
    },
  },
  {
    slug: "lucia-atelier",
    title: "Lucia Atelier",
    category: "Salon website · Results-led atelier",
    tagline:
      "Guides visitors from client transformation stories and skin or hair concerns straight to the right service and booking.",
    cardLead:
      "Organizes the site around client concerns, expert profiles, and real transformation stories so visitors find the right treatment and book with confidence.",
    cardCapabilities: [
      "Concern-based browsing alongside Services, Experts, Stories, and Results",
      "Prominent studio address, hours, WhatsApp, and Book Now action",
    ],
    description:
      "A warm-cream atelier layout built for salons, skin clinics, and corrective color studios where trust, specialist expertise, and visible results drive bookings.",
    cardImage: "/assets/salon-concepts/02-lucia-atelier.png",
    cardImageAlt:
      "Lucia Atelier salon website showing warm architectural arches, studio hours, and coral Book Now button",
    images: ["/assets/salon-concepts/02-lucia-atelier.png"],
    screens: [
      {
        src: "/assets/salon-concepts/02-lucia-atelier.png",
        alt: "Lucia Atelier homepage with Services, Concerns, Experts, Stories, Results navigation and studio hours",
        title: "Atelier welcome and concern-led navigation",
        caption:
          "Highlights the studio atmosphere, open hours, and direct booking while giving visitors clear tabs for Concerns, Experts, Stories, and Results.",
      },
    ],
    externalUrl: "https://salon-demo-coral-eta.vercel.app/concepts/lucia",
    externalLinkType: "demo",
    featured: true,
    featuredLayout: "compact",
    supportsLiveEmbed: true,
    caseStudy: {
      brief:
        "Many salon and spa guests know the outcome they want before they know the technical treatment name. Lucia Atelier was designed to guide visitors from concerns and client stories directly to the matching service and specialist consultation.",
      whatIBuilt: [
        "Dedicated navigation paths for Services, Concerns, Experts, Stories, Results, Enquire, and Visit.",
        "Warm architectural presentation with studio location, opening hours, WhatsApp access, and a prominent Book Now action.",
        "Multi-page structure built for easy updates to testimonials and incoming client inquiries.",
      ],
      verifiedOutcomes: [
        "Live interactive preview published at salon-demo-coral-eta.vercel.app/concepts/lucia and embedded live on the homepage.",
        "Demonstrates concern-led discovery and direct consultation booking on desktop and mobile.",
      ],
    },
  },
  {
    slug: "swiss-classic",
    title: "Swiss Classic",
    category: "Salon website · Service directory",
    tagline:
      "Structured typographic service index putting upfront services, details, and per-service Book buttons in the first screen.",
    cardLead:
      "Lets decisive clients scan Haircuts, Scalp Treatments, Hair Coloring, and Facials right away and click Details or Book on any row.",
    cardCapabilities: [
      "Upfront service index table right on the first screen",
      "Direct Details and Book buttons for every treatment category",
    ],
    description:
      "A high-contrast service directory built for busy salons and clinics whose clients want concise treatment notes and zero-friction booking.",
    cardImage: "/assets/salon-concepts/03-swiss-classic.png",
    cardImageAlt:
      "Swiss Classic salon website showing a structured service index and Book buttons",
    images: ["/assets/salon-concepts/03-swiss-classic.png"],
    screens: [
      {
        src: "/assets/salon-concepts/03-swiss-classic.png",
        alt: "Swiss Classic service directory showing Haircuts, Scalp Treatments, Hair Coloring, and Facial Treatments with Book buttons",
        title: "First-screen service index and instant booking",
        caption:
          "Lists every core treatment category with concise descriptions and direct Details and Book actions above the fold.",
      },
    ],
    externalUrl: "https://salon-demo-coral-eta.vercel.app/concepts/classic",
    externalLinkType: "demo",
    featured: true,
    featuredLayout: "compact",
    supportsLiveEmbed: true,
    caseStudy: {
      brief:
        "Decisive clients often leave salon sites when services are buried behind multiple clicks. Swiss Classic puts a clean, scannable service index right at the top of the page so visitors can inspect options and book in seconds.",
      whatIBuilt: [
        "A hairline-grid service directory listing categories, plain-English descriptions, and per-row Details and Book buttons.",
        "Header bar keeping studio address, opening hours, Specifications, Gallery, and Enquire immediately accessible.",
        "Multi-page structure supporting full service and inquiry management.",
      ],
      verifiedOutcomes: [
        "Live interactive preview published at salon-demo-coral-eta.vercel.app/concepts/classic.",
        "Built for fast scanning and immediate appointment conversion on both desktop and mobile.",
      ],
    },
  },

  // --- Preserved legacy public case study routes (non-featured on homepage) ---
  {
    slug: "sf-nail-spa",
    title: "SF Nail Spa",
    category: "Nail salon · San Francisco concept",
    tagline:
      "Service menu, studio hours, and online appointment booking for a neighborhood nail salon.",
    cardLead:
      "Customers can browse manicure, pedicure, and gel nail treatments, check daily hours and wheelchair accessibility, and book an appointment from their phone.",
    cardCapabilities: [
      "Visual service menu with clear category notes",
      "Direct online appointment booking from every page",
      "Click-to-call phone link, studio hours, and inquiry form",
    ],
    description:
      "Designed and built for a San Francisco nail salon concept focused on non-toxic nail care. The site pairs a calm, warm visual style with fast access to treatments, studio hours, and online booking.",
    cardImage: "/assets/project-images/nailimg2.png",
    cardImageAlt:
      "SF Nail Spa services section showing organic manicure, pedicure, and gel nails cards with a Book Appointment button",
    images: [
      "/assets/project-images/nailimg1.png",
      "/assets/project-images/nailimg2.png",
      "/assets/project-images/nailimg3.png",
    ],
    screens: [
      {
        src: "/assets/project-images/nailimg1.png",
        alt: "SF Nail Spa homepage hero with Book Appointment button, Explore Services link, and today's phone number",
        title: "Homepage and quick booking",
        caption:
          "Introduces the studio's organic positioning while keeping the phone number, open status, and Book Appointment action visible without scrolling.",
      },
      {
        src: "/assets/project-images/nailimg2.png",
        alt: "SF Nail Spa service menu cards for Manicure, Pedicure, and Gel Nails",
        title: "Visual service menu",
        caption:
          "Explains what is included in each manicure, pedicure, and gel treatment, including clear expectations on extensions and hard gel.",
      },
      {
        src: "/assets/project-images/nailimg3.png",
        alt: "SF Nail Spa contact page showing San Francisco address, accessibility details, opening hours, and message form",
        title: "Location, hours, and direct contact",
        caption:
          "Gives first-time visitors the street address, step-free access note, Tuesday-through-Saturday hours, click-to-call button, and a short question form.",
      },
    ],
    externalUrl: "https://demo.lycolabs.com/",
    externalLinkType: "demo",
    featured: false,
    featuredLayout: "compact",
    caseStudy: {
      brief:
        "Neighborhood nail salons often lose bookings when mobile visitors have to pinch-zoom PDF price lists or call during busy floor hours. This project was designed as a clean storefront for a San Francisco nail studio that needed its treatment list, studio policies, hours, and appointment booking accessible in a couple of taps.",
      whatIBuilt: [
        "A warm, high-contrast homepage with immediate paths to book an appointment, explore the service menu, or tap to call the front desk.",
        "Structured treatment cards for manicures, pedicures, and gel nails that set clear expectations before a client books.",
        "A dedicated visit and contact section displaying street address, wheelchair-accessibility notes, daily hours, and a direct inquiry form.",
      ],
      verifiedOutcomes: [
        "Interactive demo deployed and live at demo.lycolabs.com for client walkthroughs.",
        "Covers the full visitor journey from service discovery to appointment request and front-desk inquiries.",
      ],
    },
  },
  {
    slug: "salon-eclat",
    title: "Salon Eclat",
    category: "Hair & beauty salon · Multi-step booking",
    tagline:
      "Searchable 27-service menu and guided online booking across branches and stylists.",
    cardLead:
      "Clients filter 27 hair, beauty, and spa treatments with upfront durations and prices, pick a stylist or any available chair, and see their total before confirming.",
    cardCapabilities: [
      "Searchable service menu with category filters and prices",
      "5-step booking flow for branch, services, stylist, and time",
    ],
    description:
      "A full-service hair and beauty salon website built around self-serve appointment scheduling. Visitors can search treatments by category, combine multiple services into one visit, choose a preferred specialist, and submit their booking details.",
    cardImage: "/assets/project-images/sal-3.png",
    cardImageAlt:
      "Salon Eclat multi-step online booking screen showing branch, service selection, durations, and prices",
    images: [
      "/assets/project-images/sal-1.png",
      "/assets/project-images/sal-2.png",
      "/assets/project-images/sal-3.png",
      "/assets/project-images/sal-4.png",
      "/assets/project-images/sal-5.png",
    ],
    screens: [
      {
        src: "/assets/project-images/sal-1.png",
        alt: "Salon Eclat homepage hero with Book Appointment and Explore Services actions",
        title: "Salon homepage",
        caption:
          "Sets a refined editorial tone for hair, skin, and makeup services while leading directly into booking or the treatment list.",
      },
      {
        src: "/assets/project-images/sal-2.png",
        alt: "Salon Eclat service menu with search bar, category filter pills, durations, and prices",
        title: "Searchable service menu",
        caption:
          "Organizes 27 treatments across hair, beauty, herbal spa, massage, nails, makeup, waxing, and threading with clear durations and prices.",
      },
      {
        src: "/assets/project-images/sal-3.png",
        alt: "Salon Eclat booking step two allowing customers to select multiple services",
        title: "Multi-service selection step",
        caption:
          "Lets clients search and combine multiple treatments in a single appointment instead of submitting separate requests.",
      },
      {
        src: "/assets/project-images/sal-4.png",
        alt: "Salon Eclat stylist picker with Any Available Stylist option and specialist profiles",
        title: "Optional stylist selection",
        caption:
          "Gives returning clients the choice to pick a specific colorist or stylist, while new clients can select Any Available Stylist to book faster.",
      },
      {
        src: "/assets/project-images/sal-5.png",
        alt: "Salon Eclat final booking details showing summary of branch, chosen services, date, time, and estimated total",
        title: "Booking summary and client confirmation",
        caption:
          "Displays the selected branch, combined services, date and time, and estimated total right above the client contact fields.",
      },
    ],
    externalUrl: "https://eclat.lycolabs.com/",
    externalLinkType: "demo",
    featured: false,
    featuredLayout: "compact",
    caseStudy: {
      brief:
        "Full-service salons with large menus and multiple stylists need more than a basic contact form. Salon Eclat needed an online booking flow capable of handling multiple locations, dozens of categorized treatments with different durations, optional stylist preferences, and clear price estimates.",
      whatIBuilt: [
        "A searchable, category-filtered service menu displaying treatment descriptions, appointment lengths, and prices upfront.",
        "A 5-step online booking flow covering branch choice, multi-service selection, optional stylist selection, date and time, and contact details.",
        "An Any Available Stylist shortcut and live estimated total summary before confirmation.",
      ],
      verifiedOutcomes: [
        "Interactive multi-step booking demo deployed at eclat.lycolabs.com.",
        "Supports multi-service cart selection, role-filtered stylist browsing, and branch-aware scheduling.",
      ],
    },
  },
  {
    slug: "havelock-law-firm",
    title: "Havelock Law Firm",
    category: "Professional services · Legal practice",
    tagline:
      "Practice area guide, attorney directory, and consultation intake for a multi-practice law firm.",
    cardLead:
      "Prospective clients can review practice areas, choose an available attorney by specialty, read matter-specific client reviews, or send a confidential case inquiry.",
    cardCapabilities: [
      "Attorney profiles with live availability and specialties",
      "Consultation booking modal and practice-area intake form",
    ],
    description:
      "Built for a legal practice handling corporate, family, property, litigation, employment, and immigration work. The site replaces back-and-forth phone screening with structured consultation booking and matter-specific inquiries.",
    cardImage: "/assets/project-images/law-1.png",
    cardImageAlt:
      "Havelock and Grey law firm homepage with Book a call, Start a chat, and Send your case actions",
    images: [
      "/assets/project-images/law-1.png",
      "/assets/project-images/law-2.png",
      "/assets/project-images/law-3.png",
      "/assets/project-images/law-4.png",
      "/assets/project-images/law-5.png",
    ],
    screens: [
      {
        src: "/assets/project-images/law-1.png",
        alt: "Havelock and Grey law firm homepage stating practice areas and clear fee policy with three consultation actions",
        title: "Homepage and clear intake options",
        caption:
          "States the firm's six core practice areas in plain language and gives visitors three clear ways to begin: book a call, start a chat, or send case details.",
      },
      {
        src: "/assets/project-images/law-2.png",
        alt: "Attorney directory cards showing partners and associates alongside a guided intake assistant",
        title: "Attorney profiles and guided intake assistant",
        caption:
          "Introduces partners and associates by practice area alongside an optional general-information assistant that routes visitors to the right department.",
      },
      {
        src: "/assets/project-images/law-4.png",
        alt: "Choose your attorney booking dialog listing available corporate and commercial lawyers",
        title: "Attorney selection modal",
        caption:
          "Matches prospective clients with available attorneys practicing in their selected area of law before choosing a consultation slot.",
      },
      {
        src: "/assets/project-images/law-3.png",
        alt: "Reviews page filtered by Corporate, Family, Property, Litigation, Employment, and Immigration matters",
        title: "Reviews filtered by practice area",
        caption:
          "Lets prospective clients read feedback relevant to their exact legal matter, from shareholder agreements to property purchases.",
      },
      {
        src: "/assets/project-images/law-5.png",
        alt: "Law firm contact page with chambers address, hours, matter-type dropdown, and conflict-check notice",
        title: "Structured case inquiry form",
        caption:
          "Collects contact details and matter type upfront while displaying a clear confidentiality and conflict-check notice below the submit button.",
      },
    ],
    externalUrl: "https://havelock.lycolabs.com/",
    externalLinkType: "demo",
    featured: false,
    featuredLayout: "compact",
    caseStudy: {
      brief:
        "Professional service firms rely on trust and clarity before a client ever picks up the phone. Havelock Law Firm needed a site that explained its six practice areas in plain English, introduced its attorneys, and routed new inquiries to the right legal team.",
      whatIBuilt: [
        "A clear, authoritative homepage highlighting practice areas, transparent fee expectations, and direct consultation actions.",
        "An attorney directory and consultation selector that filters available lawyers by practice area.",
        "A structured case inquiry form with matter-type routing and a pre-conflict-check disclaimer.",
      ],
      verifiedOutcomes: [
        "Full interactive demo live at havelock.lycolabs.com.",
        "Demonstrates structured intake, attorney matching, and trust signals for professional service firms.",
      ],
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

// --- Process, Costs & Payment Terms -----------------------------------------
export const processSteps = [
  {
    number: "01",
    title: "Share your project",
    body: "Share your project. I send a written proposal with the scope, price, and timeline.",
  },
  {
    number: "02",
    title: "50% deposit to start",
    body: "Pay a 50% deposit after approving the proposal. Development begins after the deposit is received.",
  },
  {
    number: "03",
    title: "Private preview & revisions",
    body: "Review a private preview and request the revisions included in the proposal.",
  },
  {
    number: "04",
    title: "Final approval & launch",
    body: "Approve the final site and pay the remaining 50% before launch. I then publish the site and hand over access.",
  },
];

export const costExpectations = {
  heading: "What a project involves and how pricing works",
  summary:
    "Every build is quoted at a fixed project price based on what your customers need to do on the site, so you know the exact total before paying a deposit.",
  tiers: [
    {
      name: "Brochure & service menu site",
      timeline: "1 to 3 weeks",
      summary:
        "Custom mobile-first pages for your services and prices, team profiles, gallery, opening hours, map, WhatsApp/call links, and inquiry form.",
    },
    {
      name: "Website + online booking & dashboard",
      timeline: "3 to 6 weeks",
      summary:
        "Everything in a brochure site plus custom online booking or client intake, automated email confirmations, and an admin dashboard to manage services, staff availability, and appointments.",
    },
    {
      name: "Multi-branch or operations system",
      timeline: "Scoped to workflow",
      summary:
        "Custom scheduling, digital billing, customer records, inventory, and staff reporting tailored around how your locations operate.",
    },
  ],
  ownershipNote:
    "Domain registration, hosting, and any third-party SMS or API usage stay in your own accounts or are itemized transparently in your proposal.",
};

export const paymentConfig = {
  headline: "Payment options are confirmed in your proposal.",
  details:
    "Payment instructions, currency details, and milestone dates are tied directly to your written proposal so everything is documented in one place.",
  paypal: {
    commercialPaymentsVerified: false,
    invoicesVerified: false,
    guestCardVerified: false,
    checkoutVerified: false,
  },
};

export function getVerifiedPaymentNotes(): string[] {
  const notes: string[] = [paymentConfig.details];

  if (paymentConfig.paypal.commercialPaymentsVerified) {
    const capabilities: string[] = [];
    if (paymentConfig.paypal.invoicesVerified)
      capabilities.push("PayPal invoices");
    if (paymentConfig.paypal.guestCardVerified)
      capabilities.push("guest card payments");
    if (paymentConfig.paypal.checkoutVerified)
      capabilities.push("PayPal Checkout");

    if (capabilities.length > 0) {
      notes.push(
        `PayPal is available for eligible international payments (${capabilities.join(", ")}), as confirmed in your proposal.`
      );
    } else {
      notes.push(
        "PayPal is available as an option for eligible international payments when confirmed in your proposal."
      );
    }
  }

  return notes;
}
