import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";

export const dynamic = "force-dynamic";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
const pct = (n:number) => Math.max(0, Math.min(100, Math.round(n || 0)));

function Metric({ label, value, note, href }: {label:string;value:number|string;note:string;href?:string}) {
  const body = <><span>{label}</span><strong>{value}</strong><small>{note}</small></>;
  return href ? <Link className="admin-metric" href={href}>{body}</Link> : <div className="admin-metric">{body}</div>;
}

export default async function DeliveryDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((r:any) => r.role === "owner")) return <main className="admin-empty"><h1>Access not authorised</h1><p>This delivery dashboard is reserved for the BABTEK founder.</p><SignOutButton/></main>;

  const [projectRes, milestoneRes, taskRes] = await Promise.all([
    supabase.from("projects").select("id,project_code,name,status,target_end_date").order("created_at", { ascending: false }).limit(500),
    supabase.from("project_milestones").select("id,project_id,title,due_date,status,progress_percent,acceptance_status,delay_reason,client_visible").order("due_date", { ascending: true }).limit(2000),
    supabase.from("project_tasks").select("id,project_id,title,status,priority,due_date").order("due_date", { ascending: true }).limit(2000)
  ]);
  const projects = projectRes.data || [];
  const milestones = milestoneRes.data || [];
  const tasks = taskRes.data || [];
  const byProject = new Map(projects.map(p => [p.id, p]));
  const activeProjects = projects.filter(p => ["proposed","ongoing","on_hold"].includes(p.status));
  const overdueMilestones = milestones.filter(m => m.due_date && m.due_date < today && !["completed","cancelled"].includes(m.status));
  const delayedMilestones = milestones.filter(m => m.status === "delayed");
  const pendingAcceptance = milestones.filter(m => ["submitted","changes_requested"].includes(m.acceptance_status));
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && !["completed","cancelled"].includes(t.status));
  const avgProgress = milestones.length ? Math.round(milestones.reduce((sum,m) => sum + Number(m.progress_percent || 0), 0) / milestones.length) : null;
  const projectsWithMilestones = new Set(milestones.map(m => m.project_id)).size;
  const issuesByProject = (projectId:string) => ({
    overdue: overdueMilestones.filter(m => m.project_id === projectId).length,
    delayed: delayedMilestones.filter(m => m.project_id === projectId).length,
    openTasks: tasks.filter(t => t.project_id === projectId && !["completed","cancelled"].includes(t.status)).length
  });

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE CONTROL</small></span></Link>
      <p className="admin-nav-label">COMMAND CENTRE</p>
      <Link className="admin-nav-item" href="/admin">Enterprise overview</Link>
      <Link className="admin-nav-item active" href="/admin/delivery">Delivery performance</Link>
      <p className="admin-nav-label">PROJECT OPERATIONS</p>
      <Link className="admin-nav-item" href="/admin/projects">Project register & delivery</Link>
      <Link className="admin-nav-item" href="/admin/partners">Professional partners</Link>
      <Link className="admin-nav-item" href="/admin/communications">Communication centre</Link>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>BABTEK Founder</strong><small>OWNER AUTHORITY</small></span></div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / PROJECT OPERATIONS / DELIVERY</span><h1>Delivery performance</h1></div><div className="admin-top-actions"><span className="admin-secure-label">Founder-only view</span><SignOutButton/></div></header>
      <div className="admin-welcome"><div><p className="admin-kicker">PROJECT DELIVERY INTELLIGENCE</p><h2>See what is moving, delayed or awaiting approval.</h2><p>Portfolio-wide reporting from actual project, milestone and task records. Reporting date: {today} (Nigeria).</p></div><span className="admin-welcome-mark">B</span></div>
      <div className="admin-section-heading"><div><h2>Delivery at a glance</h2><p>Milestone progress is averaged across recorded milestones only; projects without milestones are not assigned an assumed percentage.</p></div><span className="admin-live-label">LIVE DATABASE VIEW</span></div>
      <div className="admin-metric-grid">
        <Metric label="REGISTERED PROJECTS" value={projects.length} note={activeProjects.length + " proposed / active / on hold"} href="/admin/projects"/>
        <Metric label="MILESTONES RECORDED" value={milestones.length} note={projectsWithMilestones + " projects with milestones"}/>
        <Metric label="AVERAGE MILESTONE PROGRESS" value={avgProgress === null ? "—" : avgProgress + "%"} note={avgProgress === null ? "No milestone data yet" : "Simple average across recorded milestones"}/>
        <Metric label="OVERDUE MILESTONES" value={overdueMilestones.length} note="Past due and not completed"/>
        <Metric label="DELAYED MILESTONES" value={delayedMilestones.length} note="Explicitly marked delayed"/>
        <Metric label="OVERDUE TASKS" value={overdueTasks.length} note="Past due and not completed"/>
        <Metric label="AWAITING ACCEPTANCE" value={pendingAcceptance.length} note="Submitted or changes requested"/>
        <Metric label="OPEN TASKS" value={tasks.filter(t => !["completed","cancelled"].includes(t.status)).length} note="Across all registered projects"/>
      </div>

      <section className="admin-panel admin-register-panel delivery-exceptions">
        <div className="admin-panel-heading"><div><h2>Attention required</h2><p>Items requiring follow-up, correction, approval or a recovery plan.</p></div></div>
        <div className="delivery-exception-grid">
          <article><strong>{overdueMilestones.length}</strong><h3>Overdue milestones</h3><p>{overdueMilestones.length ? "Review revised dates, blockers and recovery actions in the project register." : "No overdue milestones are currently recorded."}</p></article>
          <article><strong>{delayedMilestones.length}</strong><h3>Delayed stages</h3><p>{delayedMilestones.length ? "Review each delay reason and agree a recovery plan." : "No milestones are currently marked delayed."}</p></article>
          <article><strong>{overdueTasks.length}</strong><h3>Overdue tasks</h3><p>{overdueTasks.length ? "Follow up with assigned specialists or re-plan the task." : "No overdue tasks are currently recorded."}</p></article>
          <article><strong>{pendingAcceptance.length}</strong><h3>Acceptance decisions</h3><p>{pendingAcceptance.length ? "Review submitted deliverables or requested changes." : "No milestone acceptance decisions are pending."}</p></article>
        </div>
      </section>

      <section className="admin-panel admin-register-panel">
        <div className="admin-panel-heading"><div><h2>Project delivery register</h2><p>Project-level progress, milestone exceptions and outstanding task counts.</p></div><span>{projects.length} projects</span></div>
        {projectRes.error || milestoneRes.error || taskRes.error ? <p className="admin-alert">One or more delivery data sets could not be loaded. Check database access and refresh.</p> :
        projects.length ? <div className="delivery-project-list">{projects.map(project => {
          const ms = milestones.filter(m => m.project_id === project.id);
          const projectProgress = ms.length ? Math.round(ms.reduce((sum,m) => sum + Number(m.progress_percent || 0),0) / ms.length) : null;
          const issues = issuesByProject(project.id);
          return <article className="delivery-project-card" key={project.id}>
            <div className="delivery-project-title"><div><span className="admin-status">{project.project_code || project.status.replaceAll("_"," ")}</span><h3>{project.name}</h3><small>Target completion: {project.target_end_date || "Not set"}</small></div><strong>{projectProgress === null ? "Not tracked" : projectProgress + "%"}</strong></div>
            {projectProgress !== null && <div className="project-milestone-progress"><span style={{width:pct(projectProgress)+"%"}}/></div>}
            <div className="delivery-project-facts"><span>{ms.length} milestones</span><span>{issues.overdue} overdue</span><span>{issues.delayed} delayed</span><span>{issues.openTasks} open tasks</span><span>{tasks.filter(t => t.project_id === project.id && t.due_date && t.due_date < today && !["completed","cancelled"].includes(t.status)).length} overdue tasks</span></div>
            {ms.length ? <div className="delivery-milestone-mini">{ms.map(m => <div key={m.id}><span>{m.title}</span><small>{m.progress_percent}% · {m.status.replaceAll("_"," ")} · Due {m.due_date || "not set"}</small></div>)}</div> : <p className="admin-empty-note">No milestones recorded. Add stages in the project register to enable meaningful delivery tracking.</p>}
            <Link className="admin-module-link" href="/admin/projects">Open project operations →</Link>
          </article>;
        })}</div> : <p className="admin-empty-note">No project records yet. Once genuine projects are registered, their delivery performance will appear here.</p>}
      </section>
      <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Delivery performance · Owner access · Internal operational reporting</span></footer>
    </section>
  </main>;
}
