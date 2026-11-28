import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { updateEnquiryStatus } from "./actions";

export const metadata: Metadata = { title: "Enquiries | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

const statuses = ["new", "reviewing", "qualified", "quoted", "converted", "declined", "closed"] as const;
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string; q?: string; status?: string }> }) {
  const params = await searchParams;
  const searchTerm = (params.q || "").trim().slice(0, 80).replace(/[,%()_*\\.]/g, " ");
  const selectedStatus = statuses.includes(params.status as (typeof statuses)[number]) ? params.status : "";
  let supabase;
  try { supabase = await createSupabaseServerClient(); }
  catch { return <main className="admin-empty"><h1>Platform configuration required</h1><p>Configure the Supabase environment before using the enquiry register.</p></main>; }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  let enquiryQuery = supabase
    .from("enquiries")
    .select("id,reference_code,full_name,email,phone,organisation,subject,message,service_interest,status,source,created_at")
    .order("created_at", { ascending: false });
  if (selectedStatus) enquiryQuery = enquiryQuery.eq("status", selectedStatus);
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    enquiryQuery = enquiryQuery.or([
      `full_name.ilike.${term}`,
      `email.ilike.${term}`,
      `phone.ilike.${term}`,
      `subject.ilike.${term}`,
      `reference_code.ilike.${term}`,
      `organisation.ilike.${term}`
    ].join(","));
  }
  const { data: enquiries, error } = await enquiryQuery.limit(100);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
        <p className="admin-nav-label">WORKSPACE</p>
        <Link className="admin-nav-item" href="/admin"><span>▦</span> Overview</Link>
        <Link className="admin-nav-item active" href="/admin/enquiries"><span>✉</span> Enquiries</Link>
        <Link className="admin-nav-item" href="/admin#projects"><span>▤</span> Projects</Link>
        <Link className="admin-nav-item" href="/admin#clients"><span>◉</span> Clients</Link>
        <Link className="admin-nav-item" href="/admin#partners"><span>◇</span> Professional partners</Link>
        <p className="admin-nav-label">BUSINESS CONTROL</p>
        <Link className="admin-nav-item" href="/admin#finance"><span>₦</span> Finance overview</Link>
        <Link className="admin-nav-item" href="/admin#divisions"><span>▥</span> Divisions</Link>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Managing Director</strong><small>OWNER ACCESS</small></span></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / WORKSPACE / ENQUIRIES</span><h1>Enquiry register</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
        <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">CLIENT RELATIONSHIP INTAKE</p><h2>Every opportunity starts with a conversation.</h2><p>Review incoming requests and keep their progress status up to date.</p></div><span className="admin-welcome-mark">✉</span></div>
        <section className="crm-command-grid crm-enquiry-command" aria-label="Enquiry pipeline summary">
          <article className="crm-command-card crm-command-feature"><span className="crm-command-label">OPEN OPPORTUNITIES</span><strong>{(enquiries ?? []).filter((x) => !["converted","declined","closed"].includes(x.status)).length}</strong><p>Enquiries still moving through review or quotation</p><div className="crm-pipeline-track">{statuses.map((status) => <i key={status} data-stage={status} style={{flexGrow:Math.max(1,(enquiries ?? []).filter((x) => x.status === status).length)}} />)}</div><small>Live status distribution · latest 100 enquiries</small></article>
          {statuses.slice(0,4).map((status) => <article className="crm-command-card" key={status}><span className="crm-command-label">{status.replaceAll("_"," ").toUpperCase()}</span><strong>{(enquiries ?? []).filter((x) => x.status === status).length}</strong><p>Records in this stage</p></article>)}
        </section>
        <form method="get" action="/admin/enquiries" className="admin-panel enquiry-filter-bar">
          <label>Search enquiries<input type="search" name="q" placeholder="Name, email, phone, reference or subject" defaultValue={params.q || ""} maxLength={80}/></label>
          <label>Pipeline status<select name="status" defaultValue={selectedStatus}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_"," ")}</option>)}</select></label>
          <div className="enquiry-filter-actions"><button type="submit">Apply filters</button><Link href="/admin/enquiries">Clear</Link></div>
        </form>
        {params.updated === "1" && <p className="admin-notice">Enquiry status updated successfully.</p>}
        {params.error && <p className="admin-alert">The update could not be completed. Please check the record and try again.</p>}
        {error ? <p className="admin-alert">The enquiry register could not be loaded. Check database permissions and try again.</p> : (
          <section className="admin-panel admin-register-panel">
            <div className="admin-panel-heading"><div><h2>{searchTerm || selectedStatus ? "Matching enquiries" : "All enquiries"}</h2><p>Up to 100 matching records, newest first. Use search and status filters to narrow the register.</p></div><span>{enquiries?.length ?? 0} shown</span></div>
            {enquiries?.length ? <div className="admin-enquiry-list">{enquiries.map((item) => <article key={item.id} className="admin-enquiry-record">
              <div className="admin-enquiry-main"><div className="admin-enquiry-meta"><strong>{item.reference_code || "UNREFERENCED"}</strong><span>{dateLabel(item.created_at)}</span><span className="admin-status">{item.status}</span></div>
                <h3>{item.subject || "General enquiry"}</h3><p className="admin-enquiry-person">{item.full_name}{item.organisation ? " · " + item.organisation : ""}</p>
                <p className="admin-enquiry-message">{item.message}</p>
                <div className="admin-enquiry-contact">{item.email && <a href={"mailto:" + item.email}>{item.email}</a>}{item.phone && <a href={"tel:" + item.phone}>{item.phone}</a>}</div>
                <p className="admin-enquiry-interest">{[item.service_interest, item.source].filter(Boolean).join(" · ")}</p>
              </div>
              <form action={updateEnquiryStatus} className="admin-status-form"><input type="hidden" name="enquiry_id" value={item.id}/><label>Update status<select name="status" defaultValue={item.status}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_"," ")}</option>)}</select></label><button type="submit">Save status</button></form>
            </article>)}</div> : <p className="admin-empty-note">{searchTerm || selectedStatus ? "No enquiries match these filters. Try a broader search or clear the filters." : "No enquiries have been received yet. New records submitted through the corporate website will appear here when the website is connected to this Supabase project."}</p>}
          </section>
        )}
        <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Enquiry management · Owner access</span></footer>
      </section>
    </main>
  );
}
