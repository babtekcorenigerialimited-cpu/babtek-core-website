import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/signout-button";
import { LiveWorkspaceRefresh } from "@/components/portal/live-workspace-refresh";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const metadata: Metadata={title:"Notifications | BABTEK"};
export const dynamic="force-dynamic";
const dateLabel=(v:string)=>new Intl.DateTimeFormat("en-NG",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));

export default async function NotificationsPage({searchParams}:{searchParams:Promise<{updated?:string;error?:string}>}){
 const params=await searchParams;
 const sb=await createSupabaseServerClient();
 const {data:{user},error}=await sb.auth.getUser();
 if(error||!user)redirect("/");
 const [{data:rows,error:loadError},{data:roles}]=await Promise.all([
  sb.from("user_notifications").select("id,event_type,title,body,href,entity_id,created_at,read_at").eq("recipient_id",user.id).order("created_at",{ascending:false}).limit(100),
  sb.from("user_roles").select("role").eq("user_id",user.id)
 ]);
 const notifications=rows||[];
 const unread=notifications.filter((n:any)=>!n.read_at).length;
 const roleList=(roles||[]).map((r:any)=>r.role);
 const home=roleList.includes("owner")||roleList.includes("administrator")||roleList.includes("operations")||roleList.includes("finance")||roleList.includes("content_manager")?"/admin":roleList.includes("partner")?"/partner":"/client";
 const label=(t:string)=>({message:"MESSAGE",file:"FILE REVIEW",milestone:"PROJECT MILESTONE",commercial:"COMMERCIAL",task:"TASK",payment:"PAYMENT"} as Record<string,string>)[t]||"UPDATE";
 const icon=(t:string)=>({message:"✉",file:"↥",milestone:"◷",commercial:"₦",task:"▤",payment:"₦"} as Record<string,string>)[t]||"•";
 return <main className="admin-shell"><aside className="admin-sidebar">
  <Link href="/" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>NOTIFICATION CENTRE</small></span></Link>
  <p className="admin-nav-label">WORKSPACE</p><Link className="admin-nav-item" href={home}>← Back to workspace</Link><Link className="admin-nav-item active" href="/notifications">◉ Notifications {unread>0&&<span className="notification-nav-count">{unread}</span>}</Link>
  <div className="admin-sidebar-bottom"><span className="admin-avatar">B</span><span><strong>BABTEK CORE</strong><small>SECURE ACCOUNT</small></span></div>
 </aside><section className="admin-main">
  <header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / WORKSPACE / NOTIFICATIONS</span><h1>Notification centre</h1></div><div className="admin-top-actions"><LiveWorkspaceRefresh/><span className="admin-form-note">{user.email}</span><SignOutButton/></div></header>
  <div className="admin-welcome admin-register-welcome notification-welcome"><div><p className="admin-kicker">YOUR ENTERPRISE ACTIVITY FEED</p><h2>Important updates, in one place.</h2><p>Messages, delivery changes, file reviews, commercial records and task or payment updates routed to this account.</p></div><span className="admin-welcome-mark">◉</span></div>
  {params.updated==="1"&&<p className="admin-notice">Notification read status updated.</p>}{params.error==="update"&&<p className="admin-alert">Your notification read status could not be updated. Please refresh and try again.</p>}
  <section className="notification-overview"><article><span>UNREAD</span><strong>{unread}</strong><small>Awaiting your attention</small></article><article><span>RECENT ACTIVITY</span><strong>{notifications.length}</strong><small>Latest 100 notifications</small></article><article><span>ACCOUNT</span><strong>{roleList.includes("owner")?"FOUNDER":roleList.includes("partner")?"PARTNER":roleList.includes("client")?"CLIENT":"STAFF"}</strong><small>Notifications are private to your account</small></article></section>
  <section className="admin-panel notification-panel"><div className="admin-panel-heading"><div><h2>Recent notifications</h2><p>Generated from recorded platform events. Unread items remain until you mark them as read.</p></div>{unread>0&&<form action={markAllNotificationsRead}><button className="notification-mark-all" type="submit">Mark all as read</button></form>}</div>
   {loadError?<p className="admin-alert">Notifications could not be loaded. Check your account access and try again.</p>:notifications.length?<div className="notification-list">{notifications.map((n:any)=><article className={"notification-item "+(!n.read_at?"is-unread":"")} key={n.id}><span className="notification-icon">{icon(n.event_type)}</span><div className="notification-copy"><div className="notification-meta"><span>{label(n.event_type)}</span><time>{dateLabel(n.created_at)}</time></div><h3>{n.title}</h3><p>{n.body}</p><div className="notification-actions"><Link href={n.href||home}>Open related workspace →</Link>{!n.read_at&&<form action={markNotificationRead}><input type="hidden" name="notification_id" value={n.id}/><button type="submit">Mark as read</button></form>}</div></div>{!n.read_at&&<span className="notification-unread-dot" aria-label="Unread"/>}</article>)}</div>:<div className="notification-empty"><span>◉</span><h3>You’re all caught up.</h3><p>When a relevant message, project change, file review or commercial update is recorded, it will appear here.</p></div>}
  </section>
  <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Private notifications · per-account access control</span></footer>
 </section></main>;
}
