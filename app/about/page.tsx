import { PageHero } from "@/components/page-hero";

export default function AboutPage() {
  return <main>
    <PageHero eyebrow="ABOUT BABTEK" title="A multidisciplinary enterprise." accent="Built around possibility." description="BABTEK Core Nigeria Limited brings together professional expertise, strategic partnerships and technology-led thinking under one corporate identity." />
    <section className="section-space"><div className="container detail-grid">
      <div><p className="eyebrow">OUR IDENTITY</p><h2 className="section-heading">Building a<br /><span>better future.</span></h2></div>
      <div className="detail-copy"><p className="large-copy">We work across the built environment, technology and business development, connecting project needs with relevant expertise and coordinated solutions.</p><p>BABTEK is developing from a founder-led, project-based operating model into a structured multidisciplinary enterprise. Our approach combines internal coordination with independent specialist professionals and strategic partners according to each project's requirements.</p></div>
    </div>
    <div className="container values-grid">
      <article><span>OUR VISION</span><h3>To become a leading African multidisciplinary enterprise delivering world-class infrastructure, innovative architectural solutions, transformative technologies and sustainable business opportunities.</h3></article>
      <article><span>OUR MISSION</span><h3>To integrate professional expertise, innovative technologies and strategic partnerships to deliver quality projects, develop valuable products and provide sustainable solutions across the built environment and other industries.</h3></article>
    </div>
    <div className="container value-list"><p className="eyebrow">OUR VALUES</p><div className="value-chips">{["Innovation","Integrity","Quality","Collaboration","Growth"].map((v)=><span key={v}>{v}</span>)}</div></div>
    <div className="container note-panel"><strong>Our operating approach</strong><p>We coordinate client requirements and engage suitable independent professionals and partners where specialist input is required. Project scope, responsibilities, qualifications and delivery arrangements are established for each engagement.</p></div>
    </section>
  </main>;
}
