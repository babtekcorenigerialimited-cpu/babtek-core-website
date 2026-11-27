import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

export default async function AdminDashboardPage() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return <main className="admin-empty"><h1>Platform configuration required</h1><p>Supabase connection settings are not configured for this deployment yet.</p></main>;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/admin/login");

  const { data: roles, error: roleError } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id);
  const isOwner = roles?.some((item) => item.role === "owner");
  if (roleError || !isOwner) {
    return <main className="admin-empty"><h1>Access not authorised</h1><p>This account does not have the BABTEK owner role. Contact the platform owner if you believe this is an error.</p><SignOutButton /></main>;
  }

  const [profileResult, enquiryCount, projectCount, clientCount, partnerCount, invoiceResult, recentEnquiries, recentProjects, divisionCount] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("professional_partners").select("id", { count: "exact", head: true }),
    supabase.from("invoices").select("total_amount,status,currency_code").limit(500),
    supabase.from("enquiries").select("id,reference_code,full_name,subject,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("id,project_code,name,status,target_end_date").order("created_at", { ascending: false }).limit(5),
    supabase.from("divisions").select("id", { count: "exact", head: true }),
  ]);

  const invoices = invoiceResult.data ?? [];
  const outstanding = invoices
    .filter((invoice) => ["issued", "partially_paid", "overdue"].includes(invoice.status))
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const firstName = (profileResult.data?.full_name || "Founder").split(" ")[0];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
        <p className="admin-nav-label">WORKSPACE</p>
        <a className="admin-nav-item active" href="/admin"><span>▦</span> Overview</a>
        <a className="admin-nav-item" href="/admin/enquiries"><span>✉</span> Enquiries</a>
        <a className="admin-nav-item" href="/admin/projects"><span>▤</span> Projects</a>
        <a className="admin-nav-item" href="/admin/clients"><span>◉</span> Clients</a>
        <a className="admin-nav-item" href="/admin/partners"><span>◇</span> Professional partners</a>
        <p className="admin-nav-label">BUSINESS CONTROL</p>
        <a className="admin-nav-item" href="/admin#finance"><span>₦</span> Finance overview</a>
        <a className="admin-nav-item" href="/admin#divisions"><span>▥</span> Divisions</a>
        <a className="admin-nav-item" href="/admin/brand"><span>✦</span> Brand management</a>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>{profileResult.data?.full_name || "Managing Director"}</strong><small>OWNER ACCESS</small></span></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-breadcrumb">BABTEK / MANAGEMENT</span><h1>Enterprise overview</h1></div>
          <div className="admin-top-actions"><span className="admin-secure-label">● Secure owner session</span><SignOutButton /></div>
        </header>
        <div className="admin-welcome"><div><p className="admin-kicker">FOUNDER'S CONTROL ROOM</p><h2>Good to have you here, {firstName}.</h2><p>Your central view of BABTEK Core Nigeria Limited.</p></div><span className="admin-welcome-mark">B</span></div>

        <div className="admin-section-heading"><div><h2>Company snapshot</h2><p>Live records from the BABTEK platform database.</p></div><span className="admin-live-label">DATABASE CONNECTED</span></div>
        <div className="admin-metric-grid">
          <article className="admin-metric"><span>OPEN ENQUIRY RECORDS</span><strong>{enquiryCount.count ?? "—"}</strong><small>All recorded enquiries</small></article>
          <article className="admin-metric"><span>PROJECT RECORDS</span><strong>{projectCount.count ?? "—"}</strong><small>Projects registered</small></article>
          <Link className="admin-metric" id="clients" href="/admin/clients"><span>CLIENT RECORDS</span><strong>{clientCount.count ?? "—"}</strong><small>Open client register →</small></Link>
          <Link className="admin-metric" id="partners" href="/admin/partners"><span>PROFESSIONAL PARTNERS</span><strong>{partnerCount.count ?? "—"}</strong><small>Open partner register →</small></Link>
        </div>

        <div className="admin-content-grid">
          <section className="admin-panel" id="enquiries"><div className="admin-panel-heading"><div><h2>Recent enquiries</h2><p>Latest messages received by BABTEK.</p><Link className="admin-inline-link" href="/admin/enquiries">Open register →</Link></div><span>{enquiryCount.count ?? 0} total</span></div>
            {recentEnquiries.data?.length ? <div className="admin-record-list">{recentEnquiries.data.map((item) => <article key={item.id}><div><strong>{item.full_name}</strong><p>{item.subject || "General enquiry"} · {item.reference_code || "Unreferenced"}</p></div><span className="admin-status">{item.status}</span></article>)}</div> : <p className="admin-empty-note">No enquiry records are available yet. New website enquiries will appear here once the form is connected to the configured deployment.</p>}
          </section>
          <section className="admin-panel" id="projects"><div className="admin-panel-heading"><div><h2>Recent projects</h2><p>Project delivery register.</p><Link className="admin-inline-link" href="/admin/projects">Open register →</Link></div><span>{projectCount.count ?? 0} total</span></div>
            {recentProjects.data?.length ? <div className="admin-record-list">{recentProjects.data.map((item) => <article key={item.id}><div><strong>{item.name}</strong><p>{item.project_code || "Project"}{item.target_end_date ? " · Due " + item.target_end_date : ""}</p></div><span className="admin-status">{item.status}</span></article>)}</div> : <p className="admin-empty-note">No projects have been registered in the platform yet.</p>}
          </section>
        </div>

        <div className="admin-content-grid admin-lower-grid">
          <section className="admin-panel" id="finance"><div className="admin-panel-heading"><div><h2>Finance overview</h2><p>Outstanding invoice value, based on recorded invoice totals.</p></div><span>NGN</span></div><strong className="admin-finance-total">{money(outstanding)}</strong><p className="admin-footnote">This is not cash received, profit, or a reconciled accounts balance. Payments and overheads are not netted here.</p></section>
          <section className="admin-panel" id="divisions"><div className="admin-panel-heading"><div><h2>Enterprise structure</h2><p>Integrated business divisions.</p></div><span>{divisionCount.count ?? "—"} divisions</span></div><div className="admin-division-chips"><span>Design & Construction</span><span>Interiors</span><span>Real Estate</span><span>Smart Solutions</span><span>Academy</span><span>Ventures</span><span>Products & Supply</span><span>Research & Innovation</span></div></section>
        </div>
        <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED · BUILDING A BETTER FUTURE <span>Early platform release · Data shown reflects records currently entered.</span></footer>
      </section>
    </main>
  );
}
