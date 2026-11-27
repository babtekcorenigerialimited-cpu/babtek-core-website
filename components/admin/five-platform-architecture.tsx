const platforms=[
 {n:"01",title:"Corporate website",sub:"Public presence & enquiries",tone:"website",items:["Company profile & divisions","Services, projects & insights","Brand, media & public content"]},
 {n:"02",title:"Client management",sub:"Relationship & commercial journey",tone:"clients",items:["Client accounts & enquiries","Quotations, agreements & invoices","Client conversations & payments"]},
 {n:"03",title:"Project operations",sub:"Delivery & specialist coordination",tone:"projects",items:["Projects, milestones & tasks","Documents & partner engagements","Progress, quality & close-out"]},
 {n:"04",title:"Administration",sub:"Founder control & governance",tone:"admin",items:["People, roles & permissions","Finance, reports & reconciliation","Audit, settings & oversight"]},
 {n:"05",title:"Technology ecosystem",sub:"Products, automation & innovation",tone:"technology",items:["AEC Workspace & Commercial","CADWAL-X & WAL-X Portfolio","BABTEK AI, Studio & BABTEK-OS"]}
];
export function FivePlatformArchitecture(){
 return <section className="five-architecture" aria-label="Five integrated BABTEK platform components">
  <div className="five-architecture-heading"><span>ONE CONNECTED ENTERPRISE</span><h2>Five platforms. One BABTEK ecosystem.</h2><p>Each component has a distinct role, connected through shared identity, data, permissions, communications and business workflows.</p></div>
  <div className="five-architecture-grid">{platforms.map((p)=><article className={"five-architecture-card "+p.tone} key={p.n}><div className="five-architecture-card-top"><span>{p.n}</span><i>{p.sub}</i></div><h3>{p.title}</h3><ul>{p.items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div>
  <div className="five-architecture-core"><span className="five-core-symbol">B</span><div><strong>BABTEK CORE PLATFORM</strong><small>Shared authentication · central database · role-based access · communications · documents · notifications · APIs</small></div></div>
  <p className="five-architecture-foot">The five components are integrated parts of BABTEK Core Nigeria Limited—not five separate websites or companies. Capabilities marked as in development remain subject to staged implementation.</p>
 </section>;
}