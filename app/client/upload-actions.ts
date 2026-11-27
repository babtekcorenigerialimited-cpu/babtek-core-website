"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function submitClientProjectFile(formData:FormData){
 const projectId=String(formData.get("project_id")||""),path=String(formData.get("storage_path")||""),title=String(formData.get("title")||"").trim(),filename=String(formData.get("original_filename")||""),mime=String(formData.get("mime_type")||""),size=Number(formData.get("file_size_bytes")||0),notes=String(formData.get("notes")||"").trim().slice(0,2000);
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||title.length<2||!path||!filename||!mime||!Number.isInteger(size)||size<1||size>52428800)redirect("/client?error=upload");
 const sb=await createSupabaseServerClient(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/client/login");
 const {error}=await sb.from("project_file_submissions").insert({project_id:projectId,uploader_id:user.id,uploader_kind:"client",title,original_filename:filename,mime_type:mime,file_size_bytes:size,storage_path:path,notes:notes||null});
 if(error){console.error("Client file submission failed",error.message);redirect("/client?error=upload");}
 revalidatePath("/client");redirect("/client?file_submitted=1");
}
