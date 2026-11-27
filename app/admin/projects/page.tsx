import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { updateProjectStatus } from "./actions";
import { createPartnerEngagement, createPartnerPaymentSchedule } from "./partner-actions";
import { createProjectTask } from "./delivery-actions";
import { ProjectDocumentUploader } from "@/components/admin/project-document-uploader";

export const metadata: Metadata = { title: "Projects | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

const statuses = ["proposed", "ongoing", "on_hold", "completed", "cancelled"] as const;
const money = (value: number, currency: string) => new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(value);

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ updated?: string; engaged?: string; scheduled?: string; task_created?: string; document_uploaded?: string; error?: string }> }) {
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
    supabase.from("professional_partners").select("id,legal_name,trading_name,professional_category").order("created_at", { ascending: false }).limit(500),
  ]);
  const clientNames = new Map((clientResult.data || []).map((client) => [client.id, client.display_name || client.legal_name]));
  const projects = projectResult.data || [];
  const partners = partnerResult.data || [];
  const projectIds = projects.map((project) => project.id);
  const { data: engagements } = projectIds.length ? await supabase.from("project_partner_engagements").select("id,project_id,partner_id,scope_of_work,agreed_fee,currency_code,payment_terms,status,start_date,due_date").in("project_id", projectIds).order("created_at", { ascending: false }) : { data: [] as any[] };
  const engagementIds = (engagements || []).map((engagement) => engagement.id);
  const { data: paymentSchedules } = engagementIds.length ? await supabase.from("partner_payment_schedules").select("id,engagement_id,description,amount,due_date,status,paid_amount").in("engagement_id", engagementIds).order("due_date", { ascending: true }) : { data: [] as any[] };
  const partnerNames = new Map(partners.map((partner) => [partner.id, partner.trading_name || partner.legal_name]));
  const [{ data: projectTasks }, { data: projectDocuments }] = projectIds.length ? await Promise.all([
    supabase.from("project_tasks").select("id,project_id,title,description,status,priority,assigned_partner_id,due_date").in("project_id", projectIds).order("created_at", { ascending: false }),
    supabase.from("project_documents").select("id,project_id,title,document_type,version_label,client_visible,partner_visible,created_at").in("project_id", projectIds).order("created_at", { ascending: false }),
  ]) : [{ data: [] as any[] }, { data: [] as any[] }];

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
        {params.updated === "1" && <p className="admin-notice">Project status updated successfully.</p>}{params.engaged === "1" && <p className="admin-notice">Independent partner engagement created.</p>}{params.scheduled === "1" && <p className="admin-notice">Partner payment schedule created.</p>}{params.task_created === "1" && <p className="admin-notice">Project task created.</p>}{params.document_uploaded === "1" && <p className="admin-notice">Project document uploaded securely.</p>}
        {params.error && <p className="admin-alert">{params.error === "engagement" ? "Partner engagement could not be created. Check the project, partner and scope." : params.error === "schedule" ? "Payment schedule could not be created. Check the engagement and amount." : params.error === "task" ? "Task could not be created. Confirm the project and any selected partner engagement." : params.error === "document" ? "Document upload failed. Check the file type, size (maximum 50 MB) and project access." : "The project update could not be completed. Please check the record and try again."}</p>}
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
              <section className="project-delivery-manager">
                <div className="admin-panel-heading"><div><h4>Task assignment & delivery</h4><p>Create actionable work items and assign them to a linked specialist.</p></div><span>{(projectTasks || []).filter((task) => task.project_id === item.id).length} tasks</span></div>
                <div className="project-delivery-list">{(projectTasks || []).filter((task) => task.project_id === item.id).map((task) => <article key={task.id}><div><strong>{task.title}</strong><p>{task.description || "No additional instructions"} · {task.priority} priority · Due {task.due_date || "Not set"}</p></div><span className="admin-status">{task.status.replaceAll("_"," ")}</span><small>{task.assigned_partner_id ? partnerNames.get(task.assigned_partner_id) || "Assigned partner" : "Unassigned"}</small></article>)}{!(projectTasks || []).some((task) => task.project_id === item.id) && <p className="admin-empty-note">No tasks created for this project yet.</p>}</div>
                <form action={createProjectTask} className="project-engagement-form">
                  <input type="hidden" name="project_id" value={item.id}/>
                  <div className="project-engagement-fields"><label>Task title<input name="title" required minLength={3} maxLength={180} placeholder="e.g. Prepare structural drawings"/></label><label>Assign partner<select name="assigned_partner_id" defaultValue=""><option value="">Keep unassigned</option>{(engagements || []).filter((engagement) => engagement.project_id === item.id).map((engagement) => <option key={engagement.id} value={engagement.partner_id}>{partnerNames.get(engagement.partner_id) || "Professional partner"}</option>)}</select></label><label>Priority<select name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>Due date<input name="due_date" type="date"/></label></div>
                  <label>Task instructions<textarea name="description" rows={2} maxLength={3000} placeholder="Define the expected output, reference details and acceptance criteria"/></label>
                  <button type="submit">Create project task</button>
                </form>
              </section>
              <section className="project-delivery-manager">
                <div className="admin-panel-heading"><div><h4>Project document library</h4><p>Store project files privately and explicitly choose who may see each file.</p></div><span>{(projectDocuments || []).filter((doc) => doc.project_id === item.id).length} files</span></div>
                <div className="project-document-list">{(projectDocuments || []).filter((doc) => doc.project_id === item.id).map((doc) => <article key={doc.id}><div><strong>{doc.title}</strong><p>{doc.document_type || "Project document"} · {doc.version_label || "No version label"}</p></div><span className={doc.client_visible ? "admin-status" : "admin-status muted"}>Client: {doc.client_visible ? "Visible" : "Private"}</span><span className={doc.partner_visible ? "admin-status" : "admin-status muted"}>Partner: {doc.partner_visible ? "Visible" : "Private"}</span></article>)}{!(projectDocuments || []).some((doc) => doc.project_id === item.id) && <p className="admin-empty-note">No documents have been uploaded.</p>}</div>
                <ProjectDocumentUploader projectId={item.id}/>         </form>
              </section>
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
