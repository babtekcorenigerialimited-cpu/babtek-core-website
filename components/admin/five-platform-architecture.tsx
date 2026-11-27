const platforms=[
 {n:"01",title:"Corporate website",sub:"PUBLIC EXPERIENCE",symbol:"◎",tone:"website",tags:["Company & divisions","Services & portfolio","Enquiries & media"]},
 {n:"02",title:"Client management",sub:"CLIENT RELATIONSHIPS",symbol:"◉",tone:"clients",tags:["Client accounts","Commercial records","Secure conversations"]},
 {n:"03",title:"Project operations",sub:"DELIVERY ENGINE",symbol:"⌘",tone:"projects",tags:["Projects & milestones","Tasks & documents","Partner coordination"]},
 {n:"04",title:"Administration",sub:"FOUNDER GOVERNANCE",symbol:"⬡",tone:"admin",tags:["People & permissions","Finance & reporting","Enterprise oversight"]},
 {n:"05",title:"Technology ecosystem",sub:"INNOVATION LAYER",symbol:"✳",tone:"technology",tags:["AEC Workspace","CADWAL-X & WAL-X","BABTEK AI & Studio"]}
];
export function FivePlatformArchitecture(){
 return <section className="five-architecture" aria-label="Visual architecture of the five integrated BABTEK platform components">
  <div className="five-architecture-heading"><span>THE BABTEK DIGITAL ECOSYSTEM</span><h2>One enterprise. Five connected engines.</h2><p>A single operating environment where every platform contributes to one coordinated BABTEK experience.</p></div>
  <div className="five-architecture-scene">
   <div className="five-architecture-orbit" aria-hidden="true"><i/><i/><i/><i/><i/></div>
   <div className="five-architecture-grid">{platforms.map((p)=><article className={"five-architecture-card "+p.tone} key={p.n}>
    <div className="five-architecture-card-top"><span>{p.n}</span><i>{p.sub}</i></div>
    <div className="five-architecture-symbol" aria-hidden="true">{p.symbol}</div>
    <h3>{p.title}</h3>
    <div className="five-architecture-tags">{p.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
   </article>)}</div>
   <div className="five-architecture-core"><span className="five-core-symbol">B</span><div><strong>BABTEK CORE</strong><small>THE SHARED ENTERPRISE FOUNDATION</small></div><span className="five-core-connectors">IDENTITY&nbsp; • &nbsp;DATA&nbsp; • &nbsp;ACCESS&nbsp; • &nbsp;MESSAGING&nbsp; • &nbsp;DOCUMENTS</span></div>
  </div>
  <div className="five-architecture-foot"><span>CONNECTED BY DESIGN</span><p>Shared authentication, permissions, project records, communications and business data connect all five components. The visual represents the target integrated architecture; individual capabilities continue through staged implementation.</p></div>
 </section>;
}
