import Link from "next/link";
import {PageHero} from "@/components/page-hero";
import {divisions as fallbackDivisions} from "@/components/division-data";
import {getPublicDivisions} from "@/lib/public-content";
export const dynamic="force-dynamic";
export default async function DivisionsPage(){
 const live=await getPublicDivisions();const divisions=live.length?live:fallbackDivisions;const pillars=["Built Environment","Technology & Innovation","Business & Enterprise Development"];
 return <main><PageHero eyebrow="OUR ENTERPRISE / EIGHT DIVISIONS" title="Specialist disciplines." accent="One shared direction." description="Explore the business divisions that form BABTEK Core Nigeria Limited. Each division contributes to one integrated corporate vision."/><section className="section-space"><div className="container">{pillars.map(pillar=><div className="division-group" key={pillar}><p className="eyebrow">{pillar}</p><div className="directory-grid">{divisions.filter((item:any)=>item.pillar===pillar).map((item:any,i:number)=><article className="directory-card" key={item.slug}><span>{String(i+1).padStart(2,"0")} / BABTEK DIVISION</span><h2>{item.name}</h2><p>{item.summary}</p><Link className="text-link" href={`/divisions/${item.slug}`}>Explore division <span aria-hidden="true">→</span></Link></article>)}</div></div>)}</div></section></main>;
}