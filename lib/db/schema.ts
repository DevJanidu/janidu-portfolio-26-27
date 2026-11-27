import {
  pgTable,
  text,
  boolean,
  integer,
  bigint,
  smallint,
  timestamp,
  date,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// 1. Better Auth Tables (PostgreSQL + twoFactor plugin)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("admin"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("idx_session_user_id").on(t.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_account_user_id").on(t.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_verification_identifier").on(t.identifier)]
);

export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    verified: boolean("verified").notNull().default(false),
    failedVerificationCount: integer("failed_verification_count").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("idx_two_factor_user_id").on(t.userId)]
);

// Better Auth database rate-limit storage
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});

// ---------------------------------------------------------------------------
// 2. Centralized Media Library (Neon Object Storage S3 + Migrated Local Assets)
// ---------------------------------------------------------------------------

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    storageProvider: text("storage_provider").notNull().default("neon_s3"), // 'neon_s3' | 'local_static'
    url: text("url").notNull(),
    objectKey: text("object_key"),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text").notNull().default(""),
    folder: text("folder").notNull().default("general"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_media_folder_created").on(t.folder, t.createdAt)]
);

// ---------------------------------------------------------------------------
// 3. Dynamic Project Categories & Portfolio Projects
// ---------------------------------------------------------------------------

export const projectCategories = pgTable(
  "project_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sectionTitle: text("section_title").notNull(),
    sectionSubtitle: text("section_subtitle"),
    description: text("description").notNull().default(""),
    coverMediaId: text("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    iconName: text("icon_name"),
    displayOrder: integer("display_order").notNull().default(0),
    status: text("status").notNull().default("draft"), // 'draft' | 'published'
    isVisible: boolean("is_visible").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_categories_order").on(t.displayOrder, t.status)]
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").references(() => projectCategories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    classification: text("classification").notNull().default("demo"), // 'client_work' | 'demo' | 'design_concept' | 'personal'
    projectType: text("project_type").notNull().default(""),
    shortDescription: text("short_description").notNull().default(""),
    fullDescription: text("full_description").notNull().default(""),
    briefText: text("brief_text").notNull().default(""),
    whatIBuiltJson: jsonb("what_i_built_json").$type<string[]>().notNull().default([]),
    verifiedOutcomesJson: jsonb("verified_outcomes_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    palette: text("palette"),
    clientName: text("client_name"),
    country: text("country"),
    completedAt: date("completed_at"),
    liveUrl: text("live_url"),
    demoUrl: text("demo_url"),
    customLinksJson: jsonb("custom_links_json")
      .$type<Array<{ label: string; url: string }>>()
      .notNull()
      .default([]),
    coverMediaId: text("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    videoMediaId: text("video_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    showInLiveShowcase: boolean("show_in_live_showcase").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    showOnHomepage: boolean("show_on_homepage").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    status: text("status").notNull().default("draft"), // 'draft' | 'published'
    isVisible: boolean("is_visible").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_projects_category_order").on(t.categoryId, t.displayOrder),
    index("idx_projects_status_featured").on(t.status, t.isFeatured),
  ]
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: text("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    deviceType: text("device_type").notNull().default("desktop"), // 'desktop' | 'mobile' | 'gallery'
    title: text("title").notNull().default(""),
    caption: text("caption").notNull().default(""),
    altText: text("alt_text").notNull().default(""),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (t) => [index("idx_project_media_project").on(t.projectId, t.displayOrder)]
);

// ---------------------------------------------------------------------------
// 4. Customer Reviews (Extended In-Place from Existing Neon Table)
// ---------------------------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    rating: smallint("rating").notNull(),
    projectName: text("project_name").notNull(),
    comment: text("comment").notNull(),
    translation: text("translation"),
    clientName: text("client_name").notNull(),
    businessName: text("business_name"),
    country: text("country").notNull().default("USA"),
    privateContactEmail: text("private_contact_email"),
    displayPermission: boolean("display_permission").notNull().default(true),
    approved: boolean("approved").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    publishedAt: date("published_at").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Additive CMS moderation columns
    status: text("status").notNull().default("pending"), // 'published' | 'pending' | 'hidden' | 'trashed'
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    clientPhotoMediaId: text("client_photo_media_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" }
    ),
    source: text("source").notNull().default("website_form"), // 'website_form' | 'manual_admin' | 'email' | 'whatsapp'
    displayOrder: integer("display_order").notNull().default(0),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    moderationNote: text("moderation_note"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_reviews_status_published").on(t.status, t.publishedAt),
  ]
);

// ---------------------------------------------------------------------------
// 5. Enquiries & Private Client / Active Project Management
// ---------------------------------------------------------------------------

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    businessName: text("business_name"),
    email: text("email"),
    phone: text("phone"),
    country: text("country").notNull().default("USA"),
    status: text("status").notNull().default("active"), // 'lead' | 'active' | 'completed' | 'paused' | 'archived'
    sourceInquiryId: text("source_inquiry_id"),
    privateNotes: text("private_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_clients_status").on(t.status, t.createdAt)]
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    businessName: text("business_name"),
    country: text("country").notNull().default("USA"),
    selectedDesign: text("selected_design"),
    packageName: text("package_name"),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // 'new' | 'contacted' | 'discussing' | 'confirmed' | 'closed' | 'archived'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Additive CMS inbox columns
    phone: text("phone"),
    requestedService: text("requested_service"),
    budget: text("budget"),
    isRead: boolean("is_read").notNull().default(false),
    privateNotes: text("private_notes").notNull().default(""),
    convertedClientId: text("converted_client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_inquiries_status_created").on(t.status, t.createdAt)]
);

export const clientProjects = pgTable(
  "client_projects",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => projectCategories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    stage: text("stage").notNull().default("proposal_sent"), // 'proposal_sent' | 'deposit_received' | 'in_development' | 'preview_ready' | 'revisions' | 'final_payment' | 'launched' | 'maintenance'
    agreedAmount: numeric("agreed_amount", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    depositPaid: boolean("deposit_paid").notNull().default(false),
    depositPaidAt: date("deposit_paid_at"),
    finalPaid: boolean("final_paid").notNull().default(false),
    finalPaidAt: date("final_paid_at"),
    startDate: date("start_date"),
    targetLaunchDate: date("target_launch_date"),
    launchedAt: date("launched_at"),
    privatePreviewUrl: text("private_preview_url"),
    liveSiteUrl: text("live_site_url"),
    portfolioProjectId: text("portfolio_project_id").references(
      () => projects.id,
      { onDelete: "set null" }
    ),
    privateNotes: text("private_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_client_projects_client").on(t.clientId, t.stage),
  ]
);

export const clientProjectMilestones = pgTable(
  "client_project_milestones",
  {
    id: text("id").primaryKey(),
    clientProjectId: text("client_project_id")
      .notNull()
      .references(() => clientProjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    isCompleted: boolean("is_completed").notNull().default(false),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (t) => [
    index("idx_milestones_project").on(t.clientProjectId, t.displayOrder),
  ]
);

// ---------------------------------------------------------------------------
// 6. Dynamic Website Sections, Services, Site Settings & Audit/Analytics
// ---------------------------------------------------------------------------

export const websiteSections = pgTable(
  "website_sections",
  {
    id: text("id").primaryKey(),
    pageKey: text("page_key").notNull().default("home"),
    sectionKey: text("section_key").unique(),
    templateType: text("template_type").notNull(), // 'hero' | 'live_showcase' | 'featured_projects' | 'categories' | 'process' | 'reviews' | 'about' | 'contact' | 'announcement' | 'text_image' | 'services_grid' | 'faq' | 'stats' | 'cta' | 'gallery'
    title: text("title").notNull(),
    contentJson: jsonb("content_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    draftContentJson: jsonb("draft_content_json").$type<Record<string, unknown> | null>(),
    displayOrder: integer("display_order").notNull().default(0),
    status: text("status").notNull().default("published"), // 'draft' | 'published'
    isVisible: boolean("is_visible").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_sections_page_order").on(t.pageKey, t.displayOrder)]
);

export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    iconName: text("icon_name"),
    mediaId: text("media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    featuresJson: jsonb("features_json").$type<string[]>().notNull().default([]),
    startingPrice: numeric("starting_price", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    deliveryEstimate: text("delivery_estimate"),
    ctaLabel: text("cta_label").notNull().default("Start a project"),
    ctaHref: text("cta_href").notNull().default("/#contact"),
    displayOrder: integer("display_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_services_order").on(t.displayOrder)]
);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("Janidu Yapa"),
  siteTagline: text("site_tagline")
    .notNull()
    .default("Websites & Online Booking for Small Businesses"),
  logoMediaId: text("logo_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  faviconMediaId: text("favicon_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  publicEmail: text("public_email").notNull().default("hello@janidudev.com"),
  publicWhatsapp: text("public_whatsapp").notNull().default("+94 72 625 4163"),
  locationText: text("location_text").notNull().default("Kandy, Sri Lanka"),
  clientMarketsText: text("client_markets_text")
    .notNull()
    .default(
      "Based in Kandy, Sri Lanka. Working with small business owners in the US, UK, Australia, Sri Lanka, and worldwide."
    ),
  linkedinUrl: text("linkedin_url")
    .notNull()
    .default("https://www.linkedin.com/in/janidu-yapa-40217a332/"),
  otherSocialsJson: jsonb("other_socials_json")
    .$type<Array<{ label: string; url: string }>>()
    .notNull()
    .default([]),
  defaultSeoTitle: text("default_seo_title")
    .notNull()
    .default("Janidu Yapa | Websites & Online Booking for Small Businesses"),
  defaultSeoDescription: text("default_seo_description")
    .notNull()
    .default(
      "Freelance web designer and developer based in Kandy, Sri Lanka, building custom websites, service menus, and online booking for salons, spas, and small businesses."
    ),
  showServicesSection: boolean("show_services_section").notNull().default(false),
  notifyNewEnquiry: boolean("notify_new_enquiry").notNull().default(true),
  notifyNewReview: boolean("notify_new_review").notNull().default(true),
  notifySecurityAlerts: boolean("notify_security_alerts").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(), // 'project' | 'category' | 'section' | 'service'
    entityId: text("entity_id").notNull(),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
    summary: text("summary").notNull().default("Saved version"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_revisions_entity").on(t.entityType, t.entityId, t.createdAt)]
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_activity_created").on(t.createdAt)]
);

export const emailLogs = pgTable(
  "email_logs",
  {
    id: text("id").primaryKey(),
    templateName: text("template_name").notNull(),
    recipientDomain: text("recipient_domain").notNull(),
    status: text("status").notNull(), // 'sent' | 'failed'
    providerMessageId: text("provider_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_email_logs_created").on(t.createdAt)]
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type").notNull(), // 'page_view' | 'project_view' | 'category_view' | 'whatsapp_click' | 'email_click' | 'demo_click' | 'enquiry_submit'
    path: text("path").notNull(),
    entitySlug: text("entity_slug"),
    countryCode: text("country_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_analytics_type_created").on(t.eventType, t.createdAt)]
);
