"use client";
import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
type Brand={company_name:string;corporate_tagline:string;marketing_headline:string;positioning_statement:string;primary_color:string;accent_color:string;background_color:string;text_color:string;logo_light_path:string|null;logo_dark_path:string|null;favicon_path:string|null;is_published:boolean};
const defaults:Brand={company_name:"BABTEK CORE NIGERIA LIMITED",corporate_tagline:"Building a Better Future.",marketing_headline:"Building Ideas. Engineering Possibilities. Creating Value.",positioning_statement:"Building Nigeria’s Future with Precision & Integrity.",primary_color:"#123B68",accent_color:"#65B4F3",background_color:"#FFFFFF",text_color:"#263442",logo_light_path:null,logo_dark_path:null,favicon_path:null,is_published:false};
export function BrandManager({saved}:{saved:Partial<Brand>|null}){
 const [b,setB]=useState<Brand>({...defaults,...(saved??{})});const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
 const sb=useMemo(()=>createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),[]);
 const set=(k:keyof Brand,v:any)=>setB(x=>({...x,[k]:v}));
 const url=(p:string|null)=>p?sb.storage.from("babtek-brand-assets").getPublicUrl(p).data.publicUrl:"";
 async function upload(file:File|undefined,key:"logo_light_path"|"logo_dark_path"|"favicon_path"){
  if(!file)return;const allowed=["image/png","image/jpeg","image/webp","image/svg+xml","image/x-icon","image/vnd.microsoft.icon"];
  if(!allowed.includes(file.type)||file.size>5242880){setMsg("Use PNG, JPEG, WebP, SVG or ICO files up to 5 MB.");return;}
  setBusy(true);const ext=file.name.split(".").pop()?.toLowerCase()||"png";const path=key.replace("_path","")+"/"+Date.now()+"-"+crypto.randomUUID()+"."+ext;
  const {error}=await sb.storage.from("babtek-brand-assets").upload(path,file,{contentType:file.type,upsert:false});setBusy(false);
  if(error){setMsg("Upload failed. Check your owner session and try again.");return;}set(key,path);setMsg("Asset uploaded. Save the settings to retain this selection.");
 }
 async function save(publish:boolean){
  setBusy(true);setMsg(publish?"Publishing…":"Saving…");const {data:{user}}=await sb.auth.getUser();
  if(!user){setBusy(false);setMsg("Session expired. Sign in again.");return;}
  const {error}=await sb.from("brand_settings").upsert({id:true,...b,is_published:publish?true:b.is_published,updated_by:user.id,updated_at:new Date().toISOString()});
  setBusy(false);setMsg(error?"Could not save. Confirm your owner access and try again.":publish?"Brand identity published.":"Brand settings saved.");
  if(!error&&publish)setB(x=>({...x,is_published:true}));
 }
 const fields=[["company_name","Registered company name"],["corporate_tagline","Corporate tagline"],["marketing_headline","Marketing headline"],["positioning_statement","Positioning statement"]] as const;
 const colours=[["primary_color","Primary blue"],["accent_color","Accent blue"],["background_color","Background"],["text_color","Text"]] as const;
 const assets=[["logo_light_path","Logo for light backgrounds"],["logo_dark_path","Logo for dark backgrounds"],["favicon_path","Website favicon"]] as const;
 return <div className="brand-manager">
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Brand identity</h2><p>Company naming and approved messaging.</p></div><span>{b.is_published?"PUBLISHED":"DRAFT"}</span></div><div className="brand-fields">{fields.map(([k,l])=><label key={k}>{l}<input value={b[k]} onChange={e=>set(k,e.target.value)}/></label>)}</div></section>
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Brand colour system</h2><p>Set the core colours used across the corporate identity.</p></div></div><div className="brand-colours">{colours.map(([k,l])=><label key={k}>{l}<span className="brand-colour-input"><input type="color" value={b[k]} onChange={e=>set(k,e.target.value)}/><input value={b[k]} onChange={e=>set(k,e.target.value)}/></span></label>)}</div><div className="brand-preview" style={{background:b.background_color,color:b.text_color,borderTop:"6px solid "+b.primary_color}}><span style={{color:b.accent_color}}>LIVE PREVIEW</span><h3 style={{color:b.primary_color}}>{b.company_name}</h3><strong>{b.corporate_tagline}</strong><p>{b.marketing_headline}</p></div></section>
 <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Official brand assets</h2><p>Upload the approved logo files and favicon. Previous versions are preserved.</p></div></div><div className="brand-assets">{assets.map(([k,l])=><div className="brand-asset" key={k}><strong>{l}</strong>{b[k]?<img src={url(b[k])} alt={l}/>:<div className="brand-asset-empty">No file selected</div>}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon" onChange={e=>upload(e.target.files?.[0],k)}/></div>)}</div></section>
 <div className="brand-actions"><p role="status">{msg||"Changes are not public until you publish the brand identity."}</p><button className="admin-signout" disabled={busy} onClick={()=>save(false)}>Save settings</button><button className="brand-publish" disabled={busy} onClick={()=>save(true)}>Publish brand identity</button></div></div>;
}