"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowed = ["site_pages","services","divisions","projects_public","insights","careers","partnership_opportunities","product_initiatives"] as const;
type Table = typeof allowed[number];
const textValue=(v:FormDataEntryValue|null,max=12000)=>String(v??"").trim().slice(0,max);
const slugify=(s:string)=>s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);

export async function saveContent(formData:FormData){
 const table=textValue(formData.get("table"),64) as Table;
 if(!allowed.includes(table)) redirect("/admin/content?error=invalid");
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/admin/login");
 const {data:roles}=await supabase.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>r.role==="owner")) redirect("/admin");
 const title=textValue(formData.get("title"),180);
 const slug=slugify(textValue(formData.get("slug"),120)||title);
 if(!title||!slug) redirect("/admin/content?error=required");
 const state=textValue(formData.get("visibility"),20);
 if(!["draft","published","archived"].includes(state)) redirect("/admin/content?error=state");
 const summary=textValue(formData.get("summary"),500);
 const description=textValue(formData.get("description"),12000);
 const id=textValue(formData.get("id"),64);
 let row:any={visibility:state};
 if(table==="site_pages"||table==="insights"){
  row={...row,title,slug,excerpt:summary,body:{text:description},...(table==="insights"?{author_id:user.id,published_at:state==="published"?new Date().toISOString():null}:{created_by:user.id,updated_by:user.id})};
 } else if(table==="services"){
  row={...row,name:title,slug,summary,description,delivery_model:textValue(formData.get("delivery_model"),80)||"partner_coordinated",lifecycle:textValue(formData.get("lifecycle"),80)||"developing",display_order:Number(formData.get("display_order")||0)};
 } else if(table==="divisions"){
  row={name:title,slug,pillar:textValue(formData.get("pillar"),80)||"Built Environment",summary,description,lifecycle:textValue(formData.get("lifecycle"),80)||"developing",display_order:Number(formData.get("display_order")||0),is_public:state==="published"};
 } else if(table==="projects_public"){
  row={...row,title,slug,summary,description,project_type:textValue(formData.get("category"),100),location_label:textValue(formData.get("location"),180),status:textValue(formData.get("project_status"),30)||"proposed",approved_for_publication:formData.get("approved")==="on"};
  if(state==="published"&&row.approved_for_publication!==true) redirect("/admin/content?error=approval");
 } else if(table==="careers"){
  row={...row,title,description,location_label:textValue(formData.get("location"),180),employment_type:textValue(formData.get("category"),100),application_email:textValue(formData.get("email"),180)};
 } else if(table==="partnership_opportunities"){
  row={...row,title,category:textValue(formData.get("category"),100),description,application_instructions:summary};
 } else {
  row={...row,name:title,slug,summary,description,status:textValue(formData.get("category"),80)||"concept",public_url:textValue(formData.get("url"),500)};
 }
 const query=id?supabase.from(table).update(row).eq("id",id):supabase.from(table).insert(row);
 const {error}=await query;
 if(error){console.error("Content save failed",table,error.message);redirect("/admin/content?error=save");}
 redirect("/admin/content?saved=1");
}
