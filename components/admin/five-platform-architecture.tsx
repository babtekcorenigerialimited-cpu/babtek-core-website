function WindowBar({label}:{label:string}) {
  return <div className="showcase-windowbar"><div className="showcase-dots"><i/><i/><i/></div><span>{label}</span><b>•••</b></div>;
}
function CorporatePreview() {
  return <div className="showcase-browser showcase-web">
    <WindowBar label="BABTEK CORE / CORPORATE WEBSITE"/>
    <div className="web-preview-nav"><strong><i>B</i> BABTEK <small>CORE NIGERIA LIMITED</small></strong><span>ABOUT&nbsp;&nbsp; DIVISIONS&nbsp;&nbsp; SERVICES&nbsp;&nbsp; PROJECTS&nbsp;&nbsp; INSIGHTS</span><b>LET'S TALK ↗</b></div>
    <div className="web-preview-hero"><div><small>BUILDING A BETTER FUTURE</small><h4>Building Ideas.<br/><em>Engineering Possibilities.</em></h4><p>Architecture · Engineering · Technology · Enterprise</p><span>EXPLORE OUR CAPABILITIES&nbsp; ↗</span></div><div className="web-building"/></div>
    <div className="web-preview-strip"><span>BUILT ENVIRONMENT</span><span>TECHNOLOGY & INNOVATION</span><span>BUSINESS & ENTERPRISE</span></div>
    <div className="web-lower"><div><small>INTEGRATED EXPERTISE</small><b>One enterprise.<br/>Multiple possibilities.</b><p>Design · Construction · Interiors · Real Estate · Smart Solutions</p></div><div className="web-lower-image"/></div>
  </div>;
}
function ClientPreview() {
  return <div className="showcase-app showcase-crm">
    <WindowBar label="BABTEK / CLIENT RELATIONSHIP MANAGEMENT"/>
    <div className="crm-full"><aside className="crm-sidebar"><b><i>B</i> BABTEK</b><small>WORKSPACE</small><span className="selected">▦ &nbsp; Dashboard</span><span>♙ &nbsp; Leads</span><span>◇ &nbsp; Projects</span><span>▤ &nbsp; Contacts</span><span>▣ &nbsp; Documents</span><span>▧ &nbsp; Quotations</span><span>₦ &nbsp; Payments</span><span>⚙ &nbsp; Settings</span><small>SUPPORT</small><span>◉ &nbsp; Help centre</span><span>✉ &nbsp; Messages</span></aside>
    <div className="crm-main"><div className="crm-toolbar"><b>Dashboard</b><span>⌕ &nbsp; Search workspace</span><strong>＋ New enquiry</strong><i>JD</i></div><div className="crm-tabs">Overview &nbsp;&nbsp; Projects &nbsp;&nbsp; Documents</div><h4>Welcome back <small>Your projects and account activity at a glance.</small></h4>
    <div className="crm-stats"><div><small>ACTIVE PROJECTS</small><b>02</b><em>Current engagements</em></div><div><small>OPEN DOCUMENTS</small><b>08</b><em>Available to review</em></div><div><small>OPEN MESSAGES</small><b>03</b><em>Latest conversations</em></div><div><small>INVOICES</small><b>02</b><em>Commercial records</em></div></div>
    <div className="crm-project"><div><b>Residential development</b><small>PROJECT BK-024 · ABEOKUTA</small></div><strong>68%</strong><div className="mock-progress"><i style={{width:"68%"}}/></div><small>Design development <span>IN PROGRESS</span></small></div>
    <div className="crm-bottom"><span>RECENT ACTIVITY</span><b>Project update <small>Today · 10:42 AM</small></b><b>Drawing uploaded <small>Yesterday · 4:18 PM</small></b></div></div></div>
  </div>;
}
function OperationsPreview() {
  return <div className="showcase-app showcase-ops">
    <WindowBar label="BABTEK / PROJECT OPERATIONS WORKSPACE"/>
    <div className="ops-head"><div><small>PROJECTS / DELIVERY / BK-024</small><h4>Residential development <em>ACTIVE</em></h4></div><b>＋ NEW TASK</b></div>
    <div className="ops-metrics"><div><small>PROJECT PROGRESS</small><b>68%</b></div><div><small>MILESTONES</small><b>04 <i>/ 06</i></b></div><div><small>OPEN TASKS</small><b>12</b></div><div><small>TEAM ASSIGNMENTS</small><b>05</b></div></div>
    <div className="gantt"><strong>DELIVERY TIMELINE</strong><div className="gantt-months"><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>{[["Concept design","12%","35%","done"],["Design development","28%","42%","active"],["Structural design","43%","24%","blue"],["MEP coordination","55%","25%","blue"],["Technical documentation","68%","26%","future"]].map(([name,left,width,tone])=><div className="gantt-row" key={name}><span>{name}</span><div><i className={tone} style={{left,width}}/></div></div>)}</div>
    <div className="ops-lower"><div><strong>TASK BOARD</strong><span>TO DO · 04</span><b>Site information review</b><b>Structural coordination</b></div><div><strong>TEAM & MILESTONES</strong><span>5 assigned contributors</span><b>Design development · In progress</b><b>Technical set · Upcoming</b></div></div>
  </div>;
}
function FinancePreview() {
  return <div className="showcase-app showcase-finance">
    <WindowBar label="BABTEK / ENTERPRISE RESOURCE MANAGEMENT"/>
    <div className="erp-layout"><aside><b>BABTEK</b><small>MANAGEMENT</small>{["Dashboard","Sales & enquiries","Customers","Projects","Quotations","Invoices","Receipts","Partner payments","Expenses","Reports","User management","Settings"].map((x,i)=><span className={i===0?"active":""} key={x}>{["▦","♧","♙","▤","▧","▣","₦","⇄","↗","▥","♙","⚙"][i]} &nbsp; {x}</span>)}</aside>
    <div className="erp-main"><div className="erp-toolbar"><b>Business overview</b><span>Search records&nbsp;&nbsp;⌕</span><strong>＋ Create new</strong></div><div className="finance-kpis"><div><small>PROJECT REVENUE</small><b>₦8.42m</b><em>Recorded project fees</em></div><div><small>RECEIPTS RECORDED</small><b>₦5.16m</b><em>Confirmed entries</em></div><div><small>OUTSTANDING</small><b>₦3.26m</b><em>Invoice balances</em></div><div><small>EXPENSES</small><b>₦1.24m</b><em>Recorded expenses</em></div></div>
    <div className="finance-visual"><div className="finance-chart"><strong>COMMERCIAL PERFORMANCE</strong><div className="chart-bars">{[35,52,43,68,54,80,62,92,70,84,66,100].map((v,i)=><i key={i} style={{height:v+"%"}}/>)}</div><div className="chart-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span></div></div><div className="finance-ring"><strong>INVOICE STATUS</strong><div className="ring-graphic"><span>68%<small>ISSUED</small></span></div><small>Paid · Pending · Overdue</small></div></div>
    <div className="erp-records"><b>RECENT INVOICES</b><span>Client / Reference</span><span>Amount</span><span>Status</span><span>Residential · INV-024</span><span>₦450,000</span><em>Issued</em><span>Office fit-out · INV-023</span><span>₦280,000</span><em>Part-paid</em></div></div></div>
  </div>;
}
function TechnologyPreview() {
  return <div className="showcase-app showcase-tech">
    <WindowBar label="BABTEK / TECHNOLOGY & INNOVATION STUDIO"/>
    <div className="tech-scene"><div className="tech-head"><small>CONNECTED TOOLS · INTELLIGENT WORKFLOWS</small><h4>One digital ecosystem.<br/><em>Many possibilities.</em></h4><p>Purpose-built tools for design, delivery and enterprise workflows.</p></div>
    <div className="tech-flow"><div className="tech-node">✦<small>BABTEK AI</small></div><div className="tech-connect">API · AUTOMATION · DATA</div><div className="tech-monitor"><div><i/><i/><i/></div><b>WORKFLOW STUDIO</b><span>Trigger → Process → Review → Complete</span><div className="tech-bars"><i/><i/><i/><i/><i/></div></div></div>
    <div className="tech-products"><div className="tech-product cad"><span>DESIGN AUTOMATION</span><b>CADWAL-X</b><small>CAD productivity tools</small><i>⌘</i></div><div className="tech-product aec"><span>PROJECT WORKSPACE</span><b>AEC WORKSPACE</b><small>Connected project delivery</small><i>▦</i></div><div className="tech-product wal"><span>VISUAL PRESENTATION</span><b>WAL-X</b><small>Portfolio & visual storytelling</small><i>◈</i></div></div>
    <div className="tech-status"><i/> CONCEPTS & DEVELOPMENT <span>ROADMAP · PROTOTYPES · FUTURE RELEASES</span></div></div>
  </div>;
}
export function FivePlatformArchitecture(){
 return <section className="five-architecture" aria-label="Founder-only visual showcase of BABTEK's five integrated digital platforms">
  <div className="five-architecture-heading"><span>THE BABTEK DIGITAL ECOSYSTEM</span><h2>Five experiences.<br/><em>One connected enterprise.</em></h2><p>Private founder view · illustrative interface concepts inspired by the approved visual references.</p></div>
  <div className="five-showcase-grid">
    <article className="five-showcase-card showcase-featured"><div className="five-showcase-meta"><span>01 / CORPORATE WEBSITE</span><b>PUBLIC EXPERIENCE</b></div><CorporatePreview/><div className="five-showcase-copy"><h3>Corporate website</h3><p>Architecture-led brand presentation, services, divisions, projects and company information.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>02 / CLIENT MANAGEMENT</span><b>CLIENT WORKSPACE</b></div><ClientPreview/><div className="five-showcase-copy"><h3>Client management</h3><p>CRM-style navigation, account overview, project progress, records and communication.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>03 / PROJECT OPERATIONS</span><b>DELIVERY WORKSPACE</b></div><OperationsPreview/><div className="five-showcase-copy"><h3>Project operations</h3><p>Gantt timeline, tasks, team assignments, milestones and delivery coordination.</p></div></article>
    <article className="five-showcase-card"><div className="five-showcase-meta"><span>04 / ADMINISTRATION</span><b>FOUNDER CONTROL</b></div><FinancePreview/><div className="five-showcase-copy"><h3>Administration & finance</h3><p>ERP-style enterprise navigation, commercial analytics, invoices, receipts and expenses.</p></div></article>
    <article className="five-showcase-card showcase-featured showcase-tech-card"><div className="five-showcase-meta"><span>05 / TECHNOLOGY ECOSYSTEM</span><b>INNOVATION STUDIO</b></div><TechnologyPreview/><div className="five-showcase-copy"><h3>Technology ecosystem</h3><p>Connected products, APIs, automation workflows and the BABTEK software roadmap.</p></div></article>
  </div>
  <div className="five-showcase-foundation"><div className="foundation-mark">B</div><div><strong>BABTEK CORE</strong><span>ONE SHARED ENTERPRISE FOUNDATION</span></div><p>IDENTITY&nbsp; · &nbsp;DATA&nbsp; · &nbsp;ACCESS&nbsp; · &nbsp;MESSAGING&nbsp; · &nbsp;DOCUMENTS</p></div>
  <p className="five-showcase-note">FOUNDER-ONLY VISUAL PREVIEWS · All names, amounts, clients and metrics shown inside these concepts are illustrative—not live business records. Operational status is shown separately in the linked workspaces.</p>
 </section>;
}
