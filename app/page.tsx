const divisions = [
  { slug: "design-construction", number: "01", name: "Design & Construction", detail: "Architecture, engineering coordination, construction and project delivery.", group: "BUILT ENVIRONMENT" },
  { slug: "interiors", number: "02", name: "Interiors", detail: "Interior architecture, space planning, furniture and finishing solutions.", group: "BUILT ENVIRONMENT" },
  { slug: "real-estate", number: "03", name: "Real Estate", detail: "Property development, consultancy, acquisition and investment opportunities.", group: "BUILT ENVIRONMENT" },
  { slug: "smart-solutions", number: "04", name: "Smart Solutions", detail: "Software, automation, digital transformation and professional technology.", group: "TECHNOLOGY & INNOVATION" },
  { slug: "academy", number: "05", name: "Academy", detail: "Technical learning, CAD, BIM, visualisation and professional development.", group: "BUSINESS & ENTERPRISE" },
  { slug: "ventures", number: "06", name: "Ventures", detail: "Strategic partnerships, business development and venture opportunities.", group: "BUSINESS & ENTERPRISE" },
  { slug: "products-supply", number: "07", name: "Products & Supply", detail: "Building products, materials, procurement and equipment sourcing.", group: "BUSINESS & ENTERPRISE" },
  { slug: "research-innovation", number: "08", name: "Research & Innovation", detail: "Sustainable systems, smart buildings, research and emerging technologies.", group: "TECHNOLOGY & INNOVATION" },
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
                <div className="division-meta"><span>{division.number}</span><span>{division.group}</span></div>
                <h3>BABTEK {division.name}</h3>
                <p>{division.detail}</p>
                <a href={`/divisions/${division.slug}`} aria-label={`Explore BABTEK ${division.name}`}>Explore division <span aria-hidden="true">↗</span></a>
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
        <div className="container portfolio-placeholder"><div><span>PROJECT PORTFOLIO</span><strong>Verified BABTEK project photography and case studies will appear here.</strong></div></div>
      </section>

      <section className="technology-section section-space" id="technology">
        <div className="container technology-grid">
          <div><p className="eyebrow eyebrow-light">THE NEXT FRONTIER</p><h2 className="section-heading section-heading-light">Professional expertise.<br /><span>Powered by technology.</span></h2></div>
          <div><p>BABTEK's technology direction includes digital tools and proprietary products intended to improve how projects, professional workflows and business operations are managed.</p><div className="product-list"><span>BABTEK AEC Workspace</span><span>BABTEK Commercial</span><span>CADWAL-X</span><span>WAL-X Portfolio</span><span>BABTEK AI & future platforms</span></div><p className="technology-note">Product concepts and development initiatives will be labelled accurately until officially released.</p></div>
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
