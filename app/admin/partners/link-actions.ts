"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function linkPartnerAccount(formData:FormData){
 const partnerId=String(formData.get("partner_id")||""),userId=String(formData.get("user_id")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(partnerId)||!/^[0-9a-f-]{36}$/i.test(userId))redirect("/admin/partners?error=link");
 const sb=await createSupabaseServerClient(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");
 const {error}=await sb.rpc("link_partner_account_owner_verified",{p_partner_id:partnerId,p_user_id:userId});
 if(error){console.error("Verified partner account link failed",error.message);redirect("/admin/partners?error=account");}
 revalidatePath("/admin/partners");revalidatePath("/partner");redirect("/admin/partners?linked=1");
}
