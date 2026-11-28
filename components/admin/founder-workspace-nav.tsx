"use client";
import Link from "next/link";
import {usePathname,useSearchParams} from "next/navigation";
const spaces=[
 {id:"corporate",number:"01",name:"Corporate website",href:"/admin/workspaces/corporate",match:["/admin/content","/admin/brand","/admin/divisions"],tools:[["Workspace home","/admin/workspaces/corporate"],["Content studio","/admin/content"],["Brand centre","/admin/brand"],["Divisions","/admin/divisions"]]},
 {id:"clients",number:"02",name:"Client management",href:"/admin/workspaces/clients",match:["/admin/enquiries","/admin/clients","/admin/communications","/admin/file-submissions"],tools:[["Workspace home","/admin/workspaces/clients"],["Enquiries","/admin/enquiries"],["Client register","/admin/clients"],["Communications","/admin/communications"],["File review","/admin/file-submissions"]]},
 {id:"projects",number:"03",name:"Project operations",href:"/admin/workspaces/projects",match:["/admin/projects","/admin/delivery","/admin/partners"],tools:[["Workspace home","/admin/workspaces/projects"],["Project register","/admin/projects"],["Delivery","/admin/delivery"],["Partner network","/admin/partners"],["File review","/admin/file-submissions"]]},
 {id:"finance",number:"04",name:"Administration & finance",href:"/admin/workspaces/finance",match:["/admin/finance","/admin/access"],tools:[["Workspace home","/admin/workspaces/finance"],["Finance centre","/admin/finance"],["Project profitability","/admin/finance/projects"],["Partner payments","/admin/finance/partners"],["Access control","/admin/access"]]},
 {id:"technology",number:"05",name:"Technology ecosystem",href:"/admin/workspaces/technology",match:["/admin/technology"],tools:[["Workspace home","/admin/workspaces/technology"],["Initiative register","/admin/technology"],["Initiative editor","/admin/content?type=product_initiatives"],["Research & innovation","/research"]]}
];
export function FounderWorkspaceNav(){
 const path=usePathname();\n const search=useSearchParams();
 if(path==="/admin/login"||path==="/admin/forgot-password")return null;
 const active=search.get("type")==="product_initiatives"?spaces.find(s=>s.id==="technology"):spaces.find(s=>path.startsWith(s.href)||s.match.some(m=>path===m||path.startsWith(m+"/")||(m==="/admin/content"&&path.startsWith(m))));
 return <header className="founder-global-nav">
  <div className="founder-global-top"><Link href="/admin" className="founder-global-brand"><span className="founder-global-mark">B</span><span><strong>BABTEK CORE</strong><small>FOUNDER PORTAL</small></span></Link><div className="founder-global-meta"><span>SECURE ENTERPRISE WORKSPACE</span><Link href="/admin">Command centre</Link><Link href="/notifications">Notifications</Link></div></div>
  <nav className="founder-space-tabs" aria-label="Enterprise workspaces"><Link className={!active&&path==="/admin"?"is-active":""} href="/admin">Overview</Link>{spaces.map(s=><Link key={s.id} className={active?.id===s.id?"is-active":""} href={s.href}><span>{s.number}</span>{s.name}</Link>)}</nav>
  {active&&<nav className="founder-tool-tabs" aria-label={active.name+" tools"}>{active.tools.map(([label,href])=><Link key={href} className={path===href.split("?")[0]&&(!href.includes("?")||search.get("type")===new URLSearchParams(href.split("?")[1]).get("type"))?"is-current":""} href={href}>{label}</Link>)}</nav>}
 </header>;
}
