// ---------------------------------------------------------------------------
// Single source of truth for the whole site.
// Edit these arrays to customize — every component reads from here.
// ---------------------------------------------------------------------------

// Canonical production origin (with www — the preferred version). Every
// canonical URL, sitemap entry, and structured-data URL is derived from
// this so there is exactly one place to change it.
export const siteUrl = "https://www.janidudev.com";

export const profile = {
  name: "Janidu Dhakshitha Yapa",
  // Shorter public/professional form used in headings and metadata —
  // distinct from the full legal name above.
  publicName: "Janidu Yapa",
  firstName: "Janidu",
  title: "Full-Stack Software Engineer",
  // Roles cycled by the hero typing effect.
 roles: [
  "Full-Stack Engineer",
  "Spring Boot Backend Engineer",
  "React & TypeScript Developer",
  "DevOps Engineer",
  "API Architect",
],
  location: "Kandy, Sri Lanka",
  email: "hello@janidudev.com",
  // TODO: replace with your real profile URLs.
  socials: {
    github: "https://github.com/DevJanidu",
    linkedin: "https://www.linkedin.com/in/janidu-yapa-40217a332/",
  },
  resumeUrl: "/resume.pdf", // drop your PDF in /public
  intro:
    "I build full-stack web applications and REST APIs end to end — from PostgreSQL schemas and Spring Boot services to typed React front ends. I care about clean, scalable code and shipping features that people actually use.",
  availability: "Open to internships, freelance, and full-time roles",
  responseTime: "Usually replies within 24 hours",
  stats: [
    { value: "3+", label: "Shipped products" },
    { value: "6+", label: "Languages & frameworks" },
    { value: "100%", label: "Full-stack ownership" },
  ],
  funFact:
    "I like taking a project all the way — schema, API, UI, Docker, deploy — so nothing gets lost in the handoff.",
};

export const current = {
  role: "Software Engineer Intern",
  company: "Applantics (PVT) LTD",
  since: "Feb 2026",
  blurb:
    "Building full-stack features across Laravel, Spring Boot, and Flutter with a cross-functional team.",
};

// --- LinkedIn highlight -------------------------------------------------
export const linkedin = {
  headline:
    "I build ERP systems, POS software, and AI-powered web applications that help businesses automate, scale, and grow. Real estate agent websites, legal tech, LLMs, RAG, and AI agents — full-stack, end to end.",
  connections: "500+",
};

// --- Venture (LycoLabs) -----------------------------------------------------
export const venture = {
  role: "Founder",
  name: "LycoLabs",
  url: "https://www.lycolabs.com",
  tagline: "Empowering businesses with cutting-edge technology solutions.",
  blurb:
    "I founded LycoLabs — a software development and IT solutions studio that builds production-ready digital products, from concept through launch, for startups and growing businesses.",
  services: [
    "Ecommerce Websites",
    "AI Automation Apps",
    "Mobile Apps",
    "Desktop Apps",
    "Data Services",
    "Graphic Design",
  ],
};

// --- Skills -----------------------------------------------------------------
export type SkillGroup = { category: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Java", "C#", "Python", "PHP", "Dart"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Angular", "Flutter", "Tailwind CSS", "Vite"],
  },
  {
    category: "Backend",
    items: [
      "Spring Boot",
      "ASP.NET Core",
      "Laravel",
      "Node.js",
      "REST APIs",
      "GraphQL",
    ],
  },
  {
    category: "Data",
    items: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Redis", "SQLite"],
  },
  {
    category: "DevOps & Cloud",
    items: [
      "Docker",
      "GitHub Actions",
      "AWS",
      "Vercel",
      "Railway",
      "Supabase",
    ],
  },
  {
    category: "Security & Auth",
    items: ["JWT", "OAuth2", "Spring Security", "Clerk", "RBAC"],
  },
];

// --- Projects ---------------------------------------------------------------
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  outcome: string; // one-line user/business outcome
  description: string;
  tech: string[];
  github: string;
  demo: string;
  stars?: number;
  featured: boolean;
  accentTerminal: string; // shown in the card's mini terminal
  images?: string[]; // paths to project images
  caseStudy: {
    problem: string;
    context: string;
    constraints: string[];
    architecture: string[];
    highlights: string[];
    results: string[];
  };
};

export const projects: Project[] = [
  {
    slug: "havelock-law-firm",
    title: "Havelock Law Firm",
    tagline: "Modern legal practice management and client portal.",
    outcome:
      "A professional digital presence and secure client intake system for a law firm.",
    description:
      "Full-stack legal platform featuring a corporate website, secure client portal, and case inquiry system, built with an emphasis on professional aesthetics and data security.",
    tech: [
      "Next.js",
      "Tailwind CSS",
      "Spring Boot",
      "TypeScript",
      "PostgreSQL",
    ],
    github: "https://github.com/DevJanidu/Law-Firm-site",
    demo: "https://havelock.lycolabs.com/",
    stars: 12,
    featured: true,
    accentTerminal: "POST /api/inquiries → 201 Created",
    images: [
      "/assets/project-images/law-1.png",
      "/assets/project-images/law-2.png",
      "/assets/project-images/law-3.png",
      "/assets/project-images/law-4.png",
      "/assets/project-images/law-5.png"
    ],
    caseStudy: {
      problem:
        "The law firm lacked a modern online presence and was relying on manual phone calls and emails for initial client intakes, leading to inefficiencies.",
      context:
        "A corporate website merged with an initial case evaluation portal, aimed at projecting authority and streamlining new client onboarding.",
      constraints: [
        "Design needed to exude trust, professionalism, and high-end corporate identity.",
        "Data security and privacy for client inquiries were paramount.",
        "The platform required SEO optimization to attract local clientele.",
      ],
      architecture: [
        "Next.js + Tailwind CSS for a fast, SEO-optimized corporate front end.",
        "Spring Boot backend to securely process and store client inquiries.",
        "PostgreSQL database with strict data validation and security policies.",
      ],
      highlights: [
        "Sophisticated corporate UI with modern typography and layout.",
        "Secure client intake forms connected to a robust backend.",
        "Optimized for performance and search engine visibility.",
      ],
      results: [
        "Streamlined the initial client consultation process.",
        "Elevated the firm's brand image with a modern, high-performance website.",
      ],
    },
  },
  {
    slug: "salon-eclat",
    title: "Salon Eclat",
    tagline: "Premium beauty salon booking and management platform.",
    outcome:
      "Unified online booking and staff management for a high-end beauty salon.",
    description:
      "A sophisticated platform for a premium salon, allowing customers to book services, view style portfolios, and manage appointments, while enabling staff to manage schedules and clientele.",
    tech: [
      "Next.js",
      "Tailwind CSS",
      "Spring Boot",
      "TypeScript",
      "PostgreSQL",
    ],
    github: "https://github.com/DevJanidu/salon-eclat",
    demo: "https://eclat.lycolabs.com/",
    stars: 15,
    featured: true,
    accentTerminal: "GET /api/appointments → 200 OK",
    images: [
      "/assets/project-images/sal-1.png",
      "/assets/project-images/sal-2.png",
      "/assets/project-images/sal-3.png",
      "/assets/project-images/sal-4.png",
      "/assets/project-images/sal-5.png"
    ],
    caseStudy: {
      problem:
        "The salon relied on an outdated booking system that didn't reflect their premium brand, causing friction for customers and scheduling headaches for staff.",
      context:
        "Designed to offer a seamless, elegant booking experience for end-users and a powerful dashboard for salon administrators.",
      constraints: [
        "The aesthetic needed to match the salon's high-end, elegant branding.",
        "Booking process had to be intuitive and work flawlessly on mobile devices.",
        "Real-time availability synchronization to prevent double bookings.",
      ],
      architecture: [
        "Next.js and Tailwind CSS for a visually striking, responsive frontend.",
        "Spring Boot backend handling complex scheduling logic and user management.",
        "PostgreSQL for reliable relational data storage.",
      ],
      highlights: [
        "Elegant, user-focused booking flow with service and staff selection.",
        "Interactive style portfolio gallery.",
        "Admin dashboard for schedule and appointment management.",
      ],
      results: [
        "Significantly reduced booking friction and administrative overhead.",
        "Provided a digital experience that matches the premium nature of the physical salon.",
      ],
    },
  },
  {
    slug: "sf-nail-spa",
    title: "SF Nail Spa",
    tagline: "Modern booking & management platform for a USA nail salon.",
    outcome:
      "A complete digital storefront and booking system for a USA-based client.",
    description:
      "A full-stack salon management and online booking platform custom-built for a nail salon in the USA, featuring a beautiful UI and seamless scheduling.",
    tech: [
      "Next.js",
      "Tailwind CSS",
      "Spring Boot",
      "TypeScript",
      "PostgreSQL",
    ],
    github: "https://github.com/DevJanidu/SF-Nail-Spa",
    demo: "https://demo.lycolabs.com/",
    stars: 14,
    featured: true,
    accentTerminal: "POST /api/bookings → 201 Created",
    images: [
      "/assets/project-images/nailimg1.png",
      "/assets/project-images/nailimg2.png",
      "/assets/project-images/nailimg3.png"
    ],
    caseStudy: {
      problem:
        "The client needed a professional, high-performance online presence with an integrated booking system to modernize their USA nail salon.",
      context:
        "Designed to serve both the end customers looking to book appointments and the salon staff managing schedules.",
      constraints: [
        "The UI had to be visually stunning and perfectly responsive.",
        "The booking flow needed to be incredibly simple.",
        "High performance and SEO optimization were critical.",
      ],
      architecture: [
        "Next.js + Tailwind CSS for a blazing-fast, SEO-friendly storefront.",
        "Spring Boot backend to handle robust booking logic and data management.",
        "Secure REST API communication between the front and back ends.",
      ],
      highlights: [
        "Sleek, modern design tailored for a beauty and wellness brand.",
        "Integrated online booking system.",
        "Full-stack implementation separating UI concerns from business logic.",
      ],
      results: [
        "Delivered a production-ready application deployed on the LycoLabs demo server.",
        "Elevated the salon's digital presence to attract more clients.",
      ],
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

// --- Experience -------------------------------------------------------------
export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
  tech: string[];
};

export const experience: Experience[] = [
  {
    role: "Software Engineer Intern",
    company: "Applantics (PVT) LTD",
    period: "Feb 2026 — Present",
    description:
      "Contributing to full-stack application development across Laravel, Spring Boot, and Flutter. Implementing backend APIs and frontend features, working in Git-based team workflows, and supporting deployment and debugging across environments.",
    tech: ["Laravel", "Spring Boot", "Flutter", "Git"],
  },
  {
    role: "Backend Engineering Bootcamp",
    company: "StemLink, Sri Lanka",
    period: "Certification",
    description:
      "Java OOP & Spring Boot Backend Engineering Bootcamp — hands-on training in Java, OOP, Spring Boot, REST API development, PostgreSQL, authentication, and deployment.",
    tech: ["Java", "Spring Boot", "PostgreSQL", "REST APIs"],
  },
];

// --- Education --------------------------------------------------------------
export const education = [
  {
    program: "BEng (Hons) Software Engineering",
    school: "London Metropolitan University, UK",
  },
  {
    program: "Higher Diploma in Computing & Software Engineering",
    school: "Cardiff Metropolitan University, UK",
  },
];

// --- Open source (edit or wire to the GitHub API) ---------------------------
export const openSource = {
  githubUrl: "https://github.com/DevJanidu",
  // Manually synced from github.com/DevJanidu — update when it drifts.
  repoCount: 49,
  contributionsLastYear: 352,
  // Swap this for a live contribution-graph image or the GitHub API.
  graphImage: "https://ghchart.rshah.org/EB5E28/DevJanidu",
  contributions: [
    {
      repo: "Law-Firm-site",
      note: "Secure client intake forms and Spring Boot backend for law firm management.",
    },
    {
      repo: "salon-eclat",
      note: "Elegant Next.js booking platform and API for a premium beauty salon.",
    },
    {
      repo: "SF-Nail-Spa",
      note: "Next.js and Spring Boot application for a USA nail salon.",
    },
  ],
};

// --- Writing (optional) -----------------------------------------------------
export const posts = [
  {
    title: "Caching hot reads with Redis in a Spring Boot API",
    excerpt:
      "How a small caching layer took repeated availability lookups from noticeable to instant.",
    date: "2026-03-10",
    readTime: "6 min",
    url: "#",
  },
  {
    title: "Designing a multi-step booking flow that people finish",
    excerpt:
      "Notes on reducing drop-off in booking UX across two different products.",
    date: "2026-02-02",
    readTime: "5 min",
    url: "#",
  },
  {
    title: "Role-based access control without the tangle",
    excerpt:
      "Keeping student, mentor, and admin flows isolated with Clerk and clean boundaries.",
    date: "2026-01-18",
    readTime: "7 min",
    url: "#",
  },
];

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#venture", label: "LycoLabs" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#open-source", label: "Open Source" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];
