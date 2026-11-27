import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/enquiry-form";
import Link from "next/link";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ division?: string; subject?: string }> }) {
  const params = await searchParams;
  const context = params.division ? `Division: ${params.division}` : params.subject ? params.subject.replaceAll("%20", " ") : "General enquiry";
  return <main>
    <PageHero eyebrow="CONTACT BABTEK" title="Start a" accent="conversation." description="Tell us about a project, professional requirement, supply need or partnership opportunity." />
    <section className="section-space"><div className="container contact-grid">
      <div><p className="eyebrow">CORPORATE CONTACT</p><h2 className="section-heading">Let's understand<br/><span>what you need.</span></h2>
        <p className="contact-copy">Share an initial outline and the relevant BABTEK contact channel can help direct your enquiry.</p>
        <div className="note-panel"><strong>Project enquiries</strong><p>Please include your project location, type of requirement, expected timeline and any available brief or drawings when making contact.</p></div>
        <div className="contact-details">
          <a href="mailto:babtekcorenigerialimited@gmail.com"><span>EMAIL</span>babtekcorenigerialimited@gmail.com</a>
          <a href="tel:+2347089765358"><span>TELEPHONE</span>+234 708 976 5358</a>
          <a href="tel:+2348075583442"><span>TELEPHONE</span>+234 807 558 3442</a>
          <a href="https://wa.me/2347089765358" target="_blank" rel="noreferrer"><span>WHATSAPP</span>Message BABTEK ↗</a>
          <a href="https://www.instagram.com/babtekcore/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span>@babtekcore ↗</a>
        </div>
        <Link className="text-link" href="/divisions">Explore divisions →</Link>
      </div>
      <div className="enquiry-panel"><p className="eyebrow">ONLINE ENQUIRY</p><h2>Tell us what you have in mind.</h2><p className="enquiry-intro">Your message will be routed to BABTEK's enquiry records once the secure backend is configured.</p><EnquiryForm defaultSubject={context} /></div>
    </div></section>
  </main>;
}
