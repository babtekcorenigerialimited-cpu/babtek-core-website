"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function financeAccess(){
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>["owner","administrator","finance"].includes(r.role)))redirect("/admin");
 return {sb,user};
}
const fail=(code:string):never=>redirect("/admin/finance/partners?error="+code);
const uuid=/^[0-9a-f-]{36}$/i;

export async function createPartnerPaymentSchedule(form:FormData){
 const {sb,user}=await financeAccess();
 const engagementId=String(form.get("engagement_id")||"");
 const description=String(form.get("description")||"").trim().slice(0,300);
 const amount=Number(form.get("amount"));
 const dueDate=String(form.get("due_date")||"");
 if(!uuid.test(engagementId)||description.length<3||!Number.isFinite(amount)||amount<=0||amount>1e12||!(dueDate===""||/^\d{4}-\d{2}-\d{2}$/.test(dueDate)))fail("schedule");
 const {data:engagement}=await sb.from("project_partner_engagements").select("id,status").eq("id",engagementId).maybeSingle();
 if(!engagement||engagement.status==="cancelled")fail("schedule");
 const {error}=await sb.rpc("create_partner_payment_schedule",{p_engagement_id:engagementId,p_description:description,p_amount:amount,p_due_date:dueDate||null});
 if(error){console.error("Partner schedule create failed",error.message);fail(error.message.toLowerCase().includes("exceed")?"schedule_over":"schedule");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"partner_payment_schedule.created_by_ui",table_name:"partner_payment_schedules",metadata:{engagement_id:engagementId,amount}});
 revalidatePath("/admin/finance/partners");revalidatePath("/admin/finance");revalidatePath("/partner");
 redirect("/admin/finance/partners?saved=schedule");
}

export async function recordPartnerPayment(form:FormData){
 const {sb}=await financeAccess();
 const scheduleId=String(form.get("schedule_id")||"");
 const amount=Number(form.get("amount"));
 const date=String(form.get("payment_date")||"");
 const method=String(form.get("method")||"").trim();
 const reference=String(form.get("transaction_reference")||"").trim();
 const notes=String(form.get("notes")||"").trim();
 if(!uuid.test(scheduleId)||!Number.isFinite(amount)||amount<=0||!/^\d{4}-\d{2}-\d{2}$/.test(date)||method.length<2||method.length>80||reference.length<2||reference.length>160)fail("payment");
 const {error}=await sb.rpc("record_partner_payment",{p_schedule_id:scheduleId,p_amount:amount,p_payment_date:date,p_method:method,p_reference:reference,p_evidence_path:null,p_notes:notes||null});
 if(error){console.error("Atomic partner payment recording failed",error.message);fail(error.message.toLowerCase().includes("exceeds")?"payment_over":"payment");}
 revalidatePath("/admin/finance/partners");revalidatePath("/admin/finance");revalidatePath("/admin/finance/projects");revalidatePath("/admin");revalidatePath("/partner");
 redirect("/admin/finance/partners?saved=payment");
}
