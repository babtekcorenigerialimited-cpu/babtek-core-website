import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {SignOutButton} from "@/components/admin/signout-button";
import {saveContent} from "./actions";

export const dynamic="force-dynamic";
const types=[
 {key:"site_pages",label:"Website pages",title:"title",sub:"excerpt",state:"visibility"},
 {key:"services",label:"Services",title:"name",sub:"summary",state:"visibility"},
 {key:"divisions",label:"Divisions",title:"name",sub:"summary",state:"visibility"},
 {key:"projects_public",label:"Public portfolio",title:"title",sub:"summary",state:"visibility"},
 {key:"insights",label:"Insights and news",title:"title",sub:"excerpt",state:"visibility"},
 {key:"careers",label:"Careers",title:"title",sub:"description",state:"visibility"},
 {key:"partnership_opportunities",label:"Partnership opportunities",title:"title",sub:"category",state:"visibility"},
 {key:"product_initiatives",label:"Technology products",title:"name",sub:"summary",state:"visibility"}
] as const;
export default async function ContentAdmin({searchParams}:{searchParams:Promise<{type?:string;saved?:string;error?:string}>}){
 const params=await searchParams;const selected=types.find(x=>x.key===params.type)||types[0];
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 const {data:records,error}=await sb.from(selected.key).select("*").order("updated_at",{ascending:false}).limit(100);
 const label=(v:any)=>String(v??"").replaceAll("_"," ");
 return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE CONTROL</small></span></Link><p className="admin-nav-label">COMMAND CENTRE</p><Link className="admin-nav-item" href="/admin">Enterprise overview</Link><Link className="admin-nav-item active" href="/admin/content">Website content</Link><Link className="admin-nav-item" href="/admin/brand">Brand management</Link><Link className="admin-nav-item" href="/admin/enquiries">Enquiries</Link><Link className="admin-nav-item" href="/admin/projects">Projects</Link><Link className="admin-nav-item" href="/admin/clients">Clients</Link><Link className="admin-nav-item" href="/admin/partners">Professional partners</Link><div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Founder</strong><small>OWNER AUTHORITY</small></span></div></aside>
 <section className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / CORPORATE WEBSITE</span><h1>Website content centre</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin">Overview</Link><SignOutButton/></div></header>
 <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">FOUNDER-ONLY CONTENT CONTROL</p><h2>Manage what the public sees.</h2><p>Create and update website content, save drafts, and publish approved material. Changes are stored in the connected BABTEK database.</p></div><span className="admin-welcome-mark">CMS</span></div>
 {params.saved==="1"&&<p className="admin-notice">Content saved successfully.</p>}{params.error&&<p className="admin-alert">Could not save: {params.error==="approval"?"Portfolio entries require explicit publication approval.":params.error==="required"?"Title and slug are required.":"Please check the fields and database permissions."}</p>}
 <nav className="cms-type-nav">{types.map(t=><Link key={t.key} className={selected.key===t.key?"active":""} href={"/admin/content?type="+t.key}>{t.label}</Link>)}</nav>
 <div className="admin-content-grid cms-layout"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Create {selected.label.toLowerCase()} record</h2><p>Required fields are marked. Use accurate, approved company information.</p></div><span>OWNER ONLY</span></div>
 <form action={saveContent} className="cms-form"><input type="hidden" name="table" value={selected.key}/><label>Title / name *<input name="title" required maxLength={180}/></label><label>URL slug<input name="slug" placeholder="generated-from-title"/></label><label>Short summary<textarea name="summary" rows={3}/></label><label>Description / body<textarea name="description" rows={6}/></label>
 {(selected.key==="divisions")&&<label>Business pillar<input name="pillar" defaultValue="Built Environment"/></label>}
 {(selected.key==="services"||selected.key==="divisions")&&<><label>Delivery lifecycle<input name="lifecycle" defaultValue="developing"/></label><label>Display order<input name="display_order" type="number" defaultValue="0"/></label></>}
 {(selected.key==="careers"||selected.key==="partnership_opportunities"||selected.key==="product_initiatives"||selected.key==="projects_public")&&<label>Category / type / status<input name="category" placeholder="e.g. Architecture, Software, Partner"/></label>}
 {(selected.key==="careers"||selected.key==="projects_public")&&<label>Location<input name="location"/></label>}
 {selected.key==="careers"&&<label>Application email<input name="email" type="email"/></label>}
 {selected.key==="product_initiatives"&&<label>Public product URL<input name="url" type="url"/></label>}
 {selected.key==="projects_public"&&<><label>Project delivery status<select name="project_status" defaultValue="proposed"><option value="proposed">Proposed</option><option value="ongoing">Ongoing</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label className="cms-check"><input type="checkbox" name="approved"/> I confirm this project has permission and approval for public portfolio use.</label></>}
 <label>Publication state<select name="visibility" defaultValue="draft"><option value="draft">Save as draft</option><option value="published">Publish</option><option value="archived">Archive</option></select></label><button type="submit">Save content record</button></form></section>
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>{selected.label}</h2><p>Latest 100 records. Choose a record below to review its current details.</p></div><span>{records?.length??0} shown</span></div>{error?<p className="admin-alert">Records could not be loaded. Check table permissions.</p>:records?.length?<div className="admin-record-list">{records.map((r:any)=><article key={r.id}><div><strong>{r[selected.title]}</strong><p>{r.slug||r.id} · {r[selected.sub]||"No summary"}</p></div><span className="admin-status">{label(r.visibility)}</span></article>)}</div>:<p className="admin-empty-note">No records yet. Use the form to create the first record.</p>}</section></div>
 <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Content management · Owner access</span></footer></section></main>;
}
