"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function reviewPartnerProgress(formData:FormData){
 const updateId=String(formData.get("update_id")||"");
 const reviewStatus=String(formData.get("review_status")||"");
 const reviewNote=String(formData.get("review_note")||"").trim().slice(0,2000);
 if(!/^[0-9a-f-]{36}$/i.test(updateId)||!["reviewed","changes_requested"].includes(reviewStatus))redirect("/admin/partners?error=review");
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r)=>r.role==="owner"))redirect("/admin");
 const {error}=await sb.from("partner_progress_updates").update({
  review_status:reviewStatus,review_note:reviewNote||null,reviewed_by:user.id,reviewed_at:new Date().toISOString()
 }).eq("id",updateId);
 if(error){console.error("Partner progress review failed",error.message);redirect("/admin/partners?error=review");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"partner.progress_reviewed",table_name:"partner_progress_updates",record_id:updateId,metadata:{review_status:reviewStatus}});
 revalidatePath("/admin/partners");revalidatePath("/partner");redirect("/admin/partners?reviewed=1");
}
