"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function updatePartnerTask(formData:FormData){
 const taskId=String(formData.get("task_id")||"");
 const status=String(formData.get("status")||"");
 const allowed=["not_started","in_progress","blocked","completed"];
 if(!/^[0-9a-f-]{36}$/i.test(taskId)||!allowed.includes(status))redirect("/partner?error=invalid");
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)redirect("/partner/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>r.role==="partner"))redirect("/partner?error=access");
 const {data:links}=await sb.from("partner_user_links").select("partner_id").eq("user_id",user.id);
 const partnerIds=(links||[]).map((x:any)=>x.partner_id);
 if(!partnerIds.length)redirect("/partner?error=access");
 const {error}=await sb.from("project_tasks").update({status,completed_at:status==="completed"?new Date().toISOString():null}).eq("id",taskId).in("assigned_partner_id",partnerIds);
 if(error){console.error("Partner task update failed",error.message);redirect("/partner?error=save");}
 revalidatePath("/partner");
 redirect("/partner?updated=1");
}

export async function submitPartnerProgress(formData:FormData){
 const taskId=String(formData.get("task_id")||"");
 const updateText=String(formData.get("update_text")||"").trim().slice(0,5000);
 const rawProgress=String(formData.get("progress_percent")||"");
 const progress=rawProgress===""?null:Number(rawProgress);
 if(!/^[0-9a-f-]{36}$/i.test(taskId)||updateText.length<10||(progress!==null&&(!Number.isInteger(progress)||progress<0||progress>100)))redirect("/partner?error=progress");
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/partner/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>r.role==="partner"))redirect("/partner?error=access");
 const {data:links}=await sb.from("partner_user_links").select("partner_id").eq("user_id",user.id);
 const partnerIds=(links||[]).map((x:any)=>x.partner_id);
 const {data:task}=await sb.from("project_tasks").select("id,project_id,assigned_partner_id").eq("id",taskId).in("assigned_partner_id",partnerIds).maybeSingle();
 if(!task)redirect("/partner?error=access");
 const {data:engagement}=await sb.from("project_partner_engagements").select("id").eq("project_id",task.project_id).eq("partner_id",task.assigned_partner_id).limit(1).maybeSingle();
 if(!engagement)redirect("/partner?error=access");
 const {error}=await sb.from("partner_progress_updates").insert({engagement_id:engagement.id,task_id:task.id,submitted_by:user.id,update_text:updateText,progress_percent:progress});
 if(error){console.error("Partner progress submission failed",error.message);redirect("/partner?error=progress");}
 revalidatePath("/partner");revalidatePath("/admin/partners");
 redirect("/partner?progress_sent=1");
}

export async function sendPartnerProjectMessage(formData:FormData){
 const projectId=String(formData.get("project_id")||"");const body=String(formData.get("body")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||body.length<1||body.length>10000)redirect("/partner?error=message");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/partner/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="partner"))redirect("/partner?error=access");
 const {data:links}=await sb.from("partner_user_links").select("partner_id").eq("user_id",user.id);
 const ids=(links||[]).map((x:any)=>x.partner_id);if(!ids.length)redirect("/partner?error=access");
 const {data:engagement}=await sb.from("project_partner_engagements").select("id").eq("project_id",projectId).in("partner_id",ids).limit(1).maybeSingle();
 if(!engagement)redirect("/partner?error=access");
 const {error}=await sb.from("communication_messages").insert({project_id:projectId,sender_id:user.id,body,message_type:"partner_update"});
 if(error){console.error("Partner message failed",error.message);redirect("/partner?error=message");}
 revalidatePath("/partner");revalidatePath("/admin/communications");redirect("/partner?message_sent=1");
}
