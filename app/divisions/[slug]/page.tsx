import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Link from "next/link";
import {PageHero} from "@/components/page-hero";
import {divisions as fallback} from "@/components/division-data";
import {getPublicDivisions,getPublicContent} from "@/lib/public-content";
export const dynamic="force-dynamic";
export async function generateStaticParams(){return fallback.map(d=>({slug:d.slug}));}
async function resolveDivision(slug:string){
 const live=await getPublicDivisions();const record=live.find((d:any)=>d.slug===slug);
 if(record)return {slug:record.slug,name:record.name,pillar:record.pillar,summary:record.summary||"",overview:record.description||record.summary||"",deliveryNote:"BABTEK confirms the scope, availability and involvement of appropriately qualified independent professionals for each engagement.",capabilities:[] as string[]};
 return fallback.find(d=>d.slug===slug)||null;
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const d=await resolveDivision(slug);return {title:d?`BABTEK ${d.name}`:"Division"};}
export default async function DivisionDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const [division,services]=await Promise.all([resolveDivision(slug),getPublicContent<any>("services","id,name,slug,summary,description,delivery_model,lifecycle,division_id","display_order")]);
 if(!division)notFound();
 const related=services.filter((s:any)=>s.slug?.includes(slug)||s.name?.toLowerCase().includes(division.name.toLowerCase()));
 const capabilities=division.capabilities||[];
 return <main><PageHero eyebrow={`BABTEK DIVISION / ${division.pillar}`} title={`BABTEK ${division.name}.`} accent="Expertise in connection." description={division.summary}/><section className="section-space"><div className="container detail-grid"><div><p className="eyebrow">DIVISION OVERVIEW</p><h2 className="section-heading">Purposeful work.<br/><span>Connected thinking.</span></h2></div><div className="detail-copy"><p className="large-copy">{division.overview}</p><p>{division.deliveryNote}</p></div></div>
 {capabilities.length>0&&<div className="container capability-section"><p className="eyebrow">CAPABILITIES & SERVICE AREAS</p><div className="capability-grid">{capabilities.map((capability:string,index:number)=><div className="capability-item" key={capability}><span>{String(index+1).padStart(2,"0")}</span><strong>{capability}</strong></div>)}</div></div>}
 {related.length>0&&<div className="container capability-section"><p className="eyebrow">PUBLISHED SERVICES</p><div className="directory-grid">{related.map((s:any)=><article className="directory-card" key={s.id}><span>{(s.lifecycle||"developing").toUpperCase()}</span><h3>{s.name}</h3><p>{s.summary||s.description}</p></article>)}</div></div>}
 <div className="container detail-cta"><div><p className="eyebrow eyebrow-light">WORK WITH BABTEK</p><h2>Have a requirement in this area?</h2><p>Tell us what you need. We will review the scope and identify an appropriate way forward.</p></div><Link className="button" href={`/contact?division=${division.slug}`}>Make an enquiry <span aria-hidden="true">↗</span></Link></div><div className="container back-link"><Link className="text-link" href="/divisions">← Back to all divisions</Link></div></section></main>;
}