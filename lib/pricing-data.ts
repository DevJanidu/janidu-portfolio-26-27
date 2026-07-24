// ---------------------------------------------------------------------------
// Content for /pricing — Business Website & Cloud Management Packages.
// Sourced from generic-business-pricing-page.md. Edit here; the page and
// its section components just render this data.
// ---------------------------------------------------------------------------

const WEB_LITE_PRICE = "LKR 69,000 — One-Time Payment";
const WEB_PRO_PRICE = "LKR 89,000 — One-Time Payment";
const CLOUD_ERP_PRICE = "LKR 150,000 — One-Time Payment";

export const pricingHero = {
  eyebrow: "./pricing --packages",
  title: "Business Website & Cloud Management Packages",
  intro:
    "Professional digital solutions for service businesses, retailers, professionals, organizations, and growing companies in any industry. Whether you run a salon, gym, clinic, restaurant, hotel, law firm, construction company, educational institute, real-estate business, retail shop, consultancy, logistics company, or another type of organization, the right solution is customized around how your business works.",
};

export const overview: {
  name: string;
  bestFor: string;
  purpose: string;
  price: string;
}[] = [
  {
    name: "Web Lite",
    bestFor: "Businesses that need a professional online presence",
    purpose: "Present your business, services, work, and contact details",
    price: WEB_LITE_PRICE,
  },
  {
    name: "Web Pro",
    bestFor:
      "Businesses that need online bookings, inquiries, registrations, or customer management",
    purpose:
      "Generate leads and manage customer interactions through a dashboard",
    price: WEB_PRO_PRICE,
  },
  {
    name: "Cloud ERP",
    bestFor: "Businesses that need to manage daily operations in one system",
    purpose:
      "Manage customers, sales, staff, inventory, finances, reports, and workflows",
    price: CLOUD_ERP_PRICE,
  },
];

export const overviewNote =
  "Prices are one-time payments for the standard package. Additional pages, features, workflows, integrations, languages, content, and customization may be quoted separately.";

// --- Web Lite ---------------------------------------------------------------
export const webLite = {
  name: "Web Lite",
  tagline: "Build Trust and Help Customers Find You Online",
  bestFor:
    "Best for businesses that need a simple, clean, fast, and professional website.",
  description:
    "Web Lite gives your business a credible online presence where potential customers can understand what you offer, view your work, and contact you easily.",
  suitableFor: [
    "Salons, spas, barbers, and beauty professionals",
    "Gyms, trainers, coaches, and wellness businesses",
    "Lawyers, consultants, accountants, and professional services",
    "Restaurants, cafés, bakers, and catering businesses",
    "Clinics, therapists, and healthcare service providers",
    "Construction companies, engineers, architects, and interior designers",
    "Photographers, videographers, event planners, and creatives",
    "Tuition teachers, training institutes, and educational services",
    "Real-estate agents, property businesses, and accommodation providers",
    "Retailers, repair services, home services, and local businesses",
    "Freelancers, personal brands, and small organizations",
  ],
  includedPages: [
    "Home",
    "About",
    "Services, Products, Packages, or Solutions",
    "Portfolio, Projects, Menu, Classes, Listings, or Gallery",
    "Team, Staff, Trainers, Agents, or Professionals",
    "Contact",
  ],
  includedPagesNote: "The final page structure will be adjusted to match your business.",
  includedFeatures: [
    "Modern and professional website design",
    "Design customized to your brand and industry",
    "Mobile, tablet, laptop, and desktop responsive layout",
    "Business information display",
    "Services, products, packages, or solutions showcase",
    "Pricing display where applicable",
    "Team or staff profiles",
    "Portfolio, project, menu, property, class, or image gallery",
    "Business opening hours",
    "Contact details",
    "Contact or inquiry form",
    "Google Maps integration",
    "WhatsApp contact button",
    "Click-to-call button",
    "Email contact option",
    "Social media links",
    "Basic search-engine optimization",
    "Basic website speed optimization",
    "SSL security setup",
    "Domain connection",
    "Website deployment",
    "Basic handover and guidance",
  ],
  whatCustomersCanDo: [
    "Learn about your business",
    "View your services, products, packages, projects, or work",
    "Check your contact details and opening hours",
    "Find your location",
    "Contact you through WhatsApp, phone, email, or an inquiry form",
    "Visit your social media pages",
  ],
  importantInfo: [
    "Web Lite does not include an admin dashboard.",
    "Web Lite does not include online booking, customer management, or automated notifications.",
    "Website content updates can be requested from our team.",
    "A content-management dashboard can be added separately when required.",
  ],
  startingPrice: WEB_LITE_PRICE,
  cta: "Get My Business Online",
};

// --- Web Pro ------------------------------------------------------------
export const webPro = {
  name: "Web Pro",
  tagline: "Turn Your Website into a Customer-Generating System",
  bestFor:
    "Best for businesses that need a professional website, online customer actions, automated email confirmations, and a secure dashboard.",
  description:
    "Web Pro is suitable when customers need to do more than read about your business. They can book appointments, request quotations, reserve services, submit applications, register for classes, inquire about products, or send structured requests.",
  suitableFor: [
    "Appointment-based businesses",
    "Salons, spas, clinics, and consultants",
    "Gyms, trainers, classes, and membership businesses",
    "Hotels, villas, restaurants, and reservation-based businesses",
    "Lawyers, accountants, engineers, and professional service providers",
    "Property agents and real-estate businesses",
    "Construction, repair, and quotation-based businesses",
    "Tuition teachers, institutes, and course providers",
    "Photographers, event planners, and service providers",
    "Rental, delivery, and booking-based businesses",
    "Any business that needs to manage customer requests online",
  ],
  onlineActions: [
    "Appointment booking",
    "Reservation requests",
    "Consultation requests",
    "Class or course registration",
    "Membership inquiries",
    "Quotation requests",
    "Property inquiries",
    "Product or service inquiries",
    "Event or service booking",
    "Application or request forms",
    "Other custom customer workflows",
  ],
  onlineActionsNote: "The workflow will be customized to match your business.",
  bookingFeatures: [
    "Service, package, product, class, or option selection",
    "Staff, trainer, agent, branch, or resource selection where applicable",
    "Preferred date and time selection",
    "Customer information collection",
    "Customer notes and special requests",
    "Available time-slot configuration",
    "Staff or resource availability management",
    "Submission confirmation",
    "Booking or request status management",
    "Mobile-friendly customer experience",
  ],
  emailNotifications: [
    "New booking or inquiry email notifications",
    "Customer confirmation emails",
    "Status update emails",
    "Cancellation notifications",
    "Contact-form email notifications",
    "Internal business notifications",
    "Custom email templates based on the workflow",
  ],
  dashboardFeatures: [
    "Secure admin login",
    "Dashboard overview",
    "Booking, inquiry, reservation, or registration management",
    "Calendar view where applicable",
    "Customer database",
    "Customer inquiry management",
    "Service, package, class, listing, or product management",
    "Pricing management",
    "Staff, trainer, agent, or team management",
    "Staff or resource availability management",
    "Business information management",
    "Opening-hours management",
    "Contact-details management",
    "Gallery or portfolio management",
    "Website content management",
    "Social-media-link management",
    "Basic user roles and permissions",
    "Basic reports",
    "Search, filtering, and status controls",
  ],
  whatBusinessCanManage: [
    "Appointments",
    "Reservations",
    "Customer inquiries",
    "Leads",
    "Registrations",
    "Consultations",
    "Quotations",
    "Classes",
    "Services",
    "Staff",
    "Listings",
    "Packages",
    "Website content",
    "Customer information",
  ],
  aiFeatures: [
    "Real AI customer-support chatbot",
    "Instant answers about services, products, prices, packages, and business information",
    "Answers about opening hours, locations, policies, and availability",
    "AI assistance with customer inquiries",
    "AI booking or service-selection assistance",
    "Mobile-friendly chatbot experience",
    "AI knowledge base trained using approved business information",
  ],
  aiNote:
    "AI platform usage, API charges, advanced training, and third-party service fees may be quoted separately.",
  startingPrice: WEB_PRO_PRICE,
  cta: "Request a Demo",
};

// --- Cloud ERP ----------------------------------------------------------
export const cloudERP = {
  name: "Cloud ERP",
  tagline: "Manage Your Entire Business from One Cloud-Based System",
  bestFor:
    "Best for businesses that need a complete management system customized around their daily operations.",
  description:
    "Cloud ERP is not a one-size-fits-all application. The system is designed according to your business type, departments, branches, staff roles, workflows, reports, and operational requirements. It can be customized for salons, gyms, healthcare businesses, construction companies, retail businesses, wholesalers, professional services, education providers, hotels, restaurants, rental businesses, logistics companies, property businesses, and many other industries.",
  modules: [
    {
      title: "Core Dashboard",
      items: [
        "Daily revenue overview",
        "Sales, booking, order, project, or activity summary",
        "Customer or member summary",
        "Staff performance",
        "Inventory alerts",
        "Expense overview",
        "Profit summary",
        "Business insights",
        "Recent activity",
        "Custom key performance indicators",
      ],
    },
    {
      title: "Customer, Client, Member, or Lead Management",
      items: [
        "Customer profiles",
        "Contact information",
        "Visit, service, purchase, booking, or project history",
        "Customer notes",
        "Preferences",
        "Documents and attachments where applicable",
        "Loyalty information",
        "Membership or subscription information",
        "Lead and follow-up tracking",
        "Customer search and filters",
        "Customer status management",
        "Communication history",
      ],
    },
    {
      title: "Bookings, Orders, Projects, or Workflow Management",
      items: [
        "Appointment management",
        "Reservation management",
        "Order management",
        "Project management",
        "Job or service-request management",
        "Membership management",
        "Student or class management",
        "Property inquiry management",
        "Case or client matter management",
        "Delivery or rental management",
        "Custom approval workflows",
        "Daily, weekly, and monthly views",
        "Status tracking",
        "Staff or resource assignment",
        "Recurring activities",
        "Notes, files, and activity history",
        "Confirmations and reminders",
      ],
      note: "The operational workflow will be selected based on your industry.",
    },
    {
      title: "Sales, POS, Billing, and Invoicing",
      items: [
        "Fast checkout",
        "Service billing",
        "Product billing",
        "Package or membership billing",
        "Combined invoices",
        "Barcode support",
        "Cash, card, bank-transfer, and digital payment recording",
        "Multiple payment methods",
        "Discounts",
        "Tax calculations where applicable",
        "Invoice generation, printable invoices",
        "Email and WhatsApp invoice sharing",
        "Receipts and payment history",
        "Outstanding payment tracking",
        "Refunds where required",
        "Daily sales summaries",
      ],
      note: "Modules can be included where relevant.",
    },
    {
      title: "Products, Materials, and Inventory",
      items: [
        "Product, item, or material management",
        "Categories and images",
        "Cost price and selling price",
        "Barcode generation and management",
        "Current stock levels and stock adjustments",
        "Low-stock alerts",
        "Stock movement history",
        "Damaged or lost stock records",
        "Inventory reports",
        "Warehouse, store, or branch stock",
        "Stock transfers where required",
      ],
    },
    {
      title: "Purchase Orders and Suppliers",
      items: [
        "Supplier management and contact details",
        "Purchase-order creation, approval, and status tracking",
        "Item and quantity management",
        "Purchase-cost recording",
        "Delivery tracking and goods receipt",
        "Automatic stock updates",
        "Purchase history and supplier reports",
        "Supplier payment tracking",
      ],
    },
    {
      title: "Services, Products, Packages, or Plans",
      items: [
        "Categories, names, and descriptions",
        "Prices, duration, or validity",
        "Staff or department assignments",
        "Packages and bundles",
        "Membership or subscription plans",
        "Combo offers and custom pricing",
        "Active and inactive records",
      ],
    },
    {
      title: "Staff and Workforce Management",
      items: [
        "Staff profiles and contact details",
        "Job roles, departments, and permissions",
        "Work schedules",
        "Task or service assignments",
        "Commission settings and tracking",
        "Performance reports",
        "Staff documents and branch assignments",
        "Employment information",
      ],
    },
    {
      title: "Attendance, Leave, and Payroll",
      items: [
        "Staff attendance and check-in/check-out records",
        "Daily attendance reports",
        "Leave requests, approvals, and balances",
        "Staff availability tracking",
        "Late-arrival tracking",
        "Payroll calculations and salary records",
        "Allowances and deductions",
        "Payslips and payroll reports",
      ],
      note: "Available as required.",
    },
    {
      title: "Loyalty, Memberships, and Subscriptions",
      items: [
        "Loyalty-point rules and customer point balances",
        "Points earned through purchases and points redemption",
        "Membership or subscription plans and benefits",
        "Validity periods and renewals",
        "Customer membership history",
        "Subscription payment tracking",
      ],
    },
    {
      title: "Expense and Financial Tracking",
      items: [
        "Expense categories and records",
        "Expense notes and receipt attachments",
        "Daily, weekly, and monthly summaries",
        "Approval workflows",
        "Expense reports",
        "Revenue tracking and profit calculations",
        "Cash-flow summaries where applicable",
      ],
    },
    {
      title: "Reports and Analytics",
      items: [
        "Daily, weekly, and monthly reports",
        "Custom date-range reports",
        "Revenue, expense, and profit reports",
        "Service, product, project, or department performance",
        "Staff performance and commission reports",
        "Booking, order, membership, or workflow reports",
        "Customer-retention insights",
        "Inventory and stock-movement reports",
        "Purchase-order and payment reports",
        "Branch comparisons",
        "Export to PDF, Excel, or CSV where applicable",
      ],
    },
    {
      title: "Users, Roles, and Permissions",
      items: [
        "Multiple user accounts — owner, administrator, manager, staff",
        "Department-based and branch-based access",
        "Role-based access control and custom permissions",
        "Activity and audit logs",
        "Secure login and user account management",
      ],
    },
    {
      title: "Multi-Branch Management",
      items: [
        "Centralized owner dashboard",
        "Branch-specific users and permissions",
        "Branch sales, performance, inventory, staff, and expenses",
        "Branch reports",
        "Inter-branch stock transfers",
        "Consolidated business reporting",
      ],
      note: "Available for businesses with multiple locations.",
    },
    {
      title: "Business Settings",
      items: [
        "Business information, logo, and contact details",
        "Branch information",
        "Invoice and tax settings where applicable",
        "Currency settings and payment methods",
        "Notification and user settings",
        "Backup settings and business preferences",
        "Numbering formats",
        "Email, SMS, and WhatsApp configuration",
      ],
    },
  ],
  optionalModules: [
    "Advanced CRM",
    "Multi-branch management",
    "Payroll management",
    "Project and task management",
    "Quotation management",
    "Contract management",
    "Asset management",
    "Document management",
    "Delivery management",
    "Rental management",
    "Customer-support tickets",
    "Internal notifications",
    "Email automation",
    "SMS automation",
    "WhatsApp automation",
    "Online payment gateway integration",
    "Mobile application",
    "Customer or member portal",
    "Supplier portal",
    "Custom reports and dashboards",
    "Custom approval workflows",
    "Third-party software integrations",
    "Data migration from an existing system",
  ],
  pricingFactors: [
    "Required modules",
    "Number of users",
    "Number of branches",
    "Custom workflows",
    "Required reports",
    "Third-party integrations",
    "Data migration",
    "Training requirements",
    "Hosting and infrastructure requirements",
    "Ongoing support requirements",
  ],
  startingPrice: CLOUD_ERP_PRICE,
  cta: "Book a Free Consultation",
  importantInfo: [
    "Cloud ERP is a standalone business management system.",
    "A public business website is not included unless Web Lite or Web Pro is purchased separately.",
    "Only the modules required by the customer will be included in the final project scope.",
    "New modules or major workflow changes requested after scope approval will be quoted separately.",
  ],
};

// --- Package comparison ---------------------------------------------------
export const comparisonRows: {
  feature: string;
  webLite: string;
  webPro: string;
  cloudERP: string;
}[] = [
  { feature: "Professional public website", webLite: "Yes", webPro: "Yes", cloudERP: "Not included by default" },
  { feature: "Mobile-responsive design", webLite: "Yes", webPro: "Yes", cloudERP: "Yes" },
  { feature: "WhatsApp contact button", webLite: "Yes", webPro: "Yes", cloudERP: "Optional" },
  { feature: "Contact or inquiry form", webLite: "Yes", webPro: "Yes", cloudERP: "Customizable" },
  { feature: "Admin dashboard", webLite: "No", webPro: "Yes", cloudERP: "Yes" },
  { feature: "Website content management", webLite: "No", webPro: "Yes", cloudERP: "Not applicable unless included" },
  { feature: "Online booking or customer workflow", webLite: "No", webPro: "Yes", cloudERP: "Advanced and customizable" },
  { feature: "Email notifications", webLite: "No", webPro: "Yes", cloudERP: "Customizable" },
  { feature: "Customer database", webLite: "No", webPro: "Yes", cloudERP: "Advanced" },
  { feature: "Service or product management", webLite: "Display only", webPro: "Basic management", cloudERP: "Advanced management" },
  { feature: "Staff management", webLite: "Display only", webPro: "Basic", cloudERP: "Advanced" },
  { feature: "POS and billing", webLite: "No", webPro: "No", cloudERP: "Optional" },
  { feature: "Inventory management", webLite: "No", webPro: "No", cloudERP: "Optional" },
  { feature: "Purchase orders and suppliers", webLite: "No", webPro: "No", cloudERP: "Optional" },
  { feature: "Attendance and leave", webLite: "No", webPro: "No", cloudERP: "Optional" },
  { feature: "Payroll", webLite: "No", webPro: "No", cloudERP: "Optional" },
  { feature: "Memberships and loyalty", webLite: "No", webPro: "Limited customization", cloudERP: "Optional" },
  { feature: "Reports and analytics", webLite: "No", webPro: "Basic", cloudERP: "Advanced" },
  { feature: "Multi-branch support", webLite: "No", webPro: "Optional", cloudERP: "Optional" },
  { feature: "Custom roles and permissions", webLite: "No", webPro: "Basic", cloudERP: "Advanced" },
  { feature: "Custom business workflows", webLite: "No", webPro: "Limited", cloudERP: "Yes" },
  { feature: "AI chatbot", webLite: "Optional", webPro: "Optional", cloudERP: "Optional" },
  { feature: "Free lifetime bug fixes", webLite: "Yes", webPro: "Yes", cloudERP: "Yes" },
];

// --- Add-ons ----------------------------------------------------------------
export const addOns: string[] = [
  "Additional website pages",
  "Additional languages",
  "Professional content writing",
  "Logo and brand design",
  "Professional photography or video",
  "Advanced SEO",
  "Google Business Profile setup",
  "Blog or news section",
  "E-commerce",
  "Online payment gateway",
  "AI chatbot",
  "WhatsApp Business API",
  "SMS notifications",
  "Business email setup",
  "Customer or member portal",
  "Mobile application",
  "Advanced reports",
  "Data migration",
  "Third-party integrations",
  "Ongoing content updates",
  "Managed hosting and maintenance",
];

// --- Free lifetime bug fixes -------------------------------------------------
export const bugFixes = {
  description:
    "Free lifetime bug fixes are included for verified technical errors in features developed and delivered by our team.",
  included: [
    "Fixing coding errors in delivered features",
    "Repairing broken functions included in the approved project scope",
    "Correcting system errors caused by the original implementation",
    "Fixing responsive-layout problems in supported devices",
    "Correcting calculation, notification, booking, dashboard, or workflow errors related to existing features",
  ],
  notIncluded: [
    "New features, modules, pages, or reports",
    "Design changes or redesigns",
    "Content updates",
    "New integrations",
    "Changes required because of third-party platform or API updates",
    "Hosting, server, domain, email, SMS, or WhatsApp provider issues",
    "Problems caused by customer actions",
    "Problems caused by another developer or unauthorized modification",
    "Data recovery caused by deletion, malware, hosting failure, or third-party failure",
    "Major technology upgrades or complete redevelopment",
  ],
  note: "New features, custom changes, integrations, and upgrades will be quoted separately.",
};

// --- Domain, hosting, and third-party charges --------------------------------
export const charges: string[] = [
  "Domain registration is charged separately.",
  "Hosting or cloud-server charges are charged separately.",
  "Business email charges are charged separately.",
  "Payment-gateway fees are charged by the selected provider.",
  "SMS credits and gateway fees are charged separately.",
  "WhatsApp Business API charges are charged separately.",
  "AI platform and API usage charges are charged separately.",
  "Premium plugins, licenses, maps, storage, or external software fees are charged separately.",
  "Annual renewal charges may apply to domains, hosting, email, licenses, and third-party services.",
];
export const chargesNote = "Unless specifically stated in the final quotation:";

// --- Project process ----------------------------------------------------
export const process: { title: string; description: string }[] = [
  { title: "Free Consultation", description: "We learn about your business, customers, workflow, and goals." },
  { title: "Package and Feature Selection", description: "We recommend Web Lite, Web Pro, Cloud ERP, or a combined solution." },
  { title: "Requirement Confirmation", description: "Pages, modules, workflows, integrations, and responsibilities are documented." },
  { title: "Quotation and Agreement", description: "You receive a final price, delivery estimate, payment plan, and approved project scope." },
  { title: "Design and Development", description: "The website or system is designed and developed according to the approved scope." },
  { title: "Review and Testing", description: "The customer reviews the solution, and approved revisions are completed." },
  { title: "Training and Handover", description: "Dashboard or system training is provided where applicable." },
  { title: "Deployment and Launch", description: "The approved solution is deployed to the selected domain or cloud environment." },
];

// --- Payment terms ------------------------------------------------------
export const paymentTerms: { split: string; label: string }[] = [
  { split: "50%", label: "Advance payment to begin the project" },
  { split: "30%", label: "After design or major feature approval" },
  { split: "20%", label: "Before final deployment and handover" },
];
export const paymentTermsNote =
  "The payment schedule may be adjusted depending on project size and duration. Work begins after the advance payment, approved requirements, and required business content have been received.";

// --- Delivery time --------------------------------------------------------
export const deliveryTimes: { name: string; estimate: string }[] = [
  { name: "Web Lite", estimate: "Approximately 1–3 weeks" },
  { name: "Web Pro", estimate: "Approximately 3–8 weeks" },
  { name: "Cloud ERP", estimate: "Confirmed after requirement analysis" },
];
export const deliveryFactors: string[] = [
  "Number of pages or modules",
  "Complexity of workflows",
  "Content availability",
  "Customer response time",
  "Third-party approvals",
  "Integrations",
  "Revision requests",
  "Data migration",
];

// --- Content and customer responsibilities -----------------------------
export const responsibilities: string[] = [
  "Business name and logo",
  "Business description",
  "Services, products, packages, or pricing",
  "Contact details",
  "Staff or team information",
  "Images and videos",
  "Policies and terms",
  "Domain or hosting access where applicable",
  "Existing system data where migration is required",
  "Timely review and approval",
];
export const responsibilitiesNote =
  "Content writing, branding, photography, data entry, and migration can be quoted separately.";

// --- Revisions and scope changes -----------------------------------------
export const revisions: string[] = [
  "The number of included revision rounds will be stated in the quotation.",
  "Revisions must remain within the approved design and project scope.",
  "New pages, features, workflows, reports, integrations, or major design changes are treated as additional work.",
  "Additional work will be estimated and quoted before implementation.",
];

// --- FAQ ----------------------------------------------------------------
export const faqs: { q: string; a: string }[] = [
  {
    q: "Which package should I choose?",
    a: "Choose Web Lite when you only need a professional online presence and easy customer contact. Choose Web Pro when customers need to book, register, reserve, request quotations, or submit inquiries, and you need a dashboard to manage those activities. Choose Cloud ERP when you need to manage daily business operations such as customers, staff, sales, inventory, expenses, reports, projects, memberships, or multiple branches.",
  },
  {
    q: "Can the packages be customized for my industry?",
    a: "Yes. Page names, customer workflows, dashboard sections, terminology, and ERP modules will be adjusted to match your business.",
  },
  {
    q: "Can I purchase a website and ERP together?",
    a: "Yes. Web Lite or Web Pro can be combined with Cloud ERP to provide both a public website and a complete internal management system.",
  },
  {
    q: "Does Web Lite include a dashboard?",
    a: "No. Web Lite is a professional informational website without an admin dashboard.",
  },
  {
    q: "Does Web Pro include a dashboard?",
    a: "Yes. Web Pro includes a secure dashboard for managing website content, customer inquiries, bookings, services, staff, and relevant business details.",
  },
  {
    q: "Does Cloud ERP include a public website?",
    a: "No. A public website is not included unless Web Lite or Web Pro is purchased separately.",
  },
  {
    q: "Are hosting and domain charges included?",
    a: "Only when clearly stated in the final quotation. Otherwise, domain, hosting, email, and third-party service charges are separate.",
  },
  {
    q: "Are AI and WhatsApp services free?",
    a: "The development and integration cost will be included in the quotation when selected. External AI, WhatsApp, SMS, email, and platform usage fees may be charged separately by the provider.",
  },
  {
    q: "Can new features be added later?",
    a: "Yes. New features and modules can be added later and will be quoted separately.",
  },
  {
    q: "Do you provide support after launch?",
    a: "Basic handover is included. Ongoing maintenance, content management, training, server management, and priority support can be purchased separately.",
  },
];

export const finalCTA = {
  title: "Not Sure Which Package Fits Your Business?",
  description:
    "Tell us how your business currently works, what problems you want to solve, and what your customers need to do online. We will recommend the most suitable solution and provide a clear quotation.",
  primaryCta: "Get a Free Consultation",
  secondaryCta: "Request a Demo",
};
