"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function reviewProjectFileSubmission(formData:FormData){
 const id=String(formData.get("submission_id")||""),decision=String(formData.get("decision")||""),note=String(formData.get("review_note")||"").trim().slice(0,2000);
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["accepted","changes_requested","rejected"].includes(decision))redirect("/admin/file-submissions?error=invalid");
 const sb=await createSupabaseServerClient(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>["owner","administrator","operations"].includes(r.role)))redirect("/admin");
 const {error}=await sb.rpc("review_project_file_submission",{p_submission_id:id,p_decision:decision,p_review_note:note||null});
 if(error){console.error("File submission review failed",error.message);redirect("/admin/file-submissions?error=review");}
 revalidatePath("/admin/file-submissions");revalidatePath("/client");revalidatePath("/partner");redirect("/admin/file-submissions?reviewed=1");
}
