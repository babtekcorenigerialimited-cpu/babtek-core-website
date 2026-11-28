import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {SignOutButton} from "@/components/admin/signout-button";
import {LiveWorkspaceRefresh} from "@/components/portal/live-workspace-refresh";
export const dynamic="force-dynamic";
async function countRows(sb:any,table:string){const {count,error}=await sb.from(table).select("id",{count:"exact",head:true});return error?null:(count??0);}
const fmt=(v:number|null)=>v===null?"—":new Intl.NumberFormat("en-NG").format(v);
const workspaces=[
 {n:"01",name:"Corporate website",tag:"PUBLIC PRESENCE & PUBLISHING",description:"Manage BABTEK's public-facing pages, divisions, services, portfolio, insights and brand.",href:"/admin/workspaces/corporate",links:[["Content studio","/admin/content"],["Brand centre","/admin/brand"],["Divisions","/admin/divisions"]]},
 {n:"02",name:"Client management",tag:"ENQUIRIES & RELATIONSHIPS",description:"Handle incoming enquiries, client records, account linking, conversations and commercial documents.",href:"/admin/workspaces/clients",links:[["Enquiry inbox","/admin/enquiries"],["Client register","/admin/clients"],["Communications","/admin/communications"],["File reviews","/admin/file-submissions"]]},
 {n:"03",name:"Project operations",tag:"DELIVERY & COORDINATION",description:"Coordinate projects, independent specialists, milestones, tasks, documents and delivery progress.",href:"/admin/workspaces/projects",links:[["Project register","/admin/projects"],["Delivery performance","/admin/delivery"],["Partner network","/admin/partners"]]},
 {n:"04",name:"Administration & finance",tag:"FOUNDER CONTROL & GOVERNANCE",description:"Review recorded commercial activity, project margins, expenses, partner payments and access permissions.",href:"/admin/workspaces/finance",links:[["Finance centre","/admin/finance"],["Project profitability","/admin/finance/projects"],["Partner payments","/admin/finance/partners"],["Access control","/admin/access"]]},
 {n:"05",name:"Technology ecosystem",tag:"PRODUCTS & INNOVATION",description:"Oversee BABTEK software initiatives and their development status without presenting concepts as released products.",href:"/admin/workspaces/technology",links:[["Technology workspace","/admin/technology"],["Initiative editor","/admin/content?type=product_initiatives"],["Research & innovation","/research"]]}
];
export default async function AdminDashboardPage(){
 let sb:any;try{sb=await createSupabaseServerClient();}catch{return <main className="admin-empty"><h1>Platform configuration required</h1><p>Supabase connection settings are not configured for this deployment.</p></main>;}
 const {data:{user},error:userError}=await sb.auth.getUser();if(userError||!user)redirect("/admin/login");
 const {data:roles,error:roleError}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(roleError||!roles?.some((x:any)=>x.role==="owner"))return <main className="admin-empty"><h1>Access not authorised</h1><p>This control room is reserved for the BABTEK founder account.</p><SignOutButton/></main>;
 const [profile,enquiries,projects,clients,partners,unread]=await Promise.all([
  sb.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
  countRows(sb,"enquiries"),countRows(sb,"projects"),countRows(sb,"clients"),countRows(sb,"professional_partners"),
  sb.from("user_notifications").select("id",{count:"exact",head:true}).is("read_at",null)
 ]);
 const first=(profile.data?.full_name||"Founder").split(" ")[0];
 return <main className="admin-shell">
 <aside className="admin-sidebar"><Link href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>FOUNDER PORTAL</small></span></Link>
 <p className="admin-nav-label">FOUNDER HOME</p><Link className="admin-nav-item active" href="/admin">Workspace home</Link><Link className="admin-nav-item" href="/admin/platforms">Five platform workspaces</Link>
 <p className="admin-nav-label">WORKSPACES</p>{workspaces.map(w=><Link className="admin-nav-item" key={w.n} href={w.href}><span>{w.n}</span>{w.name}</Link>)}
 <p className="admin-nav-label">QUICK ACCESS</p><Link className="admin-nav-item" href="/notifications">Notification centre {unread.count? "("+unread.count+")":""}</Link><Link className="admin-nav-item" href="/admin/communications">Communication centre</Link><Link className="admin-nav-item" href="/admin/partners">Partner network</Link><Link className="admin-nav-item" href="/admin/access">User & access control</Link>
 <div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>{profile.data?.full_name||"Founder"}</strong><small>FOUNDER · OWNER AUTHORITY</small></span></div></aside>
 <section className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / FOUNDER PORTAL</span><h1>Workspace home</h1></div><div className="admin-top-actions"><LiveWorkspaceRefresh/><span className="admin-secure-label">● Founder-only session</span><SignOutButton/></div></header>
 <section className="admin-welcome"><div><p className="admin-kicker">BABTEK CORE NIGERIA LIMITED</p><h2>Welcome back, {first}.</h2><p>Your founder workspace. Choose a business environment below; each opens its own dedicated working pages.</p><Link className="admin-inline-link" href="/admin/platforms">Explore all five workspaces →</Link></div><span className="admin-welcome-mark">B</span></section>
 <div className="admin-section-heading"><div><h2>Business at a glance</h2><p>Current database record counts. These are not performance claims or sample data.</p></div><span className="admin-live-label">LIVE DATABASE</span></div>
 <div className="admin-metric-grid"><Link className="admin-metric" href="/admin/enquiries"><span>ENQUIRIES</span><strong>{fmt(enquiries)}</strong><small>Open enquiry register</small></Link><Link className="admin-metric" href="/admin/projects"><span>PROJECTS</span><strong>{fmt(projects)}</strong><small>Project operations</small></Link><Link className="admin-metric" href="/admin/clients"><span>CLIENTS</span><strong>{fmt(clients)}</strong><small>Client register</small></Link><Link className="admin-metric" href="/admin/partners"><span>PROFESSIONAL PARTNERS</span><strong>{fmt(partners)}</strong><small>Partner network</small></Link></div>
 <div className="admin-section-heading"><div><h2>Choose a workspace</h2><p>Separate environments for distinct areas of the enterprise—not one overloaded dashboard.</p></div><Link className="admin-inline-link" href="/admin/platforms">View workspace directory →</Link></div>
 <div className="admin-five-grid">{workspaces.map(w=><article className="admin-module-card" key={w.n}><div className="admin-module-top"><span>{w.n}</span><em>{w.tag}</em></div><h3>{w.name}</h3><p>{w.description}</p><div className="admin-workspace-links">{w.links.map(([label,href])=><Link className="admin-inline-link" key={href} href={href}>{label} ↗</Link>)}</div><Link className="admin-module-link" href={w.href}>Enter workspace →</Link></article>)}</div>
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Founder shortcuts</h2><p>Frequently used controls, kept separate from the workspace overview.</p></div></div><div className="admin-workspace-links"><Link className="admin-inline-link" href="/admin/finance">Finance & commercial →</Link><Link className="admin-inline-link" href="/admin/communications">Messages →</Link><Link className="admin-inline-link" href="/notifications">Notifications →</Link><Link className="admin-inline-link" href="/admin/brand">Brand management →</Link><Link className="admin-inline-link" href="/admin/access">Access governance →</Link></div></section>
 <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Founder workspace · Development environment</span></footer></section></main>;
}