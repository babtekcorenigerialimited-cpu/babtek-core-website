import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { divisions } from "@/components/division-data";

export default function ServicesPage() {
  return <main><PageHero eyebrow="WHAT WE DO" title="Services shaped around" accent="your requirements." description="Explore the service areas connected to BABTEK's multidisciplinary structure. Each engagement is scoped according to the project, available capability and appropriate professional input." />
    <section className="section-space"><div className="container"><div className="directory-grid">
      {divisions.map((d)=><article className="directory-card" key={d.slug}><span>{d.pillar.toUpperCase()}</span><h2>{d.name}</h2><p>{d.summary}</p><Link className="text-link" href={`/divisions/${d.slug}`}>View service areas <span aria-hidden="true">→</span></Link></article>)}
    </div><div className="note-panel"><strong>Project-specific scope</strong><p>Not every service is delivered by an in-house team. BABTEK may coordinate suitably qualified independent professionals and delivery partners. Scope, availability, professional responsibility and fees are confirmed before engagement.</p></div></div></section>
  </main>;
}
