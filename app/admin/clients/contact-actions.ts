"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function addClientContact(formData:FormData){
 const clientId=String(formData.get("client_id")||"");const fullName=String(formData.get("full_name")||"").trim().slice(0,160);const email=String(formData.get("email")||"").trim().toLowerCase().slice(0,254);const phone=String(formData.get("phone")||"").trim().slice(0,40);const userId=String(formData.get("user_id")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(clientId)||!fullName||!email||(userId&&!/^[0-9a-f-]{36}$/i.test(userId)))redirect("/admin/clients?error=contact");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 if(userId){const [{data:profile},{data:userRoles}]=await Promise.all([sb.from("profiles").select("id").eq("id",userId).maybeSingle(),sb.from("user_roles").select("role").eq("user_id",userId)]);if(!profile||!userRoles?.some((r:any)=>r.role==="client"))redirect("/admin/clients?error=account");}
 const {error}=await sb.from("client_contacts").insert({client_id:clientId,full_name:fullName,email,phone:phone||null,user_id:userId||null,is_primary:false});
 if(error){console.error("Client contact creation failed",error.message);redirect("/admin/clients?error=contact");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"client.contact_created",table_name:"client_contacts",metadata:{client_id:clientId,email,account_linked:!!userId}});
 revalidatePath("/admin/clients");redirect("/admin/clients?contact=1");
}