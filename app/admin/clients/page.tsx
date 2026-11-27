import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { createClient } from "./actions";

export const metadata: Metadata = { title: "Clients | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const { data: clients, error } = await supabase.from("clients")
    .select("id,legal_name,display_name,email,phone,created_at")
    .order("created_at", { ascending: false }).limit(250);

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
      <p className="admin-nav-label">WORKSPACE</p>
      <Link className="admin-nav-item" href="/admin">▦ Overview</Link>
      <Link className="admin-nav-item" href="/admin/enquiries">✉ Enquiries</Link>
      <Link className="admin-nav-item" href="/admin/projects">▤ Projects</Link>
      <Link className="admin-nav-item active" href="/admin/clients">◉ Clients</Link>
      <Link className="admin-nav-item" href="/admin/partners">◇ Professional partners</Link>
      <p className="admin-nav-label">BUSINESS CONTROL</p>
      <Link className="admin-nav-item" href="/admin#finance">₦ Finance overview</Link>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Managing Director</strong><small>OWNER ACCESS</small></span></div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / RELATIONSHIPS / CLIENTS</span><h1>Client register</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
      <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">CLIENT RELATIONSHIP MANAGEMENT</p><h2>Build a reliable record of every client.</h2><p>Maintain client identities and contact details for project and commercial workflows.</p></div><span className="admin-welcome-mark">◉</span></div>
      {params.created === "1" && <p className="admin-notice">Client record created.</p>}
      {params.error && <p className="admin-alert">{params.error === "required" ? "A legal or registered name is required." : "The client record could not be saved. Check permissions and try again."}</p>}
      <section className="admin-panel admin-register-panel">
        <div className="admin-panel-heading"><div><h2>Add a client</h2><p>Register an individual or organisation. Account access is not created by this form.</p></div></div>
        <form action={createClient} className="admin-create-form">
          <label>Legal / registered name<input name="legal_name" required maxLength={200} /></label>
          <label>Display name<input name="display_name" maxLength={200} /></label>
          <label>Email<input name="email" type="email" maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" maxLength={40} /></label>
          <button type="submit">Create client record</button>
        </form>
      </section>
      <section className="admin-panel admin-register-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><h2>Registered clients</h2><p>Latest 250 records, newest first.</p></div><span>{clients?.length ?? 0} shown</span></div>
        {error ? <p className="admin-alert">Client records could not be loaded.</p> : clients?.length ? <div className="admin-record-list">{clients.map((client) => <article key={client.id}><div><strong>{client.display_name || client.legal_name}</strong><p>{client.legal_name}{client.email ? " · " + client.email : ""}{client.phone ? " · " + client.phone : ""}</p></div><span className="admin-status">CLIENT</span></article>)}</div> : <p className="admin-empty-note">No client records yet. Add genuine client records as engagements are established.</p>}
      </section>
      <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Client records · Owner access</span></footer>
    </section>
  </main>;
}
