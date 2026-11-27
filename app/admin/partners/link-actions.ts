"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function linkPartnerAccount(formData:FormData){
 const partnerId=String(formData.get("partner_id")||"");const userId=String(formData.get("user_id")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(partnerId)||!/^[0-9a-f-]{36}$/i.test(userId))redirect("/admin/partners?error=link");
 const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 const [{data:partner},{data:profile}]=await Promise.all([
  sb.from("professional_partners").select("id,relationship_status").eq("id",partnerId).maybeSingle(),
  sb.from("profiles").select("id").eq("id",userId).maybeSingle()
 ]);
 if(!partner||partner.relationship_status!=="active"||!profile)redirect("/admin/partners?error=account");
 const {error:roleError}=await sb.from("user_roles").upsert({user_id:userId,role:"partner",granted_by:user.id},{onConflict:"user_id,role"});
 if(roleError){console.error("Partner role assignment failed",roleError.message);redirect("/admin/partners?error=link");}
 const {error:linkError}=await sb.from("partner_user_links").upsert({partner_id:partnerId,user_id:userId},{onConflict:"partner_id,user_id"});
 if(linkError){console.error("Partner account link failed",linkError.message);redirect("/admin/partners?error=link");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"partner.account_linked",table_name:"partner_user_links",record_id:partnerId,metadata:{partner_id:partnerId,user_id:userId}});
 revalidatePath("/admin/partners");revalidatePath("/partner");redirect("/admin/partners?linked=1");
}
