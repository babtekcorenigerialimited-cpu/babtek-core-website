import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {SignOutButton} from "@/components/admin/signout-button";
export const dynamic="force-dynamic";
export default async function TechnologyAdminPage(){
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 const {data:items,error}=await sb.from("product_initiatives").select("*").order("updated_at",{ascending:false}).limit(100);
 const initiatives=items??[];
 const visibilityCounts=initiatives.reduce((acc:any,item:any)=>{const key=String(item.visibility||"unspecified").toLowerCase();acc[key]=(acc[key]||0)+1;return acc;},{});
 const categoryCounts=initiatives.reduce((acc:any,item:any)=>{const key=String(item.category||"Uncategorised");acc[key]=(acc[key]||0)+1;return acc;},{});
 const visibilityEntries=Object.entries(visibilityCounts) as [string,number][];
 const categoryEntries=(Object.entries(categoryCounts) as [string,number][]).sort((a,b)=>b[1]-a[1]).slice(0,6);

 return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE CONTROL</small></span></Link><p className="admin-nav-label">COMMAND CENTRE</p><Link className="admin-nav-item" href="/admin">Enterprise overview</Link><Link className="admin-nav-item" href="/admin/platforms">Five integrated platforms</Link><Link className="admin-nav-item active" href="/admin/technology">Technology ecosystem</Link><Link className="admin-nav-item" href="/admin/content?type=product_initiatives">Product initiative editor</Link><div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Founder / Managing Director</strong><small>OWNER AUTHORITY</small></span></div></aside>
 <section className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / TECHNOLOGY & INNOVATION</span><h1>Technology ecosystem workspace</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin/platforms">Five platforms</Link><SignOutButton/></div></header>
 <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">FOUNDER-ONLY INITIATIVE OVERSIGHT</p><h2>Build and govern BABTEK's technology portfolio.</h2><p>Review software initiatives and keep their public descriptions and development status accurate. This is an initiative register, not yet a software release, deployment or product operations console.</p></div><span className="admin-welcome-mark">TECH</span></div>
 <div className="admin-section-heading"><div><h2>Technology initiatives</h2><p>Latest database records. Draft and planned concepts must not be represented as commercially available products.</p></div><Link className="admin-inline-link" href="/admin/content?type=product_initiatives">Create or edit initiatives →</Link></div>
 <section className="tech-portfolio-overview" aria-label="Technology portfolio visual overview">
  <div className="tech-portfolio-intro"><div><span className="admin-kicker">PORTFOLIO SNAPSHOT</span><h2>Initiatives at a glance</h2><p>Live distribution of recorded initiatives by publication state and category.</p></div><div className="tech-total"><strong>{error?"—":initiatives.length}</strong><span>RECORDED INITIATIVES</span></div></div>
  <div className="tech-portfolio-grid">
   <article className="tech-portfolio-panel"><div className="tech-panel-title"><span>01 / PUBLICATION STATE</span><strong>{visibilityEntries.length} states</strong></div>
    {error?<p className="admin-empty-note">Portfolio data is unavailable.</p>:visibilityEntries.length?<div className="tech-state-list">{visibilityEntries.map(([state,count])=><div className="tech-state-row" key={state}><div><span>{state.replace(/_/g," ")}</span><strong>{count}</strong></div><i><b style={{width:((count/Math.max(1,initiatives.length))*100)+"%"}}/></i></div>)}</div>:<p className="admin-empty-note">No initiative records yet. The chart will populate as approved records are added.</p>}
   </article>
   <article className="tech-portfolio-panel"><div className="tech-panel-title"><span>02 / INITIATIVE CATEGORIES</span><strong>{categoryEntries.length} shown</strong></div>
    {error?<p className="admin-empty-note">Portfolio data is unavailable.</p>:categoryEntries.length?<div className="tech-category-grid">{categoryEntries.map(([category,count],i)=><div className="tech-category-card" key={category}><span>{String(i+1).padStart(2,"0")}</span><strong>{category}</strong><b>{count}</b><small>{count===1?"initiative":"initiatives"}</small></div>)}</div>:<p className="admin-empty-note">Categories will appear here when initiative records are added.</p>}
   </article>
  </div>
  <p className="tech-portfolio-note">This overview uses the initiative register only. It does not imply product releases, software deployments, revenue or active development teams.</p>
 </section>
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Initiative register</h2><p>Manage initiative names, summaries, descriptions, categories, public URLs and publication states.</p></div><span>{items?.length??0} records</span></div>{error?<p className="admin-alert">Technology initiatives could not be loaded. Check table permissions and database connectivity.</p>:items?.length?<div className="admin-record-list">{items.map((x:any)=><article key={x.id}><div><strong>{x.name}</strong><p>{x.category||"Technology initiative"} · {x.summary||"No summary recorded"}</p><Link className="admin-inline-link" href={"/admin/content?type=product_initiatives&edit="+x.id}>Edit initiative →</Link></div><span className="admin-status">{x.visibility||"draft"}</span></article>)}</div>:<p className="admin-empty-note">No technology initiatives are recorded yet. Add the approved BABTEK initiatives through the product initiative editor.</p>}</section>
 <section className="admin-panel access-guidance"><h2>Current scope and next development</h2><p className="admin-empty-note">This workspace currently manages the initiative catalogue. Product roadmaps, version and release records, software access, licensing, deployment monitoring, integration credentials and product-specific support workflows are future capabilities. Do not store secrets or API keys in public content records.</p></section>
 <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Technology initiative oversight · Founder-only</span></footer></section></main>;
}
