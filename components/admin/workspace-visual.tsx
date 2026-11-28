import React from "react";

type Metric={label:string;value:string};
export function WorkspaceVisual({kind,metrics}:{kind:string;metrics:Metric[]}){
 const parsed=metrics.map(metric=>({ ...metric, amount:Number(metric.value.replace(/,/g,"")) })).filter(metric=>Number.isFinite(metric.amount));
 const max=Math.max(1,...parsed.map(metric=>metric.amount));
 const descriptions:Record<string,string>={
  corporate:"Published corporate content and service catalogue records.",
  clients:"Client relationship and communication records currently held in the platform.",
  projects:"Project delivery records and specialist coordination activity.",
  finance:"Recorded commercial documents and payment or expense entries.",
  technology:"Technology initiatives and related published information."
 };
 return <section className="workspace-visual workspace-record-pulse" aria-label="Database record summary">
  <div className="wv-topline"><span>BABTEK CORE / {kind.toUpperCase()}</span><span className="wv-snapshot-label">DATABASE SNAPSHOT</span></div>
  <div className="wv-pulse-heading"><div><small>RECORD OVERVIEW</small><h2>What is currently recorded</h2><p>{descriptions[kind]??"Current records in this workspace."} No sample activity is included.</p></div><span className="wv-pulse-mark">B</span></div>
  <div className="wv-record-bars">
   {parsed.map(metric=><div className="wv-record-row" key={metric.label}>
    <div className="wv-record-meta"><span>{metric.label}</span><strong>{metric.value}</strong></div>
    <div className="wv-record-track" role="img" aria-label={metric.label+": "+metric.value+" records"}><span style={{width:((metric.amount/max)*100)+"%"}}/></div>
   </div>)}
  </div>
  <p className="wv-record-note">Counts are read from BABTEK's database when this page loads. A zero means no records have been entered yet; it does not mean the capability is unavailable.</p>
 </section>;
}
