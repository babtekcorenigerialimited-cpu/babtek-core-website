import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { createClient } from "./actions";
import { addClientContact } from "./contact-actions";

export const metadata: Metadata = { title: "Clients | BABTEK Owner Workspace" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ created?: string; contact?: string; error?: string; q?: string }> }) {
  const params = await searchParams;
  const searchTerm = (params.q || "").trim().slice(0, 80).replace(/[,%()_*\\.]/g, " ");
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  let clientQuery = supabase.from("clients")
    .select("id,legal_name,display_name,email,phone,created_at")
    .order("created_at", { ascending: false });
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    clientQuery = clientQuery.or([
      `legal_name.ilike.${term}`,
      `display_name.ilike.${term}`,
      `email.ilike.${term}`,
      `phone.ilike.${term}`
    ].join(","));
  }
  const { data: clients, error } = await clientQuery.limit(250);

  return <main className="admin-shell admin-register-page admin-client-register-page">
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
      {params.created === "1" && <p className="admin-notice">Client record created.</p>}{params.contact === "1" && <p className="admin-notice">Client contact saved. If an account UUID was supplied, access is now linked.</p>}{params.error === "account" && <p className="admin-alert">That account was not found or does not have the client role. Ask the client to register first.</p>}{params.error === "contact" && <p className="admin-alert">Contact details could not be saved. Check the account UUID and contact details.</p>}
      {params.error && <p className="admin-alert">{params.error === "required" ? "A legal or registered name is required." : "The client record could not be saved. Check permissions and try again."}</p>}
      <section className="crm-command-grid" aria-label="Client portfolio summary">
        <article className="crm-command-card crm-command-feature"><span className="crm-command-label">CLIENT PORTFOLIO</span><strong>{clients?.length ?? 0}</strong><p>Registered client organisations in this workspace</p><div className="crm-coverage-track"><i style={{width:((clients?.length ?? 0) ? Math.round((clients!.filter((x) => Boolean(x.email)).length/(clients!.length))*100) : 0)+"%"}} /></div><small>{clients?.filter((x) => Boolean(x.email)).length ?? 0} records include an email address</small></article>
        <article className="crm-command-card"><span className="crm-command-label">CONTACT COVERAGE</span><strong>{clients?.filter((x) => Boolean(x.phone)).length ?? 0}<em> / {clients?.length ?? 0}</em></strong><p>Client records with a phone number</p></article>
        <article className="crm-command-card"><span className="crm-command-label">REGISTER READINESS</span><strong>{clients?.filter((x) => Boolean(x.email && x.phone)).length ?? 0}</strong><p>Records with both email and phone details</p></article>
      </section>
      <section className="admin-panel admin-register-panel">
        <div className="admin-panel-heading"><div><h2>Add a client</h2><p>Register the client organisation first. Add named contacts and optionally link an existing verified client account.</p></div></div>
        <form action={createClient} className="admin-create-form">
          <label>Legal / registered name<input name="legal_name" required maxLength={200} /></label>
          <label>Display name<input name="display_name" maxLength={200} /></label>
          <label>Email<input name="email" type="email" maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" maxLength={40} /></label>
          <button type="submit">Create client record</button>
        </form>
      </section>
      <section className="admin-panel admin-register-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><h2>Registered clients</h2><p>{searchTerm ? "Matching client records." : "Latest 250 records, newest first."} Search the client register by organisation, contact email or phone.</p></div><span>{clients?.length ?? 0} shown</span></div>
        <form method="get" action="/admin/clients" className="enquiry-filter-bar client-filter-bar">
          <label>Find a client<input type="search" name="q" placeholder="Organisation, display name, email or phone" defaultValue={params.q || ""} maxLength={80}/></label>
          <div className="enquiry-filter-actions"><button type="submit">Search clients</button><Link href="/admin/clients">Clear</Link></div>
        </form>
        {error ? <p className="admin-alert">Client records could not be loaded.</p> : clients?.length ? <div className="admin-record-list">{clients.map((client) => <article key={client.id}><div><strong>{client.display_name || client.legal_name}</strong><p>{client.legal_name}{client.email ? " · " + client.email : ""}{client.phone ? " · " + client.phone : ""}</p></div><div className="client-contact-link"><form action={addClientContact} className="admin-create-form"><input type="hidden" name="client_id" value={client.id}/><label>Contact full name<input name="full_name" required maxLength={160}/></label><label>Contact email<input name="email" type="email" required maxLength={254}/></label><label>Phone<input name="phone" type="tel" maxLength={40}/></label><label>Client account user UUID (optional)<input name="user_id" placeholder="Link after client registration"/></label><button type="submit">Add contact / link account</button></form></div><span className="admin-status">CLIENT</span></article>)}</div> : <p className="admin-empty-note">{searchTerm ? "No client records match this search. Try a different name, email or phone number." : "No client records yet. Add genuine client records as engagements are established."}</p>}
      </section>
      <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Client records · Owner access</span></footer>
    </section>
  </main>;
}
