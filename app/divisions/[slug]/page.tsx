import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { divisions } from "@/components/division-data";

export function generateStaticParams() {
  return divisions.map((division) => ({ slug: division.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const division = divisions.find((item) => item.slug === slug);
  return { title: division ? `BABTEK ${division.name}` : "Division" };
}

export default async function DivisionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const division = divisions.find((item) => item.slug === slug);
  if (!division) notFound();

  return (
    <main>
      <PageHero eyebrow={`BABTEK DIVISION ${division.number} / ${division.pillar}`} title={`BABTEK ${division.name}.`} accent="Expertise in connection." description={division.summary} />
      <section className="section-space">
        <div className="container detail-grid">
          <div>
            <p className="eyebrow">DIVISION OVERVIEW</p>
            <h2 className="section-heading">Purposeful work.<br /><span>Connected thinking.</span></h2>
          </div>
          <div className="detail-copy">
            <p className="large-copy">{division.overview}</p>
            <p>{division.deliveryNote}</p>
          </div>
        </div>
        <div className="container capability-section">
          <p className="eyebrow">CAPABILITIES & SERVICE AREAS</p>
          <div className="capability-grid">
            {division.capabilities.map((capability, index) => (
              <div className="capability-item" key={capability}><span>0{index + 1}</span><strong>{capability}</strong></div>
            ))}
          </div>
        </div>
        <div className="container detail-cta">
          <div><p className="eyebrow eyebrow-light">WORK WITH BABTEK</p><h2>Have a requirement in this area?</h2><p>Tell us what you need. We will review the scope and identify an appropriate way forward.</p></div>
          <Link className="button" href={`/contact?division=${division.slug}`}>Make an enquiry <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="container back-link"><Link className="text-link" href="/divisions">← Back to all divisions</Link></div>
      </section>
    </main>
  );
}
