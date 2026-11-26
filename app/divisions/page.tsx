import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { divisions } from "@/components/division-data";

export default function DivisionsPage() {
  const pillars = ["Built Environment", "Technology & Innovation", "Business & Enterprise Development"];
  return (
    <main>
      <PageHero eyebrow="OUR ENTERPRISE / EIGHT DIVISIONS" title="Specialist disciplines." accent="One shared direction." description="Explore the business divisions that form BABTEK Core Nigeria Limited. Each division contributes to one integrated corporate vision." />
      <section className="section-space">
        <div className="container">
          {pillars.map((pillar) => (
            <div className="division-group" key={pillar}>
              <p className="eyebrow">{pillar}</p>
              <div className="directory-grid">
                {divisions.filter((item) => item.pillar === pillar).map((item) => (
                  <article className="directory-card" key={item.slug}>
                    <span>{item.number} / BABTEK DIVISION</span>
                    <h2>{item.name}</h2>
                    <p>{item.summary}</p>
                    <Link className="text-link" href={`/divisions/${item.slug}`}>Explore division <span aria-hidden="true">→</span></Link>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
