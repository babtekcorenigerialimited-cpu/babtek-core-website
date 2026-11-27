import Link from "next/link";
import { PageHero } from "@/components/page-hero";

const capabilityGroups = [
  {
    number: "01",
    title: "Architecture & built environment",
    division: "BABTEK Design & Construction",
    items: ["Architectural concept development and building design", "Space planning, building layouts and design coordination", "Architectural working drawings and technical documentation", "CAD drafting, 3D modelling and visualisation", "Building renovation, maintenance and adaptation planning"],
    note: "Architectural design and coordination are undertaken within the founder's demonstrated scope; specialist and regulated services are coordinated with appropriately qualified professionals."
  },
  {
    number: "02",
    title: "Engineering & project delivery",
    division: "BABTEK Design & Construction",
    items: ["Structural engineering design coordination", "Mechanical, electrical and plumbing (MEP) coordination", "Quantity surveying and cost-management coordination", "Construction planning and project supervision", "Surveying, planning approvals and statutory submission coordination"],
    note: "Engineering calculations, certifications, surveys and statutory submissions are assigned to suitably qualified and registered practitioners where required."
  },
  {
    number: "03",
    title: "Interiors, property & real estate",
    division: "BABTEK Interiors · BABTEK Real Estate",
    items: ["Interior architecture and space planning", "Furniture, joinery, finishes and fit-out coordination", "Property development concepts and feasibility coordination", "Property acquisition, sales and leasing support", "Property management and real-estate advisory opportunities"],
    note: "Property transactions, legal due diligence, agency activity and regulated services are subject to verification, appropriate authorisation and project-specific agreements."
  },
  {
    number: "04",
    title: "Software, digital & automation",
    division: "BABTEK Smart Solutions",
    items: ["Website and custom web application development", "Business systems and workflow automation", "CAD productivity tools and plugin development", "BIM and digital design workflow exploration", "API integration and AI-enabled workflow development"],
    note: "Software and automation engagements are scoped against available development capacity. Proprietary BABTEK initiatives are labelled as concepts or in development until released."
  },
  {
    number: "05",
    title: "Learning, research & innovation",
    division: "BABTEK Academy · BABTEK Research & Innovation",
    items: ["AutoCAD and architectural drafting learning pathways", "Revit, BIM, 3D modelling and visualisation training concepts", "CAD automation and digital productivity workshops", "Sustainable building and smart-building research themes", "Construction technology, materials and applied innovation"],
    note: "Training dates, instructors, accreditation and research outcomes are announced only when confirmed. Proposed learning pathways are not represented as accredited courses."
  },
  {
    number: "06",
    title: "Enterprise, procurement & partnerships",
    division: "BABTEK Ventures · BABTEK Products & Supply",
    items: ["Building materials, finishes and equipment sourcing", "Furniture, fittings and construction-product procurement", "Supplier and specialist-professional coordination", "Commercial partnerships and joint-venture exploration", "Business development and venture opportunity assessment"],
    note: "Supplier authorisation, product specifications, availability, pricing and delivery terms are checked and agreed for each transaction."
  }
];

export default function CapabilitiesPage() {
  return <main>
    <PageHero eyebrow="OUR PROFESSIONAL CAPABILITIES" title="Connected expertise for" accent="ambitious requirements." description="Explore the disciplines BABTEK brings together across architecture, engineering coordination, project delivery, technology and enterprise. Every engagement is defined by a clear scope, appropriate expertise and transparent delivery arrangements." />
    <section className="section-space">
      <div className="container">
        <div className="portfolio-intro">
          <p className="large-copy">One coordinated point of engagement. The right professional input for each requirement.</p>
          <p>BABTEK Core Nigeria Limited operates as a principal service provider, coordinating client requirements and engaging independent professionals and specialist firms when a project requires additional expertise. This allows the company to build a connected service offering while remaining accurate about its current team and operating capacity.</p>
        </div>
        <div className="capability-catalog">
          {capabilityGroups.map((group) => <article className="capability-group" key={group.number}>
            <div className="capability-group-heading"><span>{group.number}</span><div><p className="eyebrow">{group.division}</p><h2>{group.title}</h2></div></div>
            <div className="capability-group-body"><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{group.note}</p></div>
          </article>)}
        </div>
        <div className="note-panel"><strong>How engagements are delivered</strong><p>Each assignment is reviewed for scope, timeline, budget, technical requirements and professional responsibility. BABTEK coordinates the agreed service and, where necessary, appoints independent specialists under separate engagement terms. No professional registration, certification, in-house department or delivery capacity is implied unless expressly confirmed for that assignment.</p></div>
        <div className="detail-cta"><div><p className="eyebrow eyebrow-light">HAVE A REQUIREMENT?</p><h2>Let's define the right scope.</h2><p>Share your project brief or business requirement. BABTEK will review the information and confirm the appropriate next steps.</p></div><Link className="button" href="/contact">Discuss your requirement <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  </main>;
}
