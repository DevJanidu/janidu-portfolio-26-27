import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import {
  heroContent,
  paymentConfig,
  processSteps,
  profile,
  projects as staticProjects,
} from "../lib/data";
import { salonConcepts } from "../lib/salon-concepts";

// Load .env.local explicitly for standalone tsx execution
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
    if (!process.env[key]) process.env[key] = val;
  }

  // Ensure BETTER_AUTH_SECRET exists locally (generated cryptographically, never logged)
  if (!process.env.BETTER_AUTH_SECRET) {
    const generatedSecret = crypto.randomBytes(32).toString("base64");
    fs.appendFileSync(
      envLocalPath,
      `\nBETTER_AUTH_SECRET="${generatedSecret}"\nBETTER_AUTH_URL="http://localhost:3000"\n`,
      "utf8"
    );
    process.env.BETTER_AUTH_SECRET = generatedSecret;
    console.log("Generated local BETTER_AUTH_SECRET in .env.local");
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function applyAdditiveSchema() {
  // 1. Better Auth tables
  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at TIMESTAMPTZ,
      refresh_token_expires_at TIMESTAMPTZ,
      scope TEXT,
      password TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier)`;

  await sql`
    CREATE TABLE IF NOT EXISTS two_factor (
      id TEXT PRIMARY KEY,
      secret TEXT NOT NULL,
      backup_codes TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      failed_verification_count INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )
  `;
  await sql`ALTER TABLE two_factor ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE two_factor ADD COLUMN IF NOT EXISTS failed_verification_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE two_factor ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`;
  await sql`CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON two_factor(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit (
      id TEXT PRIMARY KEY,
      key TEXT,
      count INTEGER,
      last_request BIGINT
    )
  `;
  await sql`ALTER TABLE rate_limit ALTER COLUMN last_request TYPE BIGINT`;

  // 2. Media Library
  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      storage_provider TEXT NOT NULL DEFAULT 'neon_s3',
      url TEXT NOT NULL,
      object_key TEXT,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      alt_text TEXT NOT NULL DEFAULT '',
      folder TEXT NOT NULL DEFAULT 'general',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_media_folder_created ON media_assets(folder, created_at)`;

  // 3. Project Categories & Projects
  await sql`
    CREATE TABLE IF NOT EXISTS project_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      section_title TEXT NOT NULL,
      section_subtitle TEXT,
      description TEXT NOT NULL DEFAULT '',
      cover_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      icon_name TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_categories_order ON project_categories(display_order, status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES project_categories(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      classification TEXT NOT NULL DEFAULT 'demo',
      project_type TEXT NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      brief_text TEXT NOT NULL DEFAULT '',
      what_i_built_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      verified_outcomes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      palette TEXT,
      client_name TEXT,
      country TEXT,
      completed_at DATE,
      live_url TEXT,
      demo_url TEXT,
      custom_links_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      cover_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      video_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      show_in_live_showcase BOOLEAN NOT NULL DEFAULT FALSE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_category_order ON projects(category_id, display_order)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status_featured ON projects(status, is_featured)`;

  await sql`
    CREATE TABLE IF NOT EXISTS project_media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      media_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
      device_type TEXT NOT NULL DEFAULT 'desktop',
      title TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      alt_text TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id, display_order)`;

  // 4. Clients & Active Client Projects
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_name TEXT,
      email TEXT,
      phone TEXT,
      country TEXT NOT NULL DEFAULT 'USA',
      status TEXT NOT NULL DEFAULT 'active',
      source_inquiry_id TEXT,
      private_notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status, created_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS client_projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      category_id TEXT REFERENCES project_categories(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'proposal_sent',
      agreed_amount NUMERIC(12,2),
      currency TEXT NOT NULL DEFAULT 'USD',
      deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
      deposit_paid_at DATE,
      final_paid BOOLEAN NOT NULL DEFAULT FALSE,
      final_paid_at DATE,
      start_date DATE,
      target_launch_date DATE,
      launched_at DATE,
      private_preview_url TEXT,
      live_site_url TEXT,
      portfolio_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      private_notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id, stage)`;

  await sql`
    CREATE TABLE IF NOT EXISTS client_project_milestones (
      id TEXT PRIMARY KEY,
      client_project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
      due_date DATE,
      completed_at TIMESTAMPTZ,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_milestones_project ON client_project_milestones(client_project_id, display_order)`;

  // 5. Additive columns on EXISTING `reviews` and `inquiries` tables (ZERO DATA LOSS)
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS client_photo_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website_form'`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_note TEXT`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
  await sql`UPDATE reviews SET status = 'published' WHERE approved = TRUE AND status = 'pending'`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_status_published ON reviews(status, published_at)`;

  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS phone TEXT`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS requested_service TEXT`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS budget TEXT`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS private_notes TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS converted_client_id TEXT REFERENCES clients(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at)`;

  // 6. Website Content, Services, Settings, Revisions, Logs, Analytics
  await sql`
    CREATE TABLE IF NOT EXISTS website_sections (
      id TEXT PRIMARY KEY,
      page_key TEXT NOT NULL DEFAULT 'home',
      section_key TEXT UNIQUE,
      template_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      draft_content_json JSONB,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sections_page_order ON website_sections(page_key, display_order)`;

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon_name TEXT,
      media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      features_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      starting_price NUMERIC(12,2),
      currency TEXT NOT NULL DEFAULT 'USD',
      delivery_estimate TEXT,
      cta_label TEXT NOT NULL DEFAULT 'Start a project',
      cta_href TEXT NOT NULL DEFAULT '/#contact',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      site_name TEXT NOT NULL DEFAULT 'Janidu Yapa',
      site_tagline TEXT NOT NULL DEFAULT 'Websites & Online Booking for Small Businesses',
      logo_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      favicon_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      public_email TEXT NOT NULL DEFAULT 'hello@janidudev.com',
      public_whatsapp TEXT NOT NULL DEFAULT '+94 72 625 4163',
      location_text TEXT NOT NULL DEFAULT 'Kandy, Sri Lanka',
      client_markets_text TEXT NOT NULL DEFAULT '',
      linkedin_url TEXT NOT NULL DEFAULT '',
      other_socials_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      default_seo_title TEXT NOT NULL DEFAULT '',
      default_seo_description TEXT NOT NULL DEFAULT '',
      show_services_section BOOLEAN NOT NULL DEFAULT FALSE,
      notify_new_enquiry BOOLEAN NOT NULL DEFAULT TRUE,
      notify_new_review BOOLEAN NOT NULL DEFAULT TRUE,
      notify_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS content_revisions (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      snapshot_json JSONB NOT NULL,
      summary TEXT NOT NULL DEFAULT 'Saved version',
      created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id, created_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      template_name TEXT NOT NULL,
      recipient_domain TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_message_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      path TEXT NOT NULL,
      entity_slug TEXT,
      country_code TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_type_created ON analytics_events(event_type, created_at)`;
}

async function ensureLocalMedia(
  urlPath: string,
  altText: string,
  folder: string
): Promise<string> {
  const existing = await sql`
    SELECT id FROM media_assets WHERE url = ${urlPath} LIMIT 1
  `;
  if (existing.length > 0) return String(existing[0].id);

  const id = `med_${crypto
    .createHash("sha1")
    .update(urlPath)
    .digest("hex")
    .slice(0, 12)}`;
  const fileName = path.basename(urlPath);
  const absPath = path.join(process.cwd(), "public", urlPath.replace(/^\//, ""));
  const sizeBytes = fs.existsSync(absPath) ? fs.statSync(absPath).size : 0;

  await sql`
    INSERT INTO media_assets (
      id, storage_provider, url, object_key, file_name, mime_type, size_bytes, alt_text, folder
    )
    VALUES (
      ${id}, 'local_static', ${urlPath}, ${null}, ${fileName}, 'image/png', ${sizeBytes}, ${altText}, ${folder}
    )
    ON CONFLICT (id) DO NOTHING
  `;
  return id;
}

async function seedExistingContent() {
  // Brand logo media
  const logoId = await ensureLocalMedia(
    "/logo-ribbon.png",
    "JaniduDev glossy blue ribbon logo",
    "branding"
  );

  // Site settings
  await sql`
    INSERT INTO site_settings (
      id, site_name, site_tagline, logo_media_id, public_email, public_whatsapp,
      location_text, client_markets_text, linkedin_url, default_seo_title,
      default_seo_description, show_services_section
    )
    VALUES (
      'default',
      ${profile.publicName},
      'Websites & Online Booking for Small Businesses',
      ${logoId},
      ${profile.email},
      ${profile.whatsapp},
      ${profile.location},
      ${profile.clientMarkets},
      ${profile.socials.linkedin},
      'Janidu Yapa | Websites & Online Booking for Small Businesses',
      'Freelance web designer and developer based in Kandy, Sri Lanka, building custom websites, service menus, and online booking for salons, spas, and small businesses.',
      FALSE
    )
    ON CONFLICT (id) DO NOTHING
  `;

  // Categories
  const salonCoverId = await ensureLocalMedia(
    "/assets/salon-concepts/02-lucia-atelier.png",
    "Salon & spa website designs",
    "categories"
  );
  const legalCoverId = await ensureLocalMedia(
    "/assets/project-images/law-1.png",
    "Professional service firm websites",
    "categories"
  );

  await sql`
    INSERT INTO project_categories (
      id, name, slug, section_title, section_subtitle, description, cover_media_id,
      icon_name, display_order, status, is_visible
    )
    VALUES
      (
        'cat_salons',
        'Salons & Spas',
        'salons',
        'Pick a salon style and booking approach',
        'Salon collection · Design concepts',
        'Custom websites with clear service menus, studio hours, and online booking for nail bars, hair salons, and day spas.',
        ${salonCoverId},
        'Scissors',
        1,
        'published',
        TRUE
      ),
      (
        'cat_professional',
        'Professional Services',
        'professional-services',
        'Websites for law firms and service practices',
        'Professional services',
        'Clear practice area guides, team profiles, and structured consultation intake built to earn client trust.',
        ${legalCoverId},
        'Briefcase',
        2,
        'published',
        TRUE
      )
    ON CONFLICT (slug) DO NOTHING
  `;

  // Migrate static projects from lib/data.ts
  let order = 1;
  for (const p of staticProjects) {
    const categoryId =
      p.slug === "havelock-law-firm" ? "cat_professional" : "cat_salons";
    const coverId = await ensureLocalMedia(p.cardImage, p.cardImageAlt, "projects");
    const projectId = `prj_${p.slug}`;

    await sql`
      INSERT INTO projects (
        id, category_id, title, slug, classification, project_type,
        short_description, full_description, brief_text,
        what_i_built_json, verified_outcomes_json,
        live_url, demo_url, cover_media_id,
        show_in_live_showcase, is_featured, show_on_homepage,
        display_order, status, is_visible
      )
      VALUES (
        ${projectId},
        ${categoryId},
        ${p.title},
        ${p.slug},
        ${p.externalLinkType === "live" ? "client_work" : "demo"},
        ${p.category},
        ${p.cardLead},
        ${p.description},
        ${p.caseStudy.brief},
        ${JSON.stringify(p.caseStudy.whatIBuilt)}::jsonb,
        ${JSON.stringify(p.caseStudy.verifiedOutcomes)}::jsonb,
        ${p.externalLinkType === "live" ? p.externalUrl : null},
        ${p.externalLinkType === "demo" ? p.externalUrl : null},
        ${coverId},
        ${Boolean(p.supportsLiveEmbed)},
        ${Boolean(p.featured)},
        ${Boolean(p.featured)},
        ${order},
        'published',
        TRUE
      )
      ON CONFLICT (slug) DO NOTHING
    `;

    // Migrate project screens
    let screenOrder = 1;
    for (const s of p.screens) {
      const mediaId = await ensureLocalMedia(s.src, s.alt, "projects");
      const pmId = `pm_${p.slug}_${screenOrder}`;
      await sql`
        INSERT INTO project_media (
          id, project_id, media_id, device_type, title, caption, alt_text, display_order
        )
        VALUES (
          ${pmId}, ${projectId}, ${mediaId}, 'desktop', ${s.title}, ${s.caption}, ${s.alt}, ${screenOrder}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      screenOrder += 1;
    }
    order += 1;
  }

  // Migrate remaining salon concepts from lib/salon-concepts.ts
  for (const c of salonConcepts) {
    const existing = await sql`SELECT id FROM projects WHERE slug = ${c.slug} LIMIT 1`;
    if (existing.length > 0) {
      // Attach palette metadata to already-migrated featured salon builds
      await sql`UPDATE projects SET palette = ${c.palette} WHERE slug = ${c.slug} AND palette IS NULL`;
      continue;
    }

    const coverId = await ensureLocalMedia(c.screenshot, c.screenshotAlt, "projects");
    const projectId = `prj_${c.slug}`;
    await sql`
      INSERT INTO projects (
        id, category_id, title, slug, classification, project_type,
        short_description, full_description, brief_text,
        palette, demo_url, cover_media_id,
        show_in_live_showcase, is_featured, show_on_homepage,
        display_order, status, is_visible
      )
      VALUES (
        ${projectId},
        'cat_salons',
        ${c.title},
        ${c.slug},
        'design_concept',
        ${c.bookingApproach},
        ${c.suits},
        ${c.styleSummary},
        ${c.suits},
        ${c.palette},
        ${c.demoUrl},
        ${coverId},
        FALSE,
        FALSE,
        ${Boolean(c.featuredOnHome)},
        ${order},
        'published',
        TRUE
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    order += 1;
  }

  // Seed core editable website sections
  const sections = [
    {
      id: "sec_hero",
      sectionKey: "hero",
      templateType: "hero",
      title: "Hero Section",
      displayOrder: 1,
      isVisible: true,
      content: {
        headline: heroContent.headline,
        subheadline: heroContent.subheadline,
        primaryLabel: heroContent.primaryAction.label,
        primaryHref: heroContent.primaryAction.href,
        secondaryLabel: heroContent.secondaryAction.label,
        secondaryHref: heroContent.secondaryAction.href,
      },
    },
    {
      id: "sec_process",
      sectionKey: "process",
      templateType: "process",
      title: "Process & Payments",
      displayOrder: 4,
      isVisible: true,
      content: {
        label: "Process & payments",
        heading: "How a project runs from proposal to launch",
        description:
          "Clear milestones, a private preview link to test everything on your phone and computer, and a written proposal agreed before work begins.",
        steps: processSteps,
        paymentHeadline: paymentConfig.headline,
        paymentDetails: paymentConfig.details,
      },
    },
    {
      id: "sec_about",
      sectionKey: "about",
      templateType: "about",
      title: "About Me",
      displayOrder: 6,
      isVisible: true,
      content: {
        heading: "One person handling design, booking setup, and launch",
        paragraph: profile.aboutParagraph,
        experienceLine: profile.experienceLine,
      },
    },
    {
      id: "sec_announcement",
      sectionKey: "announcement",
      templateType: "announcement",
      title: "Announcement Banner",
      displayOrder: 0,
      isVisible: false,
      content: {
        text: "Now booking website projects for next month.",
        linkLabel: "Start a project",
        linkHref: "/#contact",
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO website_sections (
        id, page_key, section_key, template_type, title, content_json, display_order, status, is_visible
      )
      VALUES (
        ${s.id}, 'home', ${s.sectionKey}, ${s.templateType}, ${s.title},
        ${JSON.stringify(s.content)}::jsonb, ${s.displayOrder}, 'published', ${s.isVisible}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function main() {
  console.log("Applying additive CMS schema to Neon PostgreSQL...");
  await applyAdditiveSchema();
  console.log("Migrating existing portfolio content into Neon...");
  await seedExistingContent();

  const [cats] = await sql`SELECT COUNT(*)::int AS c FROM project_categories`;
  const [projs] = await sql`SELECT COUNT(*)::int AS c FROM projects`;
  const [revs] = await sql`SELECT COUNT(*)::int AS c FROM reviews`;
  const [med] = await sql`SELECT COUNT(*)::int AS c FROM media_assets`;
  const [secs] = await sql`SELECT COUNT(*)::int AS c FROM website_sections`;

  console.log(
    `Phase 1 migration complete! Categories: ${cats.c}, Projects: ${projs.c}, Reviews preserved: ${revs.c}, Media assets: ${med.c}, Sections: ${secs.c}`
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
