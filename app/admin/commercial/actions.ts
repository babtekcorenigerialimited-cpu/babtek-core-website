"use server";

import {randomUUID} from "crypto";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function access(){
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>["owner","administrator","finance","operations"].includes(r.role)))redirect("/admin");
 return {sb,user};
}
async function financeAccess(){
 const result=await access();
 const {data:roles}=await result.sb.from("user_roles").select("role").eq("user_id",result.user.id);
 if(!roles?.some((r:any)=>["owner","administrator","finance"].includes(r.role)))redirect("/admin");
 return result;
}
const idPattern=/^[0-9a-f-]{36}$/i;
const today=()=>new Date().toISOString().slice(0,10);
const ref=(prefix:string)=>prefix+"-"+today().replaceAll("-","")+"-"+randomUUID().slice(0,6).toUpperCase();
const fail=(code:string):never=>redirect("/admin/commercial?error="+code);
const refresh=()=>{for(const path of ["/admin/commercial","/admin/finance","/admin/finance/projects","/admin","/client"])revalidatePath(path);};

export async function createQuotation(form:FormData){
 const {sb,user}=await access();
 const clientId=String(form.get("client_id")||"");
 const projectId=String(form.get("project_id")||"");
 const currency=String(form.get("currency_code")||"NGN").toUpperCase();
 const validUntil=String(form.get("valid_until")||"");
 const terms=String(form.get("terms")||"").trim().slice(0,5000);
 let items:any[]=[];try{items=JSON.parse(String(form.get("items_json")||"[]"));}catch{fail("quote_items");}
 if(!idPattern.test(clientId)||!(["NGN","USD","GBP","EUR"].includes(currency))||!Array.isArray(items)||items.length<1||items.length>30)fail("quote");
 const {data:client}=await sb.from("clients").select("id").eq("id",clientId).maybeSingle();if(!client)fail("quote");
 if(projectId){if(!idPattern.test(projectId))fail("quote");const {data:p}=await sb.from("projects").select("id,client_id,currency_code").eq("id",projectId).maybeSingle();if(!p||p.client_id!==clientId||p.currency_code.trim()!==currency)fail("quote");}
 const normalized=[];let subtotal=0;
 for(let i=0;i<items.length;i++){const x=items[i];const description=String(x.description||"").trim().slice(0,500);const quantity=Number(x.quantity);const unitPrice=Number(x.unit_price);if(!description||!Number.isFinite(quantity)||quantity<=0||quantity>1000000||!Number.isFinite(unitPrice)||unitPrice<0||unitPrice>1e12)fail("quote_items");const line=Math.round(quantity*unitPrice*100)/100;subtotal+=line;normalized.push({description,quantity,unit:String(x.unit||"").slice(0,40)||null,unit_price:unitPrice,line_total:line,display_order:i});}
 const discount=Number(form.get("discount_amount")||0),tax=Number(form.get("tax_amount")||0);
 if(!Number.isFinite(discount)||discount<0||discount>subtotal||!Number.isFinite(tax)||tax<0||tax>1e12)fail("quote");
 const total=Math.round((subtotal-discount+tax)*100)/100;
 const {data:quote,error}=await sb.from("quotations").insert({quotation_number:ref("QT"),project_id:projectId||null,client_id:clientId,status:"draft",issue_date:null,valid_until:/^\d{4}-\d{2}-\d{2}$/.test(validUntil)?validUntil:null,currency_code:currency,subtotal,discount_amount:discount,tax_amount:tax,total_amount:total,terms:terms||null,created_by:user.id}).select("id").single();
 if(error)fail("quote");
 if(!quote)redirect("/admin/commercial?error=quote");
 const quotationId=quote.id;
 const {error:itemError}=await sb.from("quotation_items").insert(normalized.map(x=>({...x,quotation_id:quotationId})));
 if(itemError){await sb.from("quotations").delete().eq("id",quotationId);fail("quote_items");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"quotation.created",table_name:"quotations",record_id:quotationId,metadata:{total,currency_code:currency,item_count:normalized.length}});
 refresh();redirect("/admin/commercial?created=quotation");
}
export async function updateQuotationStatus(form:FormData){
 const {sb,user}=await access();const id=String(form.get("quotation_id")||"");const status=String(form.get("status")||"");
 if(!idPattern.test(id)||!["issued","signed","superseded","void"].includes(status))fail("quote_status");
 const {data:q}=await sb.from("quotations").select("id,status").eq("id",id).maybeSingle();if(!q||q.status!=="draft"&&status==="issued")fail("quote_status");
 const {error}=await sb.from("quotations").update({status,issue_date:status==="issued"?today():undefined}).eq("id",id);if(error)fail("quote_status");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"quotation.status_changed",table_name:"quotations",record_id:id,metadata:{status}});
 refresh();redirect("/admin/commercial?updated=quotation");
}
export async function createInvoiceFromQuotation(form:FormData){
 const {sb,user}=await access();const id=String(form.get("quotation_id")||"");if(!idPattern.test(id))fail("invoice");
 const {data:q}=await sb.from("quotations").select("id,quotation_number,project_id,client_id,status,currency_code,subtotal,discount_amount,tax_amount,total_amount,terms").eq("id",id).maybeSingle();
 if(!q||!["issued","signed"].includes(q.status))fail("invoice");
 const {data:existingInvoice}=await sb.from("invoices").select("id").eq("quotation_id",id).limit(1).maybeSingle();if(existingInvoice)fail("invoice");
 const {data:items}=await sb.from("quotation_items").select("description,quantity,unit,unit_price,line_total,display_order").eq("quotation_id",id).order("display_order");
 if(!items?.length)fail("invoice");
 const {data:invoice,error}=await sb.from("invoices").insert({invoice_number:ref("INV"),project_id:q.project_id,client_id:q.client_id,quotation_id:q.id,status:"draft",currency_code:q.currency_code,subtotal:q.subtotal,discount_amount:q.discount_amount,tax_amount:q.tax_amount,total_amount:q.total_amount,notes:q.terms,created_by:user.id}).select("id").single();
 if(error||!invoice)fail("invoice");
 const {error:itemError}=await sb.from("invoice_items").insert(items.map(x=>({...x,invoice_id:invoice.id})));
 if(itemError){await sb.from("invoices").delete().eq("id",invoice.id);fail("invoice");}
 await sb.from("audit_logs").insert({actor_id:user.id,action:"invoice.created_from_quotation",table_name:"invoices",record_id:invoice.id,metadata:{quotation_id:q.id,total:q.total_amount}});
 refresh();redirect("/admin/commercial?created=invoice");
}
export async function issueInvoice(form:FormData){
 const {sb,user}=await access();const id=String(form.get("invoice_id")||"");const due=String(form.get("due_date")||"");
 if(!idPattern.test(id)||!/^\d{4}-\d{2}-\d{2}$/.test(due))fail("invoice");
 const {data:inv}=await sb.from("invoices").select("id,status,total_amount").eq("id",id).maybeSingle();if(!inv||inv.status!=="draft"||Number(inv.total_amount)<=0)fail("invoice");
 const {error}=await sb.from("invoices").update({status:"issued",issue_date:today(),due_date:due}).eq("id",id);if(error)fail("invoice");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"invoice.issued",table_name:"invoices",record_id:id,metadata:{due_date:due}});
 refresh();redirect("/admin/commercial?updated=invoice");
}
export async function recordClientPayment(form:FormData){
 const {sb,user}=await access();const invoiceId=String(form.get("invoice_id")||"");const amount=Number(form.get("amount"));const method=String(form.get("method")||"").trim().slice(0,80);const reference=String(form.get("transaction_reference")||"").trim().slice(0,160);const date=String(form.get("payment_date")||today());
 if(!idPattern.test(invoiceId)||!Number.isFinite(amount)||amount<=0||amount>1e12||!method||!reference||!/^\d{4}-\d{2}-\d{2}$/.test(date))fail("payment");
 const {data:inv}=await sb.from("invoices").select("id,status,total_amount,currency_code").eq("id",invoiceId).maybeSingle();if(!inv||!["issued","partially_paid","overdue"].includes(inv.status))fail("payment");
 const {data:existing}=await sb.from("client_payments").select("amount,status").eq("invoice_id",invoiceId);
 const already=(existing||[]).filter((x:any)=>["confirmed","paid","completed"].includes(String(x.status).toLowerCase())).reduce((s:number,x:any)=>s+Number(x.amount),0);
 if(amount>Number(inv.total_amount)-already+0.005)fail("payment_exceeds");
 const {data:payment,error}=await sb.from("client_payments").insert({invoice_id:invoiceId,amount,currency_code:inv.currency_code,payment_date:date,method,transaction_reference:reference,status:"confirmed",recorded_by:user.id}).select("id").single();
 if(error||!payment)fail("payment");
 const newTotal=already+amount;const newStatus=newTotal+0.005>=Number(inv.total_amount)?"paid":"partially_paid";
 const {error:updateError}=await sb.from("invoices").update({status:newStatus}).eq("id",invoiceId);if(updateError)fail("payment");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"client_payment.recorded",table_name:"client_payments",record_id:payment.id,metadata:{invoice_id:invoiceId,amount,currency_code:inv.currency_code,reference}});
 refresh();redirect("/admin/commercial?created=payment");
}
export async function createAgreement(form:FormData){
 const {sb,user}=await access();const clientId=String(form.get("client_id")||"");const projectId=String(form.get("project_id")||"");const type=String(form.get("agreement_type")||"client_service");const effective=String(form.get("effective_date")||"");const expiry=String(form.get("expiry_date")||"");const terms=String(form.get("terms_summary")||"").trim().slice(0,10000);
 if(!idPattern.test(clientId)||!terms||!["client_service","consultancy","construction","other"].includes(type))fail("agreement");
 const {data:c}=await sb.from("clients").select("id").eq("id",clientId).maybeSingle();if(!c)fail("agreement");
 if(projectId){if(!idPattern.test(projectId))fail("agreement");const {data:p}=await sb.from("projects").select("id,client_id").eq("id",projectId).maybeSingle();if(!p||p.client_id!==clientId)fail("agreement");}
 const {data:agreement,error}=await sb.from("agreements").insert({agreement_number:ref("AGR"),project_id:projectId||null,client_id:clientId,agreement_type:type,status:"draft",effective_date:/^\d{4}-\d{2}-\d{2}$/.test(effective)?effective:null,expiry_date:/^\d{4}-\d{2}-\d{2}$/.test(expiry)?expiry:null,terms_summary:terms,created_by:user.id}).select("id").single();
 if(error||!agreement)fail("agreement");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"agreement.draft_created",table_name:"agreements",record_id:agreement.id,metadata:{agreement_type:type}});
 refresh();redirect("/admin/commercial?created=agreement");
}
export async function updateAgreementStatus(form:FormData){
 const {sb,user}=await access();const id=String(form.get("agreement_id")||"");const status=String(form.get("status")||"");
 if(!idPattern.test(id)||!["issued","signed","superseded","void"].includes(status))fail("agreement_status");
 const {data:a}=await sb.from("agreements").select("id,status,effective_date").eq("id",id).maybeSingle();if(!a||a.status!=="draft"&&status==="issued")fail("agreement_status");
 const {error}=await sb.from("agreements").update({status,effective_date:status==="issued"?(a.effective_date||today()):undefined}).eq("id",id);if(error)fail("agreement_status");
 await sb.from("audit_logs").insert({actor_id:user.id,action:"agreement.status_changed",table_name:"agreements",record_id:id,metadata:{status}});
 refresh();redirect("/admin/commercial?updated=agreement");
}
