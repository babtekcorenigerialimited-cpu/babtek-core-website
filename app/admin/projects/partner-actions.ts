"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function requireOwner(){
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r)=>r.role==="owner"))redirect("/admin");
 return {sb,user};
}

export async function createPartnerEngagement(formData:FormData){
 const projectId=String(formData.get("project_id")||"");
 const partnerId=String(formData.get("partner_id")||"");
 const scope=String(formData.get("scope_of_work")||"").trim().slice(0,5000);
 const fee=Number(formData.get("agreed_fee"));
 const currency=String(formData.get("currency_code")||"NGN").toUpperCase();
 const paymentTerms=String(formData.get("payment_terms")||"").trim().slice(0,2000);
 const status=String(formData.get("status")||"proposed");
 const startDate=String(formData.get("start_date")||"").trim();
 const dueDate=String(formData.get("due_date")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||!/^[0-9a-f-]{36}$/i.test(partnerId)||scope.length<10||!Number.isFinite(fee)||fee<0||!/^[A-Z]{3}$/.test(currency)||!["proposed","accepted","in_progress","completed","cancelled"].includes(status))redirect("/admin/projects?error=engagement");
 const {sb,user}=await requireOwner();
 const {error}=await sb.from("project_partner_engagements").insert({
  project_id:projectId,partner_id:partnerId,scope_of_work:scope,agreed_fee:fee,currency_code:currency,
  payment_terms:paymentTerms||null,status,start_date:startDate||null,due_date:dueDate||null
 });
 if(error){console.error("Partner engagement creation failed",error.message);redirect("/admin/projects?error=engagement");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"partner.engagement_created",table_name:"project_partner_engagements",metadata:{project_id:projectId,partner_id:partnerId,agreed_fee:fee,currency_code:currency}});
 revalidatePath("/admin/projects");revalidatePath("/partner");redirect("/admin/projects?engaged=1");
}

export async function createPartnerPaymentSchedule(formData:FormData){
 const engagementId=String(formData.get("engagement_id")||"");
 const description=String(formData.get("description")||"").trim().slice(0,300);
 const amount=Number(formData.get("amount"));
 const dueDate=String(formData.get("due_date")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(engagementId)||description.length<2||!Number.isFinite(amount)||amount<0)redirect("/admin/projects?error=schedule");
 const {sb,user}=await requireOwner();
 const {error}=await sb.from("partner_payment_schedules").insert({
  engagement_id:engagementId,description,amount,due_date:dueDate||null,status:"planned"
 });
 if(error){console.error("Partner payment schedule creation failed",error.message);redirect("/admin/projects?error=schedule");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"partner.payment_schedule_created",table_name:"partner_payment_schedules",metadata:{engagement_id:engagementId,amount}});
 revalidatePath("/admin/projects");revalidatePath("/partner");redirect("/admin/projects?scheduled=1");
}
