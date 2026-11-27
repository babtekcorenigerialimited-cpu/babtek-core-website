import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const validTypes=["professional","technology","supplier","venture","strategic","research","education","other"];
const validDivisions=["design-construction","interiors","real-estate","smart-solutions","academy","ventures","products-supply","research-innovation"];
export async function POST(request:Request){
 if(!(request.headers.get("content-type")||"").includes("application/json"))return NextResponse.json({error:"Unsupported request format."},{status:415});
 let body:Record<string,unknown>;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid application."},{status:400});}
 if(clean(body.website_honeypot,200))return NextResponse.json({ok:true,reference:"received"});
 if(JSON.stringify(body).length>12000)return NextResponse.json({error:"Application is too large."},{status:413});
 const applicant_name=clean(body.applicant_name,160),organisation=clean(body.organisation,180),email=clean(body.email,254).toLowerCase(),phone=clean(body.phone,40);
 const partner_type=clean(body.partner_type,40),primary_category=clean(body.primary_category,120);
 const experience_summary=clean(body.experience_summary,5000),collaboration_interest=clean(body.collaboration_interest,3000);
 const website=clean(body.website,255),specialties=clean(body.specialties,1000).split(",").map(x=>x.trim().slice(0,80)).filter(Boolean).slice(0,20);
 const division_affiliations=Array.isArray(body.division_affiliations)?body.division_affiliations.map(x=>clean(x,80)).filter(x=>validDivisions.includes(x)).slice(0,8):[];
 if(body.privacy_acknowledged!==true||applicant_name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!validTypes.includes(partner_type)||primary_category.length<2||experience_summary.length<20||collaboration_interest.length<20)
  return NextResponse.json({error:"Please complete the required fields with a valid email and enough detail."},{status:400});
 if(website){try{const u=new URL(website);if(!["http:","https:"].includes(u.protocol))throw new Error();}catch{return NextResponse.json({error:"Enter a valid portfolio or website URL."},{status:400});}}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:"The application service is not configured. Please contact BABTEK directly."},{status:503});
 const reference="PNA-"+crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase();
 const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {error}=await sb.from("partner_network_applications").insert({
  reference_code:reference,applicant_name,organisation:organisation||null,email,phone:phone||null,partner_type,primary_category,
  specialties,division_affiliations,website:website||null,experience_summary,collaboration_interest,
  privacy_acknowledged:true,privacy_acknowledged_at:new Date().toISOString(),privacy_notice_version:"2026-11-27"
 });
 if(error){console.error("Partner network application intake failed",error.code||"unknown");return NextResponse.json({error:"We could not save your application. Please try again or contact BABTEK."},{status:503});}
 return NextResponse.json({ok:true,reference},{status:201});
}
