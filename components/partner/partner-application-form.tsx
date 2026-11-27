"use client";
import {useState,type FormEvent} from "react";

const divisions=[
 ["design-construction","Design & Construction"],["interiors","Interiors"],["real-estate","Real Estate"],
 ["smart-solutions","Smart Solutions"],["academy","Academy"],["ventures","Ventures"],
 ["products-supply","Products & Supply"],["research-innovation","Research & Innovation"]
];
const types=[["professional","Professional / consultant"],["technology","Technology / software"],["supplier","Supplier / manufacturer"],["venture","Venture / investment"],["strategic","Strategic / business partner"],["research","Research / innovation"],["education","Education / training"],["other","Other"]];
export function PartnerApplicationForm(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setReference("");
  const form=e.currentTarget,data=new FormData(form);
  const payload={
   applicant_name:String(data.get("applicant_name")||""),organisation:String(data.get("organisation")||""),
   email:String(data.get("email")||""),phone:String(data.get("phone")||""),partner_type:String(data.get("partner_type")||"professional"),
   primary_category:String(data.get("primary_category")||""),specialties:String(data.get("specialties")||""),
   division_affiliations:data.getAll("division_affiliations").map(String),website:String(data.get("portfolio_url")||""),
   experience_summary:String(data.get("experience_summary")||""),collaboration_interest:String(data.get("collaboration_interest")||""),
   website_honeypot:String(data.get("website_honeypot")||"")
  };
  try{
   const response=await fetch("/api/partner-applications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Your application could not be submitted.");
   setReference(result.reference||"received");form.reset();
  }catch(err){setError(err instanceof Error?err.message:"A network error occurred. Please try again.");}
  finally{setBusy(false);}
 }
 if(reference)return <div className="note-panel" role="status"><strong>Application received</strong><p>Your BABTEK partner network reference is <b>{reference}</b>. Keep it for your records. BABTEK will review your application. You may create a partner account using the same email address; once your application is approved and your email is verified, the platform can link your account automatically. Approval is not a guarantee of a project assignment.</p><p><a className="text-link" href="/partner/register">Create your partner account →</a></p></div>;
 return <form className="partner-application-form" onSubmit={submit}>
  <div className="partner-form-grid">
   <label>Full name *<input name="applicant_name" required maxLength={160} autoComplete="name"/></label>
   <label>Organisation / business name<input name="organisation" maxLength={180} autoComplete="organization"/></label>
   <label>Email address *<input name="email" type="email" required maxLength={254} autoComplete="email"/></label>
   <label>Phone / WhatsApp<input name="phone" type="tel" maxLength={40} autoComplete="tel"/></label>
   <label>Relationship category *<select name="partner_type" defaultValue="professional">{types.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
   <label>Primary expertise / category *<input name="primary_category" required maxLength={120} placeholder="e.g. Structural engineering, software, procurement"/></label>
   <label className="partner-form-wide">Specialties<input name="specialties" maxLength={1000} placeholder="Separate areas of expertise with commas"/></label>
   <label className="partner-form-wide">Portfolio / company website<input name="portfolio_url" type="url" maxLength={255} placeholder="https://…"/></label>
   <fieldset className="partner-form-wide"><legend>Which BABTEK divisions are relevant?</legend><div className="partner-division-options">{divisions.map(([v,l])=><label key={v}><input type="checkbox" name="division_affiliations" value={v}/>{l}</label>)}</div></fieldset>
   <label className="partner-form-wide">Experience, capability and relevant work *<textarea name="experience_summary" required minLength={20} maxLength={5000} rows={5} placeholder="Tell us about your experience, services, team, qualifications or previous work."/></label>
   <label className="partner-form-wide">How would you like to collaborate with BABTEK? *<textarea name="collaboration_interest" required minLength={20} maxLength={3000} rows={4} placeholder="Describe the opportunities, services, products or partnership you have in mind."/></label>
   <label className="partner-honeypot" aria-hidden="true">Leave this field empty<input name="website_honeypot" tabIndex={-1} autoComplete="off"/></label>
  </div>
  {error&&<p className="admin-alert" role="alert">{error}</p>}
  <button type="submit" disabled={busy}>{busy?"Submitting application…":"Submit partner network application"}</button>
  <small>Submitting an application does not create employment, guarantee a contract or grant access to BABTEK projects. Applications are reviewed before network activation.</small>
 </form>;
}
