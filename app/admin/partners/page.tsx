import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { createPartner, updatePartnerRelationshipStatus } from "./actions";
import { linkPartnerAccount } from "./link-actions";
import { reviewPartnerProgress } from "./progress-actions";

export const metadata: Metadata = { title: "Partner Network | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<{ created?: string; linked?: string; reviewed?: string; status_updated?: string; error?: string; q?: string; status?: string; type?: string; division?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const searchTerm = (params.q || "").replace(/[^a-zA-Z0-9 @._-]/g, "").slice(0, 60);
  const allowedStatuses = ["prospect","active","paused","inactive","blacklisted"];
  const allowedTypes = ["professional","technology","supplier","venture","strategic","research","education","other"];
  const allowedDivisions = ["design-construction","interiors","real-estate","smart-solutions","academy","ventures","products-supply","research-innovation"];
  let partnerQuery = supabase.from("professional_partners")
    .select("id,legal_name,trading_name,email,phone,professional_category,partner_type,specialties,division_affiliations,relationship_status,website,registration_details,notes,created_at")
    .order("created_at", { ascending: false }).limit(250);
  if (searchTerm) partnerQuery = partnerQuery.or(`legal_name.ilike.%${searchTerm}%,trading_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
  if (allowedStatuses.includes(params.status || "")) partnerQuery = partnerQuery.eq("relationship_status", params.status!);
  if (allowedTypes.includes(params.type || "")) partnerQuery = partnerQuery.eq("partner_type", params.type!);
  if (allowedDivisions.includes(params.division || "")) partnerQuery = partnerQuery.contains("division_affiliations", [params.division!]);
  const { data: partners, error } = await partnerQuery;
  const partnerIds = (partners || []).map((partner) => partner.id);
  const { data: links } = partnerIds.length
    ? await supabase.from("partner_user_links").select("partner_id,user_id").in("partner_id", partnerIds)
    : { data: [] as { partner_id: string; user_id: string }[] };
  const linkedUserIds = [...new Set((links || []).map((link) => link.user_id))];
  const { data: linkedProfiles } = linkedUserIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", linkedUserIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const profileNames = new Map((linkedProfiles || []).map((profile) => [profile.id, profile.full_name || profile.id]));
  const { data: engagements } = partnerIds.length
    ? await supabase.from("project_partner_engagements").select("id,partner_id,project_id,scope_of_work").in("partner_id", partnerIds)
    : { data: [] as { id: string; partner_id: string; project_id: string; scope_of_work: string }[] };
  const engagementIds = (engagements || []).map((item) => item.id);
  const projectIds = [...new Set((engagements || []).map((item) => item.project_id))];
  const [{ data: progressUpdates }, { data: projectRows }] = engagementIds.length
    ? await Promise.all([
        supabase.from("partner_progress_updates").select("id,engagement_id,task_id,update_text,progress_percent,review_status,review_note,created_at").in("engagement_id", engagementIds).order("created_at", { ascending: false }).limit(200),
        supabase.from("projects").select("id,project_code,name").in("id", projectIds),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];
  const projectNames = new Map((projectRows || []).map((project) => [project.id, project.project_code + " · " + project.name]));
  const engagementMap = new Map((engagements || []).map((engagement) => [engagement.id, engagement]));

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
      <p className="admin-nav-label">WORKSPACE</p>
      <Link className="admin-nav-item" href="/admin">▦ Overview</Link>
      <Link className="admin-nav-item" href="/admin/enquiries">✉ Enquiries</Link>
      <Link className="admin-nav-item" href="/admin/projects">▤ Projects</Link>
      <Link className="admin-nav-item" href="/admin/clients">◉ Clients</Link>
      <Link className="admin-nav-item active" href="/admin/partners">◇ Partner network</Link>
      <Link className="admin-nav-item" href="/admin/partner-applications">Applications</Link>
      <p className="admin-nav-label">BUSINESS CONTROL</p>
      <Link className="admin-nav-item" href="/admin#finance">₦ Finance overview</Link>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Managing Director</strong><small>OWNER ACCESS</small></span></div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / RELATIONSHIPS / PARTNERS</span><h1>BABTEK partner network</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
      <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">OPEN & VERIFIED PARTNER NETWORK</p><h2>Build a trusted network across BABTEK's divisions.</h2><p>Manage professionals, technology collaborators, suppliers, ventures, research, education and strategic relationships.</p></div><span className="admin-welcome-mark">◇</span></div>
      {params.created === "1" && <p className="admin-notice">Partner relationship added to the network.</p>}{params.linked === "1" && <p className="admin-notice">Partner login linked and partner access granted.</p>}{params.reviewed === "1" && <p className="admin-notice">Partner progress review saved.</p>}{params.status_updated === "1" && <p className="admin-notice">Partner relationship status and access controls updated.</p>}
      {params.error && <p className="admin-alert">{params.error === "required" ? "A legal or registered name is required." : params.error === "account" ? "The account was not found, its email is unverified, its verified email does not match this active partner record, or it is already linked to another partner record. Verify the account and relationship details before linking." : params.error === "link" ? "The partner account could not be linked. Check the UUID and permissions." : params.error === "review" ? "The progress review could not be saved." : params.error === "status" ? "The relationship status could not be updated." : "The partner record could not be saved. Check permissions and try again."}</p>}
      <section className="admin-panel admin-register-panel">
        <div className="admin-panel-heading"><div><h2>Add a partner or relationship</h2><p>Add an individual, firm, technology collaborator, supplier, venture contact, research or strategic relationship. Partners remain independent and are not BABTEK employees.</p></div></div>
        <form action={createPartner} className="admin-create-form">
          <label>Legal / registered name<input name="legal_name" required maxLength={200} /></label>
          <label>Trading name<input name="trading_name" maxLength={200} /></label>
          <label>Relationship type<select name="partner_type" defaultValue="professional"><option value="professional">Professional / consultant</option><option value="technology">Technology / software</option><option value="supplier">Supplier / manufacturer</option><option value="venture">Venture / investment</option><option value="strategic">Strategic / business partner</option><option value="research">Research / innovation</option><option value="education">Education / training</option><option value="other">Other relationship</option></select></label>
          <label>Primary category<input name="professional_category" placeholder="e.g. Software engineering, surveying, investor" maxLength={120} /></label>
          <label>Specialties (comma separated)<input name="specialties" placeholder="e.g. React, APIs, cloud systems" maxLength={1000}/></label>
          <label>Website / portfolio<input name="website" type="url" placeholder="https://…" maxLength={255}/></label>
          <label>Related BABTEK divisions<select name="division_affiliations" multiple size={5}><option value="design-construction">Design & Construction</option><option value="interiors">Interiors</option><option value="real-estate">Real Estate</option><option value="smart-solutions">Smart Solutions</option><option value="academy">Academy</option><option value="ventures">Ventures</option><option value="products-supply">Products & Supply</option><option value="research-innovation">Research & Innovation</option></select></label>
          <label>Relationship notes<textarea name="notes" rows={2} maxLength={2000}/></label>
          <label>Email<input name="email" type="email" maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" maxLength={40} /></label>
          <label>Registration / qualification details<input name="registration_details" maxLength={500} /></label>
          <button type="submit">Add to partner network</button>
        </form>
      </section>
      <section className="admin-panel admin-register-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><h2>Partner relationship network</h2><p>Search and filter independent relationships across all BABTEK divisions. <Link className="admin-inline-link" href="/admin/partner-applications">Review open applications →</Link></p></div><span>{partners?.length ?? 0} shown</span></div>
        <form method="get" action="/admin/partners" className="partner-network-filters">
          <input name="q" defaultValue={params.q||""} placeholder="Search name, organisation or email"/>
          <select name="status" defaultValue={params.status||"all"}><option value="all">All relationship stages</option><option value="prospect">Prospect</option><option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option><option value="blacklisted">Blacklisted</option></select>
          <select name="type" defaultValue={params.type||"all"}><option value="all">All relationship types</option><option value="professional">Professional</option><option value="technology">Technology</option><option value="supplier">Supplier</option><option value="venture">Venture</option><option value="strategic">Strategic</option><option value="research">Research</option><option value="education">Education</option><option value="other">Other</option></select>
          <select name="division" defaultValue={params.division||"all"}><option value="all">All divisions</option><option value="design-construction">Design & Construction</option><option value="interiors">Interiors</option><option value="real-estate">Real Estate</option><option value="smart-solutions">Smart Solutions</option><option value="academy">Academy</option><option value="ventures">Ventures</option><option value="products-supply">Products & Supply</option><option value="research-innovation">Research & Innovation</option></select>
          <button type="submit">Apply filters</button><Link href="/admin/partners">Clear</Link>
        </form>
        {error ? <p className="admin-alert">Partner records could not be loaded.</p> : partners?.length ? <div className="admin-record-list">{partners.map((partner) => {
          const partnerLinks = (links || []).filter((link) => link.partner_id === partner.id);
          return <article key={partner.id} className="partner-admin-record"><div><strong>{partner.trading_name || partner.legal_name}</strong><p>{[partner.partner_type, partner.professional_category, partner.email, partner.phone, partner.relationship_status].filter(Boolean).join(" · ")}{partner.specialties?.length ? <span className="access-role-list">{partner.specialties.map((x:string)=><em key={x}>{x}</em>)}</span> : null}{partner.division_affiliations?.length ? <small>Divisions: {partner.division_affiliations.join(", ")}</small> : null}{partner.website ? <a className="admin-inline-link" href={partner.website} target="_blank" rel="noreferrer">Portfolio / website ↗</a> : null}</p><p>{partnerLinks.length ? "Linked portal user(s): " + partnerLinks.map((link) => profileNames.get(link.user_id) || link.user_id).join(", ") : "No portal account linked yet."}</p></div><div className="partner-management-actions"><form action={updatePartnerRelationshipStatus} className="partner-review-form"><input type="hidden" name="partner_id" value={partner.id}/><label>Relationship status<select name="relationship_status" defaultValue={partner.relationship_status}><option value="prospect">Prospect · not yet approved</option><option value="active">Active · eligible for new engagements</option><option value="paused">Paused · existing scoped access retained</option><option value="inactive">Inactive · portal access revoked</option><option value="blacklisted">Blacklisted · portal access revoked</option></select></label><label>Relationship notes<textarea name="notes" rows={3} maxLength={2000} defaultValue={partner.notes||""}/></label><button type="submit">Save relationship</button></form>{partner.relationship_status==="active"&&!partnerLinks.length&&<form action={linkPartnerAccount} className="partner-link-form"><input type="hidden" name="partner_id" value={partner.id}/><label>Registered user account UUID<input name="user_id" required placeholder="For legacy accounts not matched by verified email"/></label><button type="submit">Link verified account</button></form>}</div><span className="admin-status">{partner.relationship_status.replaceAll("_"," ").toUpperCase()}</span></article>;
        })}</div> : <p className="admin-empty-note">No partner records yet. Add a contact or organisation as BABTEK establishes its wider relationship network.</p>}
      </section>
      <section className="admin-panel admin-register-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><h2>Partner progress submissions</h2><p>Review updates submitted through the restricted partner workspace.</p></div><span>{progressUpdates?.length ?? 0} shown</span></div>
        {progressUpdates?.length ? <div className="admin-record-list">{progressUpdates.map((update) => {
          const engagement = engagementMap.get(update.engagement_id);
          const partner = (partners || []).find((item) => item.id === engagement?.partner_id);
          return <article key={update.id} className="partner-admin-record"><div><strong>{partner?.trading_name || partner?.legal_name || "Professional partner"} · {projectNames.get(engagement?.project_id || "") || "Project"}</strong><p>{update.update_text}</p><p>{update.progress_percent === null ? "Progress not specified" : update.progress_percent + "% reported"} · {new Date(update.created_at).toLocaleString("en-NG")}</p>{update.review_note && <p>BABTEK review: {update.review_note}</p>}</div><div className="partner-review-form"><span className="admin-status">{update.review_status.replaceAll("_", " ")}</span>{update.review_status === "submitted" && <form action={reviewPartnerProgress}><input type="hidden" name="update_id" value={update.id}/><label>Review note<input name="review_note" maxLength={2000} placeholder="Optional feedback"/></label><div className="partner-review-actions"><button type="submit" name="review_status" value="reviewed">Mark reviewed</button><button type="submit" name="review_status" value="changes_requested">Request changes</button></div></form>}</div></article>;
        })}</div> : <p className="admin-empty-note">No partner progress updates have been submitted yet.</p>}
      </section>
      <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Professional partner records · Owner access</span></footer>
    </section>
  </main>;
}
