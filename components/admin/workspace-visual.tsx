import Link from "next/link";

type Metric={label:string;value:string};
type Section={title:string;description:string;href:string};
const copy:Record<string,{title:string;intro:string;focus:string;signal:string}> = {
 corporate:{title:"Publishing control desk",intro:"A publishing workspace for the company story, service catalogue and eight divisions.",focus:"PUBLIC INFORMATION",signal:"CONTENT GOVERNANCE"},
 clients:{title:"Client relationship desk",intro:"A relationship workspace for enquiries, verified accounts, conversations and document exchange.",focus:"CLIENT JOURNEY",signal:"RELATIONSHIP HEALTH"},
 projects:{title:"Project delivery desk",intro:"A delivery workspace for project records, tasks, milestones and independent specialist coordination.",focus:"DELIVERY CONTROL",signal:"DELIVERY PIPELINE"},
 finance:{title:"Commercial control desk",intro:"A financial workspace for recorded invoices, receipts, expenses and specialist payment commitments.",focus:"FINANCIAL CONTROL",signal:"COMMERCIAL RECORDS"},
 technology:{title:"Innovation portfolio desk",intro:"A portfolio workspace for tracking BABTEK technology initiatives and their development stage.",focus:"PRODUCT DEVELOPMENT",signal:"INNOVATION REGISTER"}
};
const safeNumber=(value:string)=>{const n=Number(value.replace(/,/g,""));return Number.isFinite(n)&&n>=0?n:0};
function MetricBars({metrics}:{metrics:Metric[]}){
 const max=Math.max(1,...metrics.map(m=>safeNumber(m.value)));
 return <div className="wv-bars" aria-label="Relative record counts">
  {metrics.map((m,i)=>{const n=safeNumber(m.value);return <div className="wv-bar-row" key={m.label}>
   <div className="wv-bar-copy"><span>{m.label}</span><strong>{m.value}</strong></div>
   <div className="wv-track"><i style={{width:Math.max(n===0?0:5,Math.round(n/max*100))+"%"}}/></div>
  </div>})}
 </div>
}
function SectionCards({sections}:{sections:Section[]}){
 return <div className="wv-section-grid">{sections.map((s,i)=><Link href={s.href} key={s.href} className="wv-section-card">
  <span className="wv-section-index">0{i+1}</span><span className="wv-section-arrow">↗</span><strong>{s.title}</strong><small>{s.description}</small><b>OPEN WORKSPACE <span>→</span></b>
 </Link>)}</div>
}
export function WorkspaceVisual({kind,metrics,sections}:{kind:string;metrics:Metric[];sections:Section[]}){
 const variant=copy[kind]??copy.projects;
 const total=metrics.reduce((sum,m)=>sum+safeNumber(m.value),0);
 const accent=kind==="clients"?"teal":kind==="finance"?"gold":kind==="technology"?"violet":kind==="projects"?"blue":"sky";
 return <section className={"workspace-visual workspace-command workspace-command-"+kind+" wv-stage-two"} aria-label={variant.title}>
  <header className="wv-hero">
   <div className="wv-hero-copy"><span className="wv-eyebrow">BABTEK CORE <i/> FOUNDER WORKSPACE <i/> {variant.focus}</span><div className="wv-title-row"><div><h2>{variant.title}</h2><p>{variant.intro}</p></div><span className="wv-hero-mark">{kind==="finance"?"₦":kind==="technology"?"T":kind==="clients"?"C":kind==="projects"?"P":"B"}</span></div>
    <div className="wv-hero-foot"><span className="wv-connected"><i/> CONNECTED DATABASE</span><span>{variant.signal}</span></div>
   </div>
   <div className="wv-hero-total"><small>RECORDED ITEMS IN VIEW</small><strong>{total.toLocaleString("en-NG")}</strong><span>Combined record count · not a financial balance</span></div>
  </header>
  <div className="wv-overview-head"><div><span>WORKSPACE INTELLIGENCE</span><h3>Live operational snapshot</h3><p>Counts below are read from the connected BABTEK database.</p></div><span className="wv-refresh-label">LIVE RECORD COUNTS</span></div>
  <div className="wv-metric-layout">
   <div className="wv-metric-grid">{metrics.map((m,i)=><article className="wv-metric-card" key={m.label}><span className="wv-metric-icon">{String(i+1).padStart(2,"0")}</span><small>{m.label}</small><strong>{m.value}</strong><em>DATABASE RECORDS</em></article>)}</div>
   <aside className="wv-visual-panel"><div className="wv-panel-top"><div><span>DATA DISTRIBUTION</span><strong>Records by category</strong></div><span className="wv-panel-dot"/></div><MetricBars metrics={metrics}/><p>Bars compare the number of records in each category. They do not represent completion, performance or financial value.</p></aside>
  </div>
  <div className="wv-overview-head wv-tools-heading"><div><span>WORKING AREAS</span><h3>Tools & operational destinations</h3><p>Open a dedicated register or control area to perform the work.</p></div><span className="wv-refresh-label">{sections.length} DESTINATIONS</span></div>
  <SectionCards sections={sections}/>
  {kind==="corporate"&&<div className="wv-focus-strip"><span>DIVISION CATALOGUE</span><strong>8 divisions</strong><p>Maintain service scope and delivery status separately from staffing claims.</p><Link href="/admin/divisions">Manage divisions ↗</Link></div>}
  {kind==="finance"&&<div className="wv-caution"><strong>Financial interpretation</strong><p>Record counts are not account balances, cash position, revenue, net profit or audited financial statements. Project margin must be assessed from actual project-level revenue and direct costs.</p></div>}
  {kind==="technology"&&<div className="wv-caution"><strong>Product maturity matters</strong><p>Concepts, active development, pilots and released products must remain clearly distinguished. The portfolio must reflect recorded evidence rather than illustrative completion percentages.</p></div>}
  {kind==="projects"&&<div className="wv-caution"><strong>Delivery integrity</strong><p>Progress should come from actual milestones and accepted deliverables. Projects without recorded milestones are not assigned an assumed completion percentage.</p></div>}
  <footer className="wv-footer"><span>LIVE DATA · NO SAMPLE RECORDS</span><span>Counts update when the page is refreshed.</span></footer>
 </section>;
}
