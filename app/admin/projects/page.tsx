import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { updateProjectStatus } from "./actions";
import { createPartnerEngagement, createPartnerPaymentSchedule } from "./partner-actions";

export const metadata: Metadata = { title: "Projects | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

const statuses = ["proposed", "ongoing", "on_hold", "completed", "cancelled"] as const;
const money = (value: number, currency: string) => new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(value);

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ updated?: string; engaged?: string; scheduled?: string; error?: string }> }) {
  const params = await searchParams;
  let supabase;
  try { supabase = await createSupabaseServerClient(); }
  catch { return <main className="admin-empty"><h1>Platform configuration required</h1><p>Configure the Supabase environment before using the project register.</p></main>; }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const [projectResult, clientResult, partnerResult] = await Promise.all([
    supabase.from("projects").select("id,project_code,name,description,status,location_label,start_date,target_end_date,client_id,client_fee,currency_code").order("created_at", { ascending: false }).limit(100),
    supabase.from("clients").select("id,display_name,legal_name").limit(500),
  ]);
  const clientNames = new Map((clientResult.data || []).map((client) => [client.id, client.display_name || client.legal_name]));
  const projects = projectResult.data || [];
  const partners = partnerResult.data || [];
  const projectIds = projects.map((project) => project.id);
  const { data: engagements } = projectIds.length ? await supabase.from("project_partner_engagements").select("id,project_id,partner_id,scope_of_work,agreed_fee,currency_code,payment_terms,status,start_date,due_date").in("project_id", projectIds).order("created_at", { ascending: false }) : { data: [] as any[] };
  const engagementIds = (engagements || []).map((engagement) => engagement.id);
  const { data: paymentSchedules } = engagementIds.length ? await supabase.from("partner_payment_schedules").select("id,engagement_id,description,amount,due_date,status,paid_amount").in("engagement_id", engagementIds).order("due_date", { ascending: true }) : { data: [] as any[] };
  const partnerNames = new Map(partners.map((partner) => [partner.id, partner.trading_name || partner.legal_name]));

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
        <p className="admin-nav-label">WORKSPACE</p>
        <Link className="admin-nav-item" href="/admin"><span>▦</span> Overview</Link>
        <Link className="admin-nav-item" href="/admin/enquiries"><span>✉</span> Enquiries</Link>
        <Link className="admin-nav-item active" href="/admin/projects"><span>▤</span> Projects</Link>
        <Link className="admin-nav-item" href="/admin#clients"><span>◉</span> Clients</Link>
        <Link className="admin-nav-item" href="/admin#partners"><span>◇</span> Professional partners</Link>
        <p className="admin-nav-label">BUSINESS CONTROL</p>
        <Link className="admin-nav-item" href="/admin#finance"><span>₦</span> Finance overview</Link>
        <Link className="admin-nav-item" href="/admin#divisions"><span>▥</span> Divisions</Link>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Managing Director</strong><small>OWNER ACCESS</small></span></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / WORKSPACE / PROJECTS</span><h1>Project register</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
        <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">PROJECT DELIVERY CONTROL</p><h2>One coordinated view of every project.</h2><p>Track project status, client relationships and delivery timelines.</p></div><span className="admin-welcome-mark">▤</span></div>
        {params.updated === "1" && <p className="admin-notice">Project status updated successfully.</p>}{params.engaged === "1" && <p className="admin-notice">Independent partner engagement created.</p>}{params.scheduled === "1" && <p className="admin-notice">Partner payment schedule created.</p>}
        {params.error && <p className="admin-alert">{params.error === "engagement" ? "Partner engagement could not be created. Check the project, partner and scope." : params.error === "schedule" ? "Payment schedule could not be created. Check the engagement and amount." : "The project update could not be completed. Please check the record and try again."}</p>}
        {projectResult.error || clientResult.error || partnerResult.error ? <p className="admin-alert">The project register could not be loaded. Check database permissions and try again.</p> : (
          <section className="admin-panel admin-register-panel">
            <div className="admin-panel-heading"><div><h2>Registered projects</h2><p>Latest 100 records, newest first. No sample projects are fabricated.</p></div><span>{projects.length} shown</span></div>
            {projects.length ? <div className="admin-project-list">{projects.map((item) => <article key={item.id} className="admin-project-record">
              <div className="admin-project-main"><div className="admin-enquiry-meta"><strong>{item.project_code || "PROJECT RECORD"}</strong><span className="admin-status">{item.status.replaceAll("_"," ")}</span></div>
                <h3>{item.name}</h3><p className="admin-enquiry-person">{item.client_id ? clientNames.get(item.client_id) || "Client record" : "Client not linked"}{item.location_label ? " · " + item.location_label : ""}</p>
                {item.description && <p className="admin-enquiry-message">{item.description}</p>}
                <div className="admin-project-facts"><span>Client fee: {money(Number(item.client_fee || 0), item.currency_code || "NGN")}</span>{item.start_date && <span>Start: {item.start_date}</span>}{item.target_end_date && <span>Target: {item.target_end_date}</span>}</div>
              </div>
              <form action={updateProjectStatus} className="admin-status-form"><input type="hidden" name="project_id" value={item.id}/><label>Update status<select name="status" defaultValue={item.status}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_"," ")}</option>)}</select></label><button type="submit">Save status</button></form>
              <section className="project-partner-manager">
                <div className="admin-panel-heading"><div><h4>Independent specialist engagements</h4><p>Assign a verified professional partner to a defined project scope.</p></div><span>{(engagements || []).filter((e) => e.project_id === item.id).length} assigned</span></div>
                {(engagements || []).filter((e) => e.project_id === item.id).map((engagement) => {
                  const schedules = (paymentSchedules || []).filter((schedule) => schedule.engagement_id === engagement.id);
                  return <div className="project-partner-engagement" key={engagement.id}>
                    <div><strong>{partnerNames.get(engagement.partner_id) || "Professional partner"}</strong><p>{engagement.scope_of_work}</p><small>{engagement.status.replaceAll("_"," ")} · {money(Number(engagement.agreed_fee), engagement.currency_code || "NGN")} · Due {engagement.due_date || "Not set"}</small></div>
                    <div className="project-payment-schedule"><strong>Payment schedule</strong>{schedules.length ? schedules.map((schedule) => <p key={schedule.id}>{schedule.description} · {money(Number(schedule.amount), engagement.currency_code || "NGN")} · {schedule.status.replaceAll("_"," ")}</p>) : <p>No payment stages recorded.</p>}
                    <form action={createPartnerPaymentSchedule} className="partner-schedule-form"><input type="hidden" name="engagement_id" value={engagement.id}/><input name="description" required maxLength={300} placeholder="e.g. Initial design submission"/><input name="amount" type="number" min="0" step="0.01" required placeholder="Amount"/><input name="due_date" type="date"/><button type="submit">Add payment stage</button></form></div>
                  </div>;
                })}
                <form action={createPartnerEngagement} className="project-engagement-form">
                  <input type="hidden" name="project_id" value={item.id}/>
                  <label>Professional partner<select name="partner_id" required defaultValue=""><option value="" disabled>Select partner</option>{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.trading_name || partner.legal_name}{partner.professional_category ? " · " + partner.professional_category : ""}</option>)}</select></label>
                  <label>Scope of work<textarea name="scope_of_work" required minLength={10} maxLength={5000} rows={2} placeholder="Define the specialist deliverables and responsibilities"/></label>
                  <div className="project-engagement-fields"><label>Agreed fee (₦)<input name="agreed_fee" type="number" min="0" step="0.01" required/></label><label>Start date<input name="start_date" type="date"/></label><label>Due date<input name="due_date" type="date"/></label><label>Status<select name="status" defaultValue="proposed"><option value="proposed">Proposed</option><option value="accepted">Accepted</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label></div>
                  <label>Payment terms<input name="payment_terms" maxLength={2000} placeholder="Agreed stages, conditions or timing"/></label>
                  <button type="submit" disabled={!partners.length}>Assign partner to project</button>
                  {!partners.length && <small>Add the professional partner in the Partner Register before creating an engagement.</small>}
                </form>
              </section>
            </article>)}</div> : <p className="admin-empty-note">No projects have been registered yet. Create genuine project records as BABTEK wins and formally accepts engagements; do not use sample projects as company track record.</p>}
          </section>
        )}
        <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Project operations · Owner access</span></footer>
      </section>
    </main>
  );
}
