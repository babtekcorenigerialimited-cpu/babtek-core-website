"use server";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function sendClientProjectMessage(formData:FormData){
 const projectId=String(formData.get("project_id")||"");const body=String(formData.get("body")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||body.length<1||body.length>10000)redirect("/client?error=invalid");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/client/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="client"))redirect("/client?error=access");
 const {error}=await sb.from("communication_messages").insert({project_id:projectId,sender_id:user.id,body,message_type:"client_reply"});
 if(error){console.error("Client message failed",error.message);redirect("/client?error=send");}
 redirect("/client?sent=1");
}