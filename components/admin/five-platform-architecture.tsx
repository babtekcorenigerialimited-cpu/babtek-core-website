const systems = [
  { id:"01", name:"Corporate website", eyebrow:"PUBLIC DIGITAL PRESENCE", tone:"web", description:"A premium front door for the company, its divisions, capabilities and opportunities." },
  { id:"02", name:"Client management", eyebrow:"CLIENT RELATIONSHIPS", tone:"crm", description:"A clear client workspace for enquiries, project updates, documents and commercial records." },
  { id:"03", name:"Project operations", eyebrow:"PROJECT DELIVERY", tone:"ops", description:"A live view of project stages, milestones, responsibilities and delivery progress." },
  { id:"04", name:"Administration", eyebrow:"FOUNDER CONTROL ROOM", tone:"finance", description:"A consolidated view of business performance, finance, people and enterprise activity." },
  { id:"05", name:"Technology ecosystem", eyebrow:"PRODUCTS & INNOVATION", tone:"tech", description:"A growing suite of digital tools for the built environment and business operations." },
];

function WindowBar({label}:{label:string}) {
  return <div className="showcase-windowbar"><div className="showcase-dots"><i/><i/><i/></div><span>{label}</span><b>•••</b></div>;
}
function CorporatePreview() {
  return <div className="showcase-browser showcase-web">
    <WindowBar label="babtekcore.com"/>
    <div className="web-preview-nav"><strong><i>B</i> BABTEK <small>CORE NIGERIA LIMITED</small></strong><span>ABOUT&nbsp;&nbsp; DIVISIONS&nbsp;&nbsp; PROJECTS&nbsp;&nbsp; TECHNOLOGY</span><b>CONTACT ↗</b></div>
    <div className="web-preview-hero"><div><small>BUILDING A BETTER FUTURE</small><h4>Building Ideas.<br/><em>Engineering Possibilities.</em></h4><p>Architecture · Engineering · Technology · Enterprise</p><span>EXPLORE BABTEK&nbsp; ↗</span></div><div className="web-building"/></div>
    <div className="web-preview-strip"><span>01&nbsp; BUILT ENVIRONMENT</span><span>02&nbsp; TECHNOLOGY & INNOVATION</span><span>03&nbsp; BUSINESS & ENTERPRISE</span></div>
  </div>;
}
function ClientPreview() {
  return <div className="showcase-app showcase-crm">
    <WindowBar label="BABTEK / CLIENT SPACE"/>
    <div className="crm-layout"><aside><b>B.</b><i>⌂</i><i>▤</i><i>◷</i><i>▧</i><i>⚙</i></aside><div className="crm-main"><div className="mock-topline"><span>OVERVIEW / CLIENT SPACE</span><b>JD&nbsp; ▾</b></div><h4>Good morning, James <small>Here’s the latest on your projects.</small></h4><div className="crm-stats"><div><small>ACTIVE PROJECTS</small><b>02</b><em>Across 2 engagements</em></div><div><small>OPEN DOCUMENTS</small><b>08</b><em>2 recently updated</em></div><div><small>PAYMENTS</small><b>₦1.8m</b><em>Recorded project value</em></div></div><div className="crm-project"><div><b>Residential development</b><small>ABEOKUTA · PROJECT #BK-024</small></div><strong>68%</strong><div className="mock-progress"><i style={{width:"68%"}}/></div><small>Design development <span>In progress</span></small></div><div className="crm-bottom"><span>RECENT ACTIVITY</span><b>Project update received <small>Today · 10:42 AM</small></b><b>New drawing uploaded <small>Yesterday · 4:18 PM</small></b></div></div></div>
  </div>;
}
function OperationsPreview() {
  return <div className="showcase-app showcase-ops">
    <WindowBar label="BABTEK / PROJECT OPERATIONS"/>
    <div className="ops-head"><div><small>WORKSPACE / PROJECTS / BK-024</small><h4>Residential development <em>ACTIVE</em></h4></div><b>＋ NEW TASK</b></div>
    <div className="ops-metrics"><div><small>OVERALL PROGRESS</small><b>68%</b></div><div><small>MILESTONES</small><b>04 <i>/ 06</i></b></div><div><small>OPEN TASKS</small><b>12</b></div><div><small>TEAM MEMBERS</small><b>05</b></div></div>
    <div className="ops-body"><div className="ops-timeline"><strong>PROJECT TIMELINE</strong><div className="ops-row"><span>Concept design</span><i className="done"/><small>Complete</small></div><div className="ops-row"><span>Design development</span><i className="active"/><small>In progress</small></div><div className="ops-row"><span>Technical drawings</span><i/><small>Upcoming</small></div><div className="ops-row"><span>Documentation</span><i/><small>Upcoming</small></div></div><div className="ops-files"><strong>PROJECT FILES</strong><b>▧&nbsp; Architectural set.pdf <small>12.4 MB</small></b><b>▧&nbsp; Site survey.pdf <small>4.8 MB</small></b><b>▧&nbsp; Design brief.docx <small>860 KB</small></b></div></div>
  </div>;
}
function FinancePreview() {
  return <div className="showcase-app showcase-finance">
    <WindowBar label="BABTEK / ENTERPRISE CONTROL"/>
    <div className="finance-head"><div><small>ENTERPRISE / PERFORMANCE</small><h4>Business overview</h4></div><span>LAST 30 DAYS&nbsp;⌄</span></div>
    <div className="finance-kpis"><div><small>PROJECT REVENUE</small><b>₦8.42m</b><em>↗ Project records</em></div><div><small>RECEIPTS RECORDED</small><b>₦5.16m</b><em>Confirmed entries</em></div><div><small>ACTIVE PROJECTS</small><b>12</b><em>Across divisions</em></div></div>
    <div className="finance-visual"><div className="finance-chart"><strong>REVENUE OVERVIEW</strong><div className="chart-bars">{[35,52,43,68,54,80,62,92,70,84,66,100].map((v,i)=><i key={i} style={{height:v+"%"}}/>)}</div><div className="chart-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span></div></div><div className="finance-ring"><strong>PROJECT MIX</strong><div className="ring-graphic"><span>08<small>DIVISIONS</small></span></div><small>Design&nbsp; · &nbsp;Technology&nbsp; · &nbsp;Enterprise</small></div></div>
  </div>;
}
function TechnologyPreview() {
  return <div className="showcase-app showcase-tech">
    <WindowBar label="BABTEK / TECHNOLOGY STUDIO"/>
    <div className="tech-head"><small>THE BABTEK DIGITAL WORKBENCH</small><h4>Tools for the next<br/><em>way of working.</em></h4><p>Purpose-built technology for design, delivery and enterprise workflows.</p></div>
    <div className="tech-products"><div className="tech-product cad"><span>01 / DESIGN AUTOMATION</span><b>CADWAL-X</b><small>CAD productivity tools</small><i>⌘</i></div><div className="tech-product aec"><span>02 / PROJECT WORKSPACE</span><b>AEC WORKSPACE</b><small>Connected project delivery</small><i>▦</i></div><div className="tech-product wal"><span>03 / VISUAL PRESENTATION</span><b>WAL-X</b><small>Portfolio & visual storytelling</small><i>◈</i></div></div>
    <div className="tech-status"><i/> DEVELOPMENT ROADMAP <span>CONCEPTS · PROTOTYPES · FUTURE RELEASES</span></div>
  </div>;
}
export function FivePlatformArchitecture(){
 return <section className="five-architecture" aria-label="Founder-only visual showcase of BABTEK's five integrated digital platforms">
  <div className="five-architecture-heading"><span>THE BABTEK DIGITAL ECOSYSTEM</span><h2>Five experiences.<br/><em>One connected enterprise.</em></h2><p>Private founder view · interface previews for the five connected management areas.</p></div>
  <div className="five-showcase-grid">
    <article className="five-showcase-card showcase-featured"><div className="five-showcase-meta"><span>01 / CORPORATE WEBSITE</span><b>PUBLIC EXPERIENCE</b></div><CorporatePreview/><div className="five-showcase-copy"><h3>Corporate website</h3><p>A confident public presence for the BABTEK brand, services, portfolio and enquiries.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>02 / CLIENT MANAGEMENT</span><b>CLIENT EXPERIENCE</b></div><ClientPreview/><div className="five-showcase-copy"><h3>Client management</h3><p>A dedicated space for client accounts, project updates and communication.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>03 / PROJECT OPERATIONS</span><b>DELIVERY EXPERIENCE</b></div><OperationsPreview/><div className="five-showcase-copy"><h3>Project operations</h3><p>Project timelines, milestones, tasks, files and partner coordination in view.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>04 / ADMINISTRATION</span><b>FOUNDER EXPERIENCE</b></div><FinancePreview/><div className="five-showcase-copy"><h3>Administration dashboard</h3><p>Enterprise performance, financial oversight and operational intelligence.</p></div></article>
    <article className="five-showcase-card showcase-featured showcase-tech-card"><div className="five-showcase-meta"><span>05 / TECHNOLOGY ECOSYSTEM</span><b>INNOVATION EXPERIENCE</b></div><TechnologyPreview/><div className="five-showcase-copy"><h3>Technology ecosystem</h3><p>A growing family of digital products, automation and intelligent workflows.</p></div></article>
  </div>
  <div className="five-showcase-foundation"><div className="foundation-mark">B</div><div><strong>BABTEK CORE</strong><span>ONE SHARED FOUNDATION</span></div><p>IDENTITY&nbsp; · &nbsp;DATA&nbsp; · &nbsp;ACCESS&nbsp; · &nbsp;MESSAGING&nbsp; · &nbsp;DOCUMENTS</p></div>
  <p className="five-showcase-note">FOUNDER-ONLY INTERFACE PREVIEWS · Illustrative screen data, not live client records. Access to this workspace is restricted to the authenticated BABTEK owner.</p>
 </section>;
}
