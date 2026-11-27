"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const allowed=["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation","text/plain","application/zip"];
export async function submitPartnerProjectFile(formData:FormData){
 const projectId=String(formData.get("project_id")||""),engagementId=String(formData.get("engagement_id")||""),path=String(formData.get("storage_path")||""),title=String(formData.get("title")||"").trim(),filename=String(formData.get("original_filename")||""),mime=String(formData.get("mime_type")||""),size=Number(formData.get("file_size_bytes")||0),notes=String(formData.get("notes")||"").trim().slice(0,2000);
 const sb=await createSupabaseServerClient(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/partner/login");
 const prefix=user.id+"/"+projectId+"/"+engagementId+"/";
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||!/^[0-9a-f-]{36}$/i.test(engagementId)||title.length<2||title.length>180||!path.startsWith(prefix)||path.slice(prefix.length).includes("/")||!filename||filename.length>255||!allowed.includes(mime)||!Number.isInteger(size)||size<1||size>52428800)redirect("/partner?error=upload");
 const {error}=await sb.from("project_file_submissions").insert({project_id:projectId,partner_engagement_id:engagementId,uploader_id:user.id,uploader_kind:"partner",title,original_filename:filename,mime_type:mime,file_size_bytes:size,storage_path:path,notes:notes||null});
 if(error){console.error("Partner file submission failed",error.message);redirect("/partner?error=upload");}
 revalidatePath("/partner");redirect("/partner?file_submitted=1");
}
