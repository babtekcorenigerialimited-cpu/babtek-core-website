"use server";

import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function financeAccess(){
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>["owner","administrator","finance"].includes(r.role)))redirect("/admin");
 return {sb,user};
}

export async function recordExpense(form:FormData){
 const {sb,user}=await financeAccess();
 const category=String(form.get("category")||"").trim().slice(0,80);
 const description=String(form.get("description")||"").trim().slice(0,500);
 const amount=Number(form.get("amount"));
 const expenseDate=String(form.get("expense_date")||"");
 const paidTo=String(form.get("paid_to")||"").trim().slice(0,160);
 const projectId=String(form.get("project_id")||"").trim();
 if(!category||!description||!Number.isFinite(amount)||amount<=0||amount>1000000000000||!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate))redirect("/admin/finance?error=invalid");
 const row:any={category,description,amount,currency_code:"NGN",expense_date:expenseDate,paid_to:paidTo||null,recorded_by:user.id};
 if(projectId)row.project_id=projectId;
 const {data,error}=await sb.from("expenses").insert(row).select("id").single();
 if(error)redirect("/admin/finance?error=save");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"expense.recorded",table_name:"expenses",record_id:data.id,metadata:{category,amount,currency_code:"NGN"}});
 revalidatePath("/admin/finance");
 revalidatePath("/admin");
 redirect("/admin/finance?saved=1");
}
