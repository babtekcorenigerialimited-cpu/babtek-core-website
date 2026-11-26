import Link from "next/link";
import { PageHero } from "@/components/page-hero";

const products = [
  ["BABTEK AEC Workspace","A proposed workspace for architecture and construction projects, records, tasks and collaboration.","Planned / in development"],
  ["BABTEK Commercial","A proposed commercial workflow tool for quotations, invoices and project administration.","Planned / in development"],
  ["CADWAL-X","A CAD productivity and automation initiative for professional drafting workflows.","Development initiative"],
  ["WAL-X Portfolio","A portfolio and presentation system concept for architectural work.","Development initiative"],
  ["BABTEK AI","A longer-term shared AI capability concept for supported enterprise workflows.","Concept"],
  ["BABTEK Studio & BABTEK-OS","Broader software development and integrated platform concepts.","Long-term concepts"]
];

export default function TechnologyPage() {
  return <main><PageHero eyebrow="BABTEK SMART SOLUTIONS" title="Technology with" accent="practical purpose." description="A growing technology direction focused on software, automation, digital workflows and tools that support professional and enterprise activity." />
    <section className="section-space"><div className="container"><div className="portfolio-intro"><p className="large-copy">Our ambition is to develop useful technology around real professional and business needs, with particular attention to the built environment and enterprise operations.</p><p>The initiatives below describe the intended ecosystem. Their labels reflect their current development status and do not imply that unreleased products are commercially available.</p></div>
      <div className="product-directory">{products.map(([name,desc,status])=><article key={name}><div><span>TECHNOLOGY INITIATIVE</span><h2>{name}</h2><p>{desc}</p></div><small>{status}</small></article>)}</div>
      <div className="detail-cta"><div><p className="eyebrow eyebrow-light">COLLABORATE WITH US</p><h2>Developing a technology idea?</h2><p>Connect with BABTEK about software, automation or digital product collaboration.</p></div><Link className="button" href="/contact?subject=Technology">Technology enquiry ↗</Link></div>
    </div></section>
  </main>;
}
