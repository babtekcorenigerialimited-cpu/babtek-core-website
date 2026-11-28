import Link from "next/link";

type Metric={label:string;value:string};
type Section={title:string;description:string;href:string};
export function WorkspaceVisual({kind,metrics,sections}:{kind:string;metrics:Metric[];sections:Section[]}){
 const parsed=metrics.map(metric=>({...metric,amount:Number(metric.value.replace(/,/g,""))})).filter(metric=>Number.isFinite(metric.amount));
 const max=Math.max(1,...parsed.map(metric=>metric.amount));
 const total=parsed.reduce((sum,metric)=>sum+metric.amount,0);
 const descriptions:Record<string,string>={
  corporate:"Published corporate content, divisions and service catalogue records.",
  clients:"Client relationships, enquiries, conversations and document submissions.",
  projects:"Project delivery records, tasks, milestones and specialist coordination.",
  finance:"Recorded invoices, receipts, expenses and partner payment schedules.",
  technology:"Technology initiatives and published information in the BABTEK ecosystem."
 };
 const labels:Record<string,string>={corporate:"Publishing overview",clients:"Relationship pipeline",projects:"Delivery overview",finance:"Commercial records",technology:"Innovation portfolio"};
 return <section className={"workspace-visual workspace-dashboard workspace-dashboard-"+kind} aria-label={labels[kind]??"Workspace dashboard"}>
  <div className="wd-head"><div><span className="wd-kicker">BABTEK CORE / {kind.toUpperCase()} / LIVE OVERVIEW</span><h2>{labels[kind]??"Workspace overview"}</h2><p>{descriptions[kind]??"Current records in this workspace."}</p></div><span className="wd-live"><i/> LIVE DATABASE</span></div>
  <div className="wd-kpis">
   {parsed.map((metric,index)=><article className="wd-kpi" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{index===0?"Current records":"Recorded to date"}</small><div className="wd-kpi-line"><i style={{width:((metric.amount/max)*100)+"%"}}/></div></article>)}
  </div>
  <div className="wd-lower">
   <section className="wd-chart-panel"><div className="wd-panel-head"><div><span>DATA VISUALISATION</span><h3>Records by category</h3></div><b>{total.toLocaleString("en-NG")} total</b></div>
    {total>0?<div className="wd-bars">{parsed.map(metric=><div className="wd-bar-row" key={metric.label}><span>{metric.label}</span><div><i style={{width:((metric.amount/max)*100)+"%"}}/></div><strong>{metric.value}</strong></div>)}</div>:<div className="wd-empty-chart"><span className="wd-empty-icon">＋</span><strong>Your live chart will build as records are added.</strong><p>No records are available in this workspace yet. Nothing has been filled with sample data.</p></div>}
    <p className="wd-footnote">Bars compare the current record counts in this workspace; they are not revenue, completion or performance percentages.</p>
   </section>
   <section className="wd-tools-panel"><div className="wd-panel-head"><div><span>QUICK ACCESS</span><h3>Go to a working tool</h3></div></div>
    <div className="wd-tools">{sections.map((section,index)=><Link href={section.href} key={section.href} className="wd-tool"><span>{String(index+1).padStart(2,"0")}</span><div><strong>{section.title}</strong><small>{section.description}</small></div><b>↗</b></Link>)}</div>
   </section>
  </div>
  <p className="wd-record-note">All figures are read from BABTEK's connected database when this page loads. A zero means no records have been entered yet; it does not mean the capability is unavailable.</p>
 </section>;
}