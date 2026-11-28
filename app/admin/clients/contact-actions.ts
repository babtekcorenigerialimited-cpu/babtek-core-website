"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function addClientContact(formData:FormData){
 const clientId=String(formData.get("client_id")||"");
 const fullName=String(formData.get("full_name")||"").trim().slice(0,160);
 const email=String(formData.get("email")||"").trim().toLowerCase().slice(0,254);
 const phone=String(formData.get("phone")||"").trim().slice(0,40);
 const userId=String(formData.get("user_id")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(clientId)||fullName.length<2||!/^\S+@\S+\.\S+$/.test(email)||(userId&&!/^[0-9a-f-]{36}$/i.test(userId)))redirect("/admin/clients?error=contact");
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 const {data:contactId,error}=await sb.rpc("create_client_contact_owner_verified",{
  p_client_id:clientId,p_full_name:fullName,p_email:email,p_phone:phone||null,p_user_id:userId||null
 });
 if(error||!contactId){
  console.error("Client contact creation or verified account linking failed",error?.message||"No contact ID returned");
  redirect("/admin/clients?error="+(userId?"account":"contact"));
 }
 await sb.from("audit_logs").insert({actor_id:user.id,action:"client.contact_created",table_name:"client_contacts",record_id:contactId,metadata:{client_id:clientId,email,account_linked:!!userId}});
 revalidatePath("/admin/clients");
 revalidatePath("/client");
 redirect("/admin/clients?contact=1");
}
