import React from "react";

type Metric={label:string;value:string};
export function WorkspaceVisual({kind,metrics}:{kind:string;metrics:Metric[]}){
 const value=(i:number)=>metrics[i]?.value??"—";
 const label=(i:number)=>metrics[i]?.label??"Records";
 return <section className={"workspace-visual workspace-visual-"+kind} aria-label={kind+" visual workspace preview"}>
  <div className="wv-topline"><span>BABTEK CORE / {kind.toUpperCase()}</span><span className="wv-live"><i/> CONNECTED WORKSPACE</span></div>
  {kind==="corporate"&&<div className="wv-corporate">
   <div className="wv-architecture"><div className="wv-architecture-copy"><span>BUILDING A BETTER FUTURE</span><strong>Ideas into<br/>built reality.</strong><small>Architecture · Engineering · Enterprise</small></div><div className="wv-architecture-building"><div/><div/><div/></div></div>
   <div className="wv-corporate-bottom"><div><b>One enterprise. Eight divisions.</b><small>Brand, content and public presence</small></div><div className="wv-division-orbit">{["DESIGN","INTERIORS","REAL ESTATE","SMART","ACADEMY","VENTURES","SUPPLY","RESEARCH"].map(x=><span key={x}>{x}</span>)}</div></div>
  </div>}
  {kind==="clients"&&<div className="wv-crm">
   <aside><b>◈ BABTEK CRM</b>{["Overview","Enquiries","Clients","Conversations","Documents"].map((x,i)=><span className={i===0?"selected":""} key={x}>{x}</span>)}</aside>
   <div className="wv-crm-main"><div className="wv-crm-heading"><div><small>CLIENT RELATIONSHIPS</small><b>Relationship overview</b></div><span>LIVE RECORDS ↗</span></div>
    <div className="wv-kpis">{metrics.slice(0,4).map((m,i)=><div key={m.label}><small>{m.label}</small><b>{m.value}</b><i className={"wv-kpi-icon wv-kpi-"+i}>{["↗","◎","▤","↳"][i]}</i></div>)}</div>
    <div className="wv-crm-lower"><div><b>Client journey</b><div className="wv-journey">{["Enquiry","Review","Engagement","Delivery"].map((x,i)=><span key={x}><i>{String(i+1).padStart(2,"0")}</i>{x}</span>)}</div></div><div><b>Communication hub</b><p>Client discussions, project updates and document exchange in context.</p><span className="wv-mini-link">Open communication centre →</span></div></div>
   </div>
  </div>}
  {kind==="projects"&&<div className="wv-projects">
   <div className="wv-project-head"><div><small>PROJECT DELIVERY CONTROL</small><b>Project coordination</b></div><span>LIVE OPERATIONS</span></div>
   <div className="wv-gantt"><div className="wv-gantt-labels"><b>Delivery stages</b>{["Scope & brief","Design coordination","Specialist review","Client approval","Delivery & close-out"].map(x=><span key={x}>{x}</span>)}</div><div className="wv-gantt-track"><div className="wv-gantt-months"><span>01 / PLAN</span><span>02 / COORDINATE</span><span>03 / DELIVER</span></div>{[["scope",1,2],["design",2,4],["review",3,5],["approval",5,2],["close",7,2]].map(([name,start,width])=><div className="wv-gantt-row" key={name as string}><i className={"wv-bar "+name} style={{marginLeft:(Number(start)-1)*10+"%",width:Number(width)*10+"%"}}/></div>)}</div></div>
   <div className="wv-project-foot"><div><b>{value(0)}</b><small>{label(0)}</small></div><div><b>{value(1)}</b><small>{label(1)}</small></div><div><b>{value(2)}</b><small>{label(2)}</small></div><div className="wv-project-note">Milestones · Tasks · Specialist engagements · Project files</div></div>
  </div>}
  {kind==="finance"&&<div className="wv-finance">
   <div className="wv-finance-head"><div><small>COMMERCIAL CONTROL CENTRE</small><b>Finance & administration</b></div><span>RECORDED ACTIVITY</span></div>
   <div className="wv-finance-grid">{metrics.slice(0,4).map((m,i)=><div key={m.label}><small>{m.label}</small><b>{m.value}</b><span>{["▤","↗","₦","◷"][i]}</span></div>)}</div>
   <div className="wv-finance-lower"><div><b>Project commercial workflow</b><div className="wv-finance-flow">{["Client fee","Direct costs","Partner fees","Gross margin"].map((x,i)=><span key={x}><i>{["01","02","03","04"][i]}</i>{x}</span>)}</div><small>Project-level records, kept currency-aware and traceable</small></div><div className="wv-ledger"><b>CONTROL LEDGER</b>{["Invoices & receipts","Operating expenses","Partner instalments","Access governance"].map(x=><span key={x}>✓ {x}</span>)}</div></div>
  </div>}
  {kind==="technology"&&<div className="wv-tech">
   <div className="wv-tech-copy"><small>CONNECTED DIGITAL ECOSYSTEM</small><b>Tools that connect<br/>ideas to operations.</b><p>Software initiatives, automation, research and future integrations.</p><div className="wv-tech-status"><i/> INITIATIVES TRACKED IN THE REGISTER</div></div>
   <div className="wv-tech-map"><div className="wv-tech-core">BABTEK<br/><b>CORE</b></div>{["AEC","COMMERCIAL","CADWAL-X","WAL-X","AI & OS","STUDIO"].map((x,i)=><span className={"wv-node wv-node-"+i} key={x}>{x}</span>)}<svg viewBox="0 0 320 240" aria-hidden="true"><path d="M160 120 L55 35 M160 120 L265 35 M160 120 L35 120 M160 120 L285 120 M160 120 L55 205 M160 120 L265 205"/></svg></div>
   <div className="wv-tech-foot">{metrics.map(m=><span key={m.label}><b>{m.value}</b><small>{m.label}</small></span>)}</div>
  </div>}
 </section>
}
