import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const links = [
  { label: "About", href: "/about" },
  { label: "Divisions", href: "/divisions" },
  { label: "Services", href: "/services" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Projects", href: "/projects" },
  { label: "Technology", href: "/technology" },
  { label: "Insights", href: "/insights" },
];

export async function SiteHeader() {
  let brandSettings: { company_name?: string; logo_light_path?: string | null } | null = null;
  try { const supabase = await createSupabaseServerClient(); const result = await supabase.from("brand_settings").select("company_name,logo_light_path").eq("id", true).eq("is_published", true).maybeSingle(); brandSettings = result.data; } catch { /* Keep fallback identity if the database is unavailable. */ }
  const logoUrl = brandSettings?.logo_light_path && process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/babtek-brand-assets/" + brandSettings.logo_light_path : null;
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="BABTEK Core Nigeria Limited home">
          {logoUrl ? <img className="brand-logo-image" src={logoUrl} alt="" /> : <span className="brand-mark">B</span>}
          <span className="brand-copy">
            <strong>{brandSettings?.company_name || "BABTEK CORE"}</strong>
            <small>NIGERIA LIMITED</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>{link.label}</Link>
          ))}
          <Link className="button button-small" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
        </nav>
        <Link className="mobile-contact" href="/divisions">Explore BABTEK ↗</Link>
      </div>
    </header>
  );
}
