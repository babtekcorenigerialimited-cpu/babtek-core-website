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

export async function updateProjectDocumentSharing(formData:FormData){
 const id=String(formData.get("submission_id")||"");
 const clientValue=String(formData.get("client_visible")||"");
 const partnerValue=String(formData.get("partner_visible")||"");
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["true","false"].includes(clientValue)||!["true","false"].includes(partnerValue))redirect("/admin/file-submissions?error=sharing");
 const sb=await createSupabaseServerClient(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>["owner","administrator","operations"].includes(r.role)))redirect("/admin");
 const {data:submission,error:submissionError}=await sb.from("project_file_submissions").select("storage_path,review_status").eq("id",id).maybeSingle();
 if(submissionError||!submission||submission.review_status!=="accepted")redirect("/admin/file-submissions?error=sharing");
 const {data:document,error:documentError}=await sb.from("project_documents").select("id").eq("storage_path",submission.storage_path).maybeSingle();
 if(documentError||!document)redirect("/admin/file-submissions?error=sharing");
 const {error}=await sb.from("project_documents").update({client_visible:clientValue==="true",partner_visible:partnerValue==="true"}).eq("id",document.id);
 if(error){console.error("Project document sharing update failed",error.message);redirect("/admin/file-submissions?error=sharing");}
 revalidatePath("/admin/file-submissions");revalidatePath("/client");revalidatePath("/partner");
 redirect("/admin/file-submissions?sharing_saved=1");
}
