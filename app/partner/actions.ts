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
