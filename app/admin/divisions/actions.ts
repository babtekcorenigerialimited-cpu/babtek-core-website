"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const lifecycleValues=["planned","developing","active","paused"] as const;
async function founder(){const sb=await createSupabaseServerClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);if(!roles?.some((r:any)=>r.role==="owner"))redirect("/admin");return {sb,user};}
export async function updateDivision(form:FormData){
 const {sb,user}=await founder();
 const id=String(form.get("id")||"");const lifecycle=String(form.get("lifecycle")||"");const order=Number(form.get("display_order"));const isPublic=form.get("is_public")==="on";
 if(!/^[0-9a-f-]{36}$/i.test(id)||!lifecycleValues.includes(lifecycle as any)||!Number.isInteger(order)||order<1||order>99)redirect("/admin/divisions?error=invalid");
 const {data:before}=await sb.from("divisions").select("slug,lifecycle,is_public,display_order").eq("id",id).maybeSingle();
 if(!before)redirect("/admin/divisions?error=missing");
 const {error}=await sb.from("divisions").update({lifecycle,is_public:isPublic,display_order:order}).eq("id",id);
 if(error){console.error("Division update failed",error.message);redirect("/admin/divisions?error=save");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"division.updated",table_name:"divisions",record_id:id,metadata:{slug:before.slug,before:{lifecycle:before.lifecycle,is_public:before.is_public,display_order:before.display_order},after:{lifecycle,is_public,display_order:order}}});
 revalidatePath("/admin");revalidatePath("/admin/divisions");revalidatePath("/divisions");revalidatePath("/");
 redirect("/admin/divisions?saved=1");
}
