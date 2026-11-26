import { PageHero } from "@/components/page-hero";

export default function ProjectsPage() {
  return <main><PageHero eyebrow="PROJECTS & PORTFOLIO" title="Work, ideas and" accent="project possibilities." description="A developing portfolio of design proposals, coordinated assignments and project work across BABTEK's areas of activity." />
    <section className="section-space"><div className="container"><div className="portfolio-intro"><p className="large-copy">We believe a credible portfolio should show what was proposed, what is in progress and what has actually been completed.</p><p>As approved project records and photography are prepared, portfolio entries will include the project brief, BABTEK's scope, contributors where appropriate and a clear status.</p></div>
      <div className="portfolio-status-grid"><article><span>STATUS 01</span><h2>Proposed</h2><p>Concepts, design proposals and projects under consideration.</p></article><article><span>STATUS 02</span><h2>Ongoing</h2><p>Assignments currently being developed or delivered.</p></article><article><span>STATUS 03</span><h2>Completed</h2><p>Verified work with a confirmed completion status.</p></article></div>
      <div className="note-panel"><strong>Portfolio preparation</strong><p>Verified project content will be added after checking project ownership, client permissions, image rights, actual scope and status. Illustrative imagery will not be presented as completed BABTEK work.</p></div>
    </div></section>
  </main>;
}
