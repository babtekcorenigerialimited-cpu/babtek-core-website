"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendCommunicationMessage(formData: FormData) {
  const enquiryId = String(formData.get("enquiry_id") || "");
  const projectId = String(formData.get("project_id") || "");
  const body = String(formData.get("body") || "").trim();
  if ((!enquiryId && !projectId) || (enquiryId && projectId) || body.length < 1 || body.length > 10000) {
    redirect("/admin/communications?error=invalid");
  }
  const uuid = /^[0-9a-f-]{36}$/i;
  if ((enquiryId && !uuid.test(enquiryId)) || (projectId && !uuid.test(projectId))) {
    redirect("/admin/communications?error=invalid");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => ["owner", "administrator", "operations"].includes(item.role))) redirect("/admin");
  const { error } = await supabase.from("communication_messages").insert({
    enquiry_id: enquiryId || null,
    project_id: projectId || null,
    sender_id: user.id,
    body,
    message_type: "internal_note",
  });
  if (error) redirect("/admin/communications?error=send");
  redirect("/admin/communications?sent=1");
}

export async function sendClientProjectReply(formData:FormData){
 const projectId=String(formData.get("project_id")||"");const body=String(formData.get("body")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||body.length<1||body.length>10000)redirect("/admin/communications?error=send");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>["owner","administrator","operations"].includes(r.role)))redirect("/admin");
 const {error}=await sb.from("communication_messages").insert({project_id:projectId,sender_id:user.id,body,message_type:"client_reply"});
 if(error){console.error("Client project reply failed",error.message);redirect("/admin/communications?error=send");}
 redirect("/admin/communications?replied=1");
}

export async function sendPartnerProjectReply(formData:FormData){
 const engagementId=String(formData.get("engagement_id")||"");const body=String(formData.get("body")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(engagementId)||body.length<1||body.length>10000)redirect("/admin/communications?error=send");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>["owner","administrator","operations"].includes(r.role)))redirect("/admin");
 const {data:engagement}=await sb.from("project_partner_engagements").select("id,project_id").eq("id",engagementId).maybeSingle();if(!engagement)redirect("/admin/communications?error=send");
 const {error}=await sb.from("communication_messages").insert({project_id:engagement.project_id,partner_engagement_id:engagement.id,sender_id:user.id,body,message_type:"partner_update"});
 if(error){console.error("Partner reply failed",error.message);redirect("/admin/communications?error=send");}
 redirect("/admin/communications?partner_replied=1");
}
