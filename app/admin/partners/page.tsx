import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { createPartner } from "./actions";
import { linkPartnerAccount } from "./link-actions";

export const metadata: Metadata = { title: "Professional Partners | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<{ created?: string; linked?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const { data: partners, error } = await supabase.from("professional_partners")
    .select("id,legal_name,trading_name,email,phone,professional_category,registration_details,created_at")
    .order("created_at", { ascending: false }).limit(250);
  const partnerIds = (partners || []).map((partner) => partner.id);
  const { data: links } = partnerIds.length
    ? await supabase.from("partner_user_links").select("partner_id,user_id").in("partner_id", partnerIds)
    : { data: [] as { partner_id: string; user_id: string }[] };
  const linkedUserIds = [...new Set((links || []).map((link) => link.user_id))];
  const { data: linkedProfiles } = linkedUserIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", linkedUserIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const profileNames = new Map((linkedProfiles || []).map((profile) => [profile.id, profile.full_name || profile.id]));

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
      <p className="admin-nav-label">WORKSPACE</p>
      <Link className="admin-nav-item" href="/admin">▦ Overview</Link>
      <Link className="admin-nav-item" href="/admin/enquiries">✉ Enquiries</Link>
      <Link className="admin-nav-item" href="/admin/projects">▤ Projects</Link>
      <Link className="admin-nav-item" href="/admin/clients">◉ Clients</Link>
      <Link className="admin-nav-item active" href="/admin/partners">◇ Professional partners</Link>
      <p className="admin-nav-label">BUSINESS CONTROL</p>
      <Link className="admin-nav-item" href="/admin#finance">₦ Finance overview</Link>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Managing Director</strong><small>OWNER ACCESS</small></span></div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / RELATIONSHIPS / PARTNERS</span><h1>Professional partner register</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
      <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">INDEPENDENT PROFESSIONAL NETWORK</p><h2>Coordinate specialist expertise with clarity.</h2><p>Record independent professionals and firms engaged on a project-by-project basis.</p></div><span className="admin-welcome-mark">◇</span></div>
      {params.created === "1" && <p className="admin-notice">Professional partner record created.</p>}{params.linked === "1" && <p className="admin-notice">Partner login linked and partner access granted.</p>}
      {params.error && <p className="admin-alert">{params.error === "required" ? "A legal or registered name is required." : params.error === "account" ? "That user account or profile was not found. Ask the partner to register and confirm their email first." : params.error === "link" ? "The partner account could not be linked. Check the UUID and permissions." : "The partner record could not be saved. Check permissions and try again."}</p>}
      <section className="admin-panel admin-register-panel">
        <div className="admin-panel-heading"><div><h2>Add a professional partner</h2><p>Record an independent specialist or professional firm. This does not create a staff position or login.</p></div></div>
        <form action={createPartner} className="admin-create-form">
          <label>Legal / registered name<input name="legal_name" required maxLength={200} /></label>
          <label>Trading name<input name="trading_name" maxLength={200} /></label>
          <label>Professional category<input name="professional_category" placeholder="e.g. Structural engineering" maxLength={120} /></label>
          <label>Email<input name="email" type="email" maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" maxLength={40} /></label>
          <label>Registration / qualification details<input name="registration_details" maxLength={500} /></label>
          <button type="submit">Create partner record</button>
        </form>
      </section>
      <section className="admin-panel admin-register-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><h2>Professional partner network</h2><p>Latest 250 records, newest first.</p></div><span>{partners?.length ?? 0} shown</span></div>
        {error ? <p className="admin-alert">Partner records could not be loaded.</p> : partners?.length ? <div className="admin-record-list">{partners.map((partner) => {
          const partnerLinks = (links || []).filter((link) => link.partner_id === partner.id);
          return <article key={partner.id} className="partner-admin-record"><div><strong>{partner.trading_name || partner.legal_name}</strong><p>{[partner.professional_category, partner.email, partner.phone, partner.registration_details].filter(Boolean).join(" · ")}</p><p>{partnerLinks.length ? "Linked portal user(s): " + partnerLinks.map((link) => profileNames.get(link.user_id) || link.user_id).join(", ") : "No portal account linked yet."}</p></div><div className="partner-link-form"><form action={linkPartnerAccount}><input type="hidden" name="partner_id" value={partner.id}/><label>Registered user account UUID<input name="user_id" required placeholder="Partner shares account ID after registration"/></label><button type="submit">Link account & grant partner access</button></form></div><span className="admin-status">INDEPENDENT</span></article>;
        })}</div> : <p className="admin-empty-note">No partner records yet. Add verified specialists as BABTEK establishes engagements.</p>}
      </section>
      <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Professional partner records · Owner access</span></footer>
    </section>
  </main>;
}
