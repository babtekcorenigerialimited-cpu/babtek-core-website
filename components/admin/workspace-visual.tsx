import Link from "next/link";

type Metric={label:string;value:string};
type Section={title:string;description:string;href:string};
const copy:Record<string,{title:string;intro:string;focus:string}> = {
 corporate:{title:"Publishing control desk",intro:"A publishing workspace for the company story, service catalogue and eight divisions.",focus:"PUBLIC INFORMATION"},
 clients:{title:"Client relationship desk",intro:"A relationship workspace for enquiries, verified accounts, conversations and document exchange.",focus:"CLIENT JOURNEY"},
 projects:{title:"Project delivery desk",intro:"A delivery workspace for project records, tasks, milestones and independent specialist coordination.",focus:"DELIVERY CONTROL"},
 finance:{title:"Commercial control desk",intro:"A financial workspace for recorded invoices, receipts, expenses and specialist payment commitments.",focus:"FINANCIAL CONTROL"},
 technology:{title:"Innovation portfolio desk",intro:"A portfolio workspace for tracking BABTEK technology initiatives and their development stage.",focus:"PRODUCT DEVELOPMENT"}
};
export function WorkspaceVisual({kind,metrics,sections}:{kind:string;metrics:Metric[];sections:Section[]}){
 const variant=copy[kind]??copy.projects;
 const total=metrics.reduce((sum,m)=>{const parsed=Number(m.value.replace(/,/g,""));return sum+(Number.isFinite(parsed)?parsed:0);},0);
 const accent=kind==="clients"?"teal":kind==="finance"?"gold":kind==="technology"?"violet":kind==="projects"?"blue":"sky";
 return <section className={"workspace-visual workspace-command workspace-command-"+kind} aria-label={variant.title}>
  <header className="wc-heading">
   <div><span className="wc-eyebrow">BABTEK CORE / FOUNDER WORKSPACE / {variant.focus}</span><h2>{variant.title}</h2><p>{variant.intro}</p></div>
   <div className="wc-live"><i/> CONNECTED DATABASE</div>
  </header>
  {kind==="corporate"&&<div className="wc-corporate">
   <div className="wc-feature"><span>01 / COMPANY CONTENT</span><strong>Company profile & public pages</strong><p>Keep the corporate story, approved information and publishing records organised.</p><Link href={sections[0]?.href??"/admin/content"}>Open content studio ↗</Link></div>
   <div className="wc-stat-stack">{metrics.map(m=><div className="wc-stat" key={m.label}><span>{m.label}</span><strong>{m.value}</strong></div>)}</div>
   <div className="wc-division-strip"><span>DIVISION CATALOGUE</span><strong>8 divisions</strong><small>Service scope and delivery status are maintained separately from staffing claims.</small><Link href="/admin/divisions">Manage divisions ↗</Link></div>
  </div>}
  {kind==="clients"&&<div className="wc-clients">
   <div className="wc-client-intro"><span>RELATIONSHIP RECORDS</span><strong>{total.toLocaleString("en-NG")}</strong><small>Total records across the displayed client workspace categories</small></div>
   <div className="wc-client-list">{metrics.map((m,i)=><div className="wc-client-row" key={m.label}><span className="wc-index">0{i+1}</span><div><strong>{m.label}</strong><small>{i===0?"Incoming interest":i===1?"Registered relationships":i===2?"Recorded conversations":"Submitted project documents"}</small></div><b>{m.value}</b></div>)}</div>
   <div className="wc-client-actions">{sections.map((s,i)=><Link href={s.href} key={s.href}><span>0{i+1}</span><strong>{s.title}</strong><small>{s.description}</small><b>↗</b></Link>)}</div>
  </div>}
  {kind==="projects"&&<div className="wc-projects">
   <div className="wc-project-summary"><span>PROJECT OPERATIONS SNAPSHOT</span><strong>{metrics[0]?.value??"—"}</strong><small>Recorded projects</small><p>Project activity is shown only when records exist. No demonstration projects or fabricated progress are displayed.</p></div>
   <div className="wc-project-metrics">{metrics.slice(1).map(m=><div key={m.label}><span>{m.label}</span><strong>{m.value}</strong></div>)}</div>
   <div className="wc-project-tools">{sections.map((s,i)=><Link href={s.href} key={s.href}><span>0{i+1}</span><div><strong>{s.title}</strong><small>{s.description}</small></div><b>→</b></Link>)}</div>
  </div>}
  {kind==="finance"&&<div className="wc-finance">
   <div className="wc-finance-banner"><span>RECORDED COMMERCIAL ACTIVITY</span><strong>{total.toLocaleString("en-NG")}</strong><small>Entries across the finance record categories shown</small><p>These are record counts, not account balances, cash position, net profit or audited financial statements.</p></div>
   <div className="wc-ledger">{metrics.map((m,i)=><div className="wc-ledger-row" key={m.label}><span>0{i+1}</span><strong>{m.label}</strong><b>{m.value}</b><small>Database records</small></div>)}</div>
   <div className="wc-finance-links">{sections.map(s=><Link href={s.href} key={s.href}>{s.title}<b>↗</b></Link>)}</div>
  </div>}
  {kind==="technology"&&<div className="wc-tech">
   <div className="wc-tech-lead"><span>TECHNOLOGY INITIATIVES</span><strong>{metrics[0]?.value??"—"}</strong><p>Initiative records currently held in the platform. Concepts, development work and released products must remain clearly distinguished.</p><Link href={sections[0]?.href??"/admin/technology"}>Open initiative register ↗</Link></div>
   <div className="wc-tech-side"><div className="wc-tech-counts">{metrics.slice(1).map(m=><div key={m.label}><span>{m.label}</span><strong>{m.value}</strong></div>)}</div><div className="wc-tech-tools">{sections.slice(1).map(s=><Link href={s.href} key={s.href}>{s.title}<b>↗</b></Link>)}</div></div>
   <div className="wc-tech-note">Portfolio status should reflect actual evidence and development progress—not illustrative completion bars.</div>
  </div>}
  <footer className="wc-footer"><span>LIVE DATA · NO SAMPLE RECORDS</span><span>Counts update when the page is refreshed.</span></footer>
 </section>;
}
