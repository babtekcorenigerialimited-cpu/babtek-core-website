"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const links = [
  { label: "About", href: "/about" },
  { label: "Divisions", href: "/divisions" },
  { label: "Services", href: "/services" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Projects", href: "/projects" },
  { label: "Technology", href: "/technology" },
  { label: "Platform", href: "/platform" },
  { label: "Insights", href: "/insights" },
  { label: "Partner network", href: "/partner-network" },
];

export function SiteHeader() {
  const [brand, setBrand] = useState<{ company_name?: string; logo_light_path?: string | null } | null>(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const supabase = createBrowserClient(url, key);
    void supabase.from("brand_settings").select("company_name,logo_light_path").eq("id", true).eq("is_published", true).maybeSingle()
      .then(({ data }) => { if (data) setBrand(data); });
  }, []);
  const logoUrl = brand?.logo_light_path && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/babtek-brand-assets/" + brand.logo_light_path
    : null;
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="BABTEK Core Nigeria Limited home">
          {logoUrl ? <img className="brand-logo-image" src={logoUrl} alt="" /> : <span className="brand-mark">B</span>}
          <span className="brand-copy"><strong>{brand?.company_name || "BABTEK CORE"}</strong><small>NIGERIA LIMITED</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => <Link key={link.label} href={link.href}>{link.label}</Link>)}
          <Link href="/client/login">Client portal</Link>
          <Link href="/partner/login">Partner portal</Link>
          <Link className="button button-small" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
        </nav>
        <Link className="mobile-contact" href="/divisions">Explore BABTEK ↗</Link><Link className="mobile-contact" href="/partner-network">Partner network ↗</Link>
      </div>
    </header>
  );
}
