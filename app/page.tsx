
const divisions = [
  { slug: "design-construction", number: "01", name: "Design & Construction", detail: "Architecture, engineering coordination, construction and project delivery.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85", group: "BUILT ENVIRONMENT" },
  { slug: "interiors", number: "02", name: "Interiors", detail: "Interior architecture, space planning, furniture and finishing solutions.", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85", group: "BUILT ENVIRONMENT" },
  { slug: "real-estate", number: "03", name: "Real Estate", detail: "Property development, consultancy, acquisition and investment opportunities.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=85", group: "BUILT ENVIRONMENT" },
  { slug: "smart-solutions", number: "04", name: "Smart Solutions", detail: "Software, automation, digital transformation and professional technology.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85", group: "TECHNOLOGY & INNOVATION" },
  { slug: "academy", number: "05", name: "Academy", detail: "Technical learning, CAD, BIM, visualisation and professional development.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85", group: "BUSINESS & ENTERPRISE" },
  { slug: "ventures", number: "06", name: "Ventures", detail: "Strategic partnerships, business development and venture opportunities.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85", group: "BUSINESS & ENTERPRISE" },
  { slug: "products-supply", number: "07", name: "Products & Supply", detail: "Building products, materials, procurement and equipment sourcing.", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", group: "BUSINESS & ENTERPRISE" },
  { slug: "research-innovation", number: "08", name: "Research & Innovation", detail: "Sustainable systems, smart buildings, research and emerging technologies.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85", group: "TECHNOLOGY & INNOVATION" },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="container hero-content">
          <p className="eyebrow eyebrow-light">BUILDING A BETTER FUTURE</p>
          <h1>Building Ideas.<br /><span>Engineering Possibilities.</span><br />Creating Value.</h1>
          <p className="hero-description">
            A multidisciplinary Nigerian enterprise connecting professional expertise,
            the built environment, technology and business development.
          </p>
          <div className="hero-actions">
            <a className="button" href="#divisions">Explore BABTEK <span aria-hidden="true">↗</span></a>
            <a className="text-link text-link-light" href="#contact">Discuss a project <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-footnote">ONE CORPORATE IDENTITY&nbsp;&nbsp; / &nbsp;&nbsp;EIGHT BUSINESS DIVISIONS&nbsp;&nbsp; / &nbsp;&nbsp;ONE CONNECTED VISION</div>
        </div>
      </section>

      <section className="intro section-space" id="about">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">WHO WE ARE</p>
            <h2 className="section-heading">One company.<br /><span>Connected expertise.</span></h2>
          </div>
          <div className="intro-copy">
            <p className="large-copy">BABTEK Core Nigeria Limited brings together professional services, specialist partnerships and technology-led thinking under one corporate structure.</p>
            <p>We coordinate project requirements and connect clients with relevant expertise across the built environment and emerging business and technology opportunities. Our delivery model is designed to grow through qualified professionals, trusted partners and carefully developed capabilities.</p>
            <a className="text-link" href="#divisions">Discover our divisions <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="container pillar-grid">
          <article className="pillar"><span>01 / PILLAR</span><h3>Built Environment</h3><p>Design, engineering, construction, interiors and real estate.</p></article>
          <article className="pillar"><span>02 / PILLAR</span><h3>Technology & Innovation</h3><p>Software, automation, research and digital solutions.</p></article>
          <article className="pillar"><span>03 / PILLAR</span><h3>Business & Enterprise</h3><p>Academy, ventures, partnerships, products and supply.</p></article>
        </div>
      </section>

      <section className="divisions-section section-space" id="divisions">
        <div className="container">
          <div className="section-topline"><p className="eyebrow eyebrow-light">OUR ENTERPRISE</p><span>ONE COMPANY / EIGHT DIVISIONS</span></div>
          <div className="section-heading-row"><h2 className="section-heading section-heading-light">Different disciplines.<br /><span>Shared direction.</span></h2><p>Our divisions bring complementary capabilities together while operating as parts of one company.</p></div>
          <div className="division-grid">
            {divisions.map((division) => (
              <article className="division-card" key={division.number}>
                <div className="division-image" role="img" aria-label={division.name + " visual reference"} style={{ backgroundImage: `url(${division.image})` }}><span>{division.number}</span><small>{division.group}</small></div>
                <div className="division-card-copy"><h3>BABTEK {division.name}</h3>
                <p>{division.detail}</p>
                <a href={`/divisions/${division.slug}`} aria-label={`Explore BABTEK ${division.name}`}>Explore division <span aria-hidden="true">↗</span></a></div>
              </article>
            ))}
          </div>
          <p className="section-note">Services are undertaken according to agreed scope, available capability and the involvement of appropriately qualified professionals where required.</p>
        </div>
      </section>



      <section className="projects-section section-space" id="projects">
        <div className="container project-grid">
          <div><p className="eyebrow">SELECTED WORK</p><h2 className="section-heading">Ideas taking<br /><span>shape.</span></h2></div>
          <div className="project-copy"><p>Our portfolio will present verified projects, design proposals and coordinated assignments across the company's areas of activity.</p><p className="project-status">Every entry will be clearly identified by its status: proposed, ongoing or completed.</p><a className="text-link" href="#contact">Discuss a project <span aria-hidden="true">→</span></a></div>
        </div>
        <div className="container capability-gallery">
          <article className="capability-feature"><div className="capability-photo capability-photo-architecture"/><div><span>01 / BUILT ENVIRONMENT</span><strong>Spaces shaped by thoughtful design.</strong><p>Architectural and engineering coordination, planned around each project's brief and delivery requirements.</p></div></article>
          <div className="capability-side">
            <article><div className="capability-photo capability-photo-interior"/><span>02 / INTERIOR ENVIRONMENTS</span><strong>Purposeful spaces. Considered details.</strong></article>
            <article><div className="capability-photo capability-photo-digital"/><span>03 / TECHNOLOGY & INNOVATION</span><strong>Connected tools for modern work.</strong></article>
          </div>
          <p className="gallery-disclaimer">Visual references illustrate areas of interest and capability—not a claim that these are completed BABTEK projects. Verified project case studies will be published separately with their correct status.</p>
        </div>
      </section>

      <section className="technology-section section-space" id="technology">
        <div className="container technology-grid">
          <div><p className="eyebrow eyebrow-light">THE NEXT FRONTIER</p><h2 className="section-heading section-heading-light">Professional expertise.<br /><span>Powered by technology.</span></h2></div>
          <div><p>BABTEK's technology direction includes digital tools and proprietary products intended to improve how projects, professional workflows and business operations are managed.</p><div className="tech-ecosystem-visual" aria-label="Illustrative BABTEK technology ecosystem">
            <div className="tech-ecosystem-core">BABTEK<br/><b>CORE</b></div>
            {["AEC WORKSPACE","COMMERCIAL","CADWAL-X","WAL-X PORTFOLIO","BABTEK AI","BABTEK-OS"].map((item,i)=><span className={`tech-ecosystem-node node-${i}`} key={item}>{item}</span>)}
            <svg viewBox="0 0 520 300" aria-hidden="true"><path d="M260 150 L80 55 M260 150 L440 55 M260 150 L55 150 M260 150 L465 150 M260 150 L80 245 M260 150 L440 245"/></svg>
          </div>
          <p className="technology-note">These are product concepts and development initiatives, not claims of currently released software.</p><p className="technology-note">Product concepts and development initiatives will be labelled accurately until officially released.</p></div>
        </div>
      </section>

      <section className="contact-section section-space" id="contact">
        <div className="container contact-grid">
          <div><p className="eyebrow">START A CONVERSATION</p><h2 className="section-heading">Let's build<br /><span>something meaningful.</span></h2><p className="contact-copy">Tell us about your project, professional requirement or partnership opportunity.</p></div>
          <div className="contact-details"><a href="mailto:babtekcorenigerialimited@gmail.com"><span>EMAIL</span>babtekcorenigerialimited@gmail.com</a><a href="tel:+2347089765358"><span>TELEPHONE</span>+234 708 976 5358</a><a href="tel:+2348075583442"><span>TELEPHONE</span>+234 807 558 3442</a><a href="https://www.instagram.com/babtekcore/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span>@babtekcore ↗</a><a className="button contact-button" href="mailto:babtekcorenigerialimited@gmail.com?subject=BABTEK%20Project%20Enquiry">Send an enquiry <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </main>
  );
}
