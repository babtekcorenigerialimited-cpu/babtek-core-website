import {PageHero} from "@/components/page-hero";
import {getPublicContent} from "@/lib/public-content";
export const dynamic="force-dynamic";
export default async function InsightsPage(){
 const posts=await getPublicContent<any>("insights","id,title,slug,excerpt,body,published_at","published_at");
 return <main><PageHero eyebrow="INSIGHTS & UPDATES" title="Ideas, knowledge" accent="and company news." description="Official BABTEK announcements, project insights, professional perspectives and developments across our business areas."/><section className="section-space"><div className="container">{posts.length?<div className="directory-grid">{posts.map((post:any)=><article className="directory-card" key={post.id}><span>{post.published_at?new Date(post.published_at).toLocaleDateString("en-NG",{dateStyle:"long"}):"BABTEK INSIGHT"}</span><h2>{post.title}</h2><p>{post.excerpt||post.body?.text||""}</p></article>)}</div>:<div className="note-panel"><strong>Updates are being prepared</strong><p>Approved articles and announcements will appear here once published through the BABTEK content centre.</p></div>}</div></section></main>;
}