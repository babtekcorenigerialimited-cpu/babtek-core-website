import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { sendCommunicationMessage, sendClientProjectReply, sendPartnerProjectReply } from "./actions";

export const metadata: Metadata = { title: "Communication Centre | BABTEK" };
export const dynamic = "force-dynamic";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<{ sent?: string; replied?: string; partner_replied?:string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => ["owner", "administrator", "operations"].includes(item.role))) redirect("/admin");

  const [{ data: enquiries, error: enquiryError }, { data: messages, error: messageError }] = await Promise.all([
    supabase.from("enquiries").select("id,reference_code,full_name,email,subject,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("communication_messages").select("id,enquiry_id,project_id,sender_id,body,message_type,created_at").order("created_at", { ascending: false }).limit(300),
  ]);
  const { data: projectRows } = await supabase.from("projects").select("id,project_code,name,client_id").order("created_at",{ascending:false}).limit(100);
  const senderIds = [...new Set((messages || []).map((item) => item.sender_id))];
  const { data: profiles } = senderIds.length ? await supabase.from("profiles").select("id,full_name").in("id", senderIds) : { data: [] as {id:string;full_name:string|null}[] };
  const senderNames = new Map((profiles || []).map((profile) => [profile.id, profile.full_name || "BABTEK team member"]));
  const messagesByProject = new Map<string, typeof messages>();
  for (const message of messages || []) { if (!message.project_id) continue; const current=messagesByProject.get(message.project_id)||[]; current.push(message); messagesByProject.set(message.project_id,current); }
  const messagesByEnquiry = new Map<string, typeof messages>();
  for (const message of messages || []) {
    if (!message.enquiry_id) continue;
    const current = messagesByEnquiry.get(message.enquiry_id) || [];
    current.push(message);
    messagesByEnquiry.set(message.enquiry_id, current);
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE PLATFORM</small></span></a>
        <p className="admin-nav-label">WORKSPACE</p>
        <Link className="admin-nav-item" href="/admin">▦ Overview</Link>
        <Link className="admin-nav-item" href="/admin/enquiries">✉ Enquiries</Link>
        <Link className="admin-nav-item active" href="/admin/communications">☷ Communication centre</Link>
        <Link className="admin-nav-item" href="/admin#projects">▤ Projects</Link>
        <Link className="admin-nav-item" href="/admin#clients">◉ Clients</Link>
        <Link className="admin-nav-item" href="/admin/partners">◇ Professional partners</Link>
        <p className="admin-nav-label">BUSINESS CONTROL</p>
        <Link className="admin-nav-item" href="/admin/brand">Brand management</Link>
        <Link className="admin-nav-item" href="/admin/content">Website content</Link>
        <Link className="admin-nav-item" href="/admin/access">User access</Link>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>BABTEK workspace</strong><small>STAFF ACCESS</small></span></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / WORKSPACE / COMMUNICATIONS</span><h1>Communication centre</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton /></div></header>
        <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">RELATIONSHIP & PROJECT RECORD</p><h2>Keep every project conversation organised.</h2><p>Internal notes are attached to enquiry records and visible to authorised BABTEK staff.</p></div><span className="admin-welcome-mark">☷</span></div>
        {params.sent === "1" && <p className="admin-notice">Internal note saved to the enquiry record.</p>}{params.replied === "1" && <p className="admin-notice">Client-facing project reply saved and is visible in the client portal.</p>}{params.partner_replied==="1"&&<p className="admin-notice">Partner reply saved and is visible to linked partner accounts.</p>}
        {params.error && <p className="admin-alert">The message could not be saved. Check the text and your access, then try again.</p>}
        <div className="admin-comms-notice"><strong>Current release: project conversations and internal notes</strong><p>Linked clients can exchange project messages with authorised BABTEK staff. Assigned independent partners can exchange project messages with authorised BABTEK staff. Enquiry notes remain internal to BABTEK. Messages are stored in the platform; email, WhatsApp, SMS, live presence, unread counters and push notifications are not yet connected.</p></div>
        {enquiryError || messageError ? <p className="admin-alert">Communication records could not be loaded. Check database permissions.</p> : (
          <section className="admin-panel admin-register-panel">
            <div className="admin-panel-heading"><div><h2>Enquiry conversations</h2><p>Latest 100 enquiries · latest 300 internal notes across the workspace.</p></div><span>{enquiries?.length || 0} enquiries</span></div>
            {enquiries?.length ? enquiries.map((enquiry) => {
              const thread = messagesByEnquiry.get(enquiry.id) || [];
              return <article className="admin-comms-thread" key={enquiry.id}>
                <div className="admin-comms-thread-head"><div><span>{enquiry.reference_code}</span><h3>{enquiry.subject}</h3><p>{enquiry.full_name} · {enquiry.email}</p></div><span className="admin-status">{enquiry.status}</span></div>
                {thread.length ? <div className="admin-comms-history">{thread.slice(0, 8).reverse().map((message) => <div className="admin-comms-message" key={message.id}><div><strong>{senderNames.get(message.sender_id) || "BABTEK team member"}</strong><time>{dateLabel(message.created_at)}</time></div><p>{message.body}</p><small>INTERNAL NOTE</small></div>)}</div> : <p className="admin-empty-note">No internal notes on this enquiry yet.</p>}
                <form action={sendCommunicationMessage} className="admin-comms-compose"><input type="hidden" name="enquiry_id" value={enquiry.id}/><label htmlFor={"note-"+enquiry.id}>Add an internal note</label><textarea id={"note-"+enquiry.id} name="body" rows={3} maxLength={10000} required placeholder="Record a follow-up, decision, assignment or next action…"/><button type="submit">Save internal note</button></form>
              </article>;
            }) : <p className="admin-empty-note">No enquiries are available to start a conversation record.</p>}
          </section>
        )}
        <section className="admin-panel admin-register-panel">
          <div className="admin-panel-heading"><div><h2>Client project conversations</h2><p>Messages marked as client replies are visible to the linked client contact in their secure portal.</p></div><span>{projectRows?.length||0} projects</span></div>
          {projectRows?.length ? projectRows.map((project:any)=>{const thread=(messagesByProject.get(project.id)||[]).filter((m:any)=>m.message_type==="client_reply");return <article className="admin-comms-thread" key={project.id}><div className="admin-comms-thread-head"><div><span>{project.project_code}</span><h3>{project.name}</h3><p>Client-facing conversation · {thread.length} messages</p></div></div>{thread.length?<div className="admin-comms-history">{thread.slice(0,12).reverse().map((message:any)=><div className="admin-comms-message" key={message.id}><div><strong>{senderNames.get(message.sender_id)||"BABTEK team member"}</strong><time>{dateLabel(message.created_at)}</time></div><p>{message.body}</p><small>CLIENT VISIBLE</small></div>)}</div>:<p className="admin-empty-note">No client-visible messages yet.</p>}<form action={sendClientProjectReply} className="admin-comms-compose"><input type="hidden" name="project_id" value={project.id}/><label>Reply to client</label><textarea name="body" rows={3} maxLength={10000} required placeholder="Write a message that the linked client can see…"/><button type="submit">Send client reply</button></form></article>}) : <p className="admin-empty-note">No projects are registered yet.</p>}
        </section>
        <section className="admin-panel admin-register-panel"><div className="admin-panel-heading"><div><h2>Partner project conversations</h2><p>Private discussion between assigned independent professionals and authorised BABTEK staff.</p></div></div>{projectRows?.length?projectRows.map((project:any)=>{const thread=(messagesByProject.get(project.id)||[]).filter((m:any)=>m.message_type==="partner_update").slice(0,20).reverse();return <article className="admin-comms-thread" key={"partner-"+project.id}><div className="admin-comms-thread-head"><div><span>{project.project_code}</span><h3>{project.name}</h3><p>Partner messages · {thread.length} recent messages</p></div></div>{thread.length?thread.map((m:any)=><div className="admin-comms-message" key={m.id}><div><strong>{senderNames.get(m.sender_id)||"BABTEK / partner"}</strong><time>{dateLabel(m.created_at)}</time></div><p>{m.body}</p><small>PARTNER DISCUSSION</small></div>):<p className="admin-empty-note">No partner discussion yet.</p>}<form action={sendPartnerProjectReply} className="admin-comms-compose"><input type="hidden" name="project_id" value={project.id}/><label>Reply to assigned partner(s)</label><textarea name="body" rows={3} maxLength={10000} required placeholder="Clarify scope, respond to a question or give a project instruction…"/><button type="submit">Send partner reply</button></form></article>}):<p className="admin-empty-note">No projects registered.</p>}</section><footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Communication centre · authorised staff</span></footer>
      </section>
    </main>
  );
}
