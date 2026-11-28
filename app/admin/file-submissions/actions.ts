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
 const {data:submission,error:submissionError}=await sb.from("project_file_submissions").select("storage_path,review_status,project_id").eq("id",id).maybeSingle();
 if(submissionError||!submission||submission.review_status!=="accepted")redirect("/admin/file-submissions?error=sharing");
 const {data:document,error:documentError}=await sb.from("project_documents").select("id,client_visible,partner_visible").eq("storage_path",submission.storage_path).maybeSingle();
 if(documentError||!document)redirect("/admin/file-submissions?error=sharing");
 const nextClientVisible=clientValue==="true",nextPartnerVisible=partnerValue==="true";
 const {error}=await sb.from("project_documents").update({client_visible:nextClientVisible,partner_visible:nextPartnerVisible}).eq("id",document.id);
 if(error){console.error("Project document sharing update failed",error.message);redirect("/admin/file-submissions?error=sharing");}
 const {error:auditError}=await sb.from("audit_logs").insert({
  actor_id:user.id,
  action:"project_document.sharing_updated",
  table_name:"project_documents",
  record_id:document.id,
  metadata:{
   project_id:submission.project_id,
   submission_id:id,
   before:{client_visible:document.client_visible,partner_visible:document.partner_visible},
   after:{client_visible:nextClientVisible,partner_visible:nextPartnerVisible}
  }
 });
 if(auditError)console.error("Project document sharing audit log failed",auditError.message);
 revalidatePath("/admin/file-submissions");revalidatePath("/client");revalidatePath("/partner");
 redirect(auditError?"/admin/file-submissions?sharing_saved=1&sharing_audit=failed":"/admin/file-submissions?sharing_saved=1");
}
