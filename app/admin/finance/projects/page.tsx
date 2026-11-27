import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {SignOutButton} from "@/components/admin/signout-button";

export const dynamic="force-dynamic";

type Row = Record<string, any>;
const amount=(value:number,currency:string)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:currency||"NGN",maximumFractionDigits:0}).format(value||0);
const sum=(rows:Row[],key:string)=>rows.reduce((total,row)=>total+Number(row[key]||0),0);
const paidStatuses=["confirmed","paid","completed"];
const invoiceStatuses=["issued","partially_paid","paid","overdue"];

export default async function ProjectFinancePage(){
 const sb=await createSupabaseServerClient();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)redirect("/admin/login");
 const {data:roles}=await sb.from("user_roles").select("role").eq("user_id",user.id);
 if(!roles?.some((r:any)=>["owner","administrator","finance"].includes(r.role)))redirect("/admin");

 const [projectRes,engagementRes,expenseRes,invoiceRes]=await Promise.all([
  sb.from("projects").select("id,project_code,name,status,client_fee,currency_code").order("created_at",{ascending:false}).limit(500),
  sb.from("project_partner_engagements").select("id,project_id,agreed_fee,currency_code,status").limit(2000),
  sb.from("expenses").select("id,project_id,amount,currency_code,expense_date").not("project_id","is",null).order("expense_date",{ascending:false}).limit(2000),
  sb.from("invoices").select("id,project_id,invoice_number,status,total_amount,currency_code").not("project_id","is",null).limit(2000)
 ]);
 const projects:Row[]=projectRes.data||[];
 const projectIds=projects.map(p=>p.id);
 const engagements:Row[]=engagementRes.data||[];
 const expenses:Row[]=expenseRes.data||[];
 const invoices:Row[]=invoiceRes.data||[];
 const invoiceIds=invoices.map(i=>i.id);
 const [scheduleRes,paymentRes]=await Promise.all([
  engagements.length?sb.from("partner_payment_schedules").select("engagement_id,amount,paid_amount,status").in("engagement_id",engagements.map(e=>e.id)).limit(4000):Promise.resolve({data:[] as Row[],error:null}),
  invoiceIds.length?sb.from("client_payments").select("invoice_id,amount,status").in("invoice_id",invoiceIds).limit(4000):Promise.resolve({data:[] as Row[],error:null})
 ]);
 const schedules:Row[]=scheduleRes.data||[];
 const payments:Row[]=paymentRes.data||[];
 const rows=projects.map(project=>{
  const currency=project.currency_code||"NGN";
  const projectEngagements=engagements.filter(e=>e.project_id===project.id&&e.currency_code===currency&&!["cancelled"].includes(e.status));
  const projectExpenses=expenses.filter(e=>e.project_id===project.id&&e.currency_code===currency);
  const projectInvoices=invoices.filter(i=>i.project_id===project.id&&i.currency_code===currency&&invoiceStatuses.includes(i.status));
  const projectInvoiceIds=new Set(projectInvoices.map(i=>i.id));
  const projectPayments=payments.filter(p=>projectInvoiceIds.has(p.invoice_id)&&paidStatuses.includes(String(p.status).toLowerCase()));
  const specialistCommitments=sum(projectEngagements,"agreed_fee");
  const directCosts=sum(projectExpenses,"amount");
  const clientFee=Number(project.client_fee||0);
  const invoiced=sum(projectInvoices,"total_amount");
  const receipts=sum(projectPayments,"amount");
  const invoiceBalance=Math.max(0,invoiced-receipts);
  const grossMargin=clientFee-specialistCommitments-directCosts;
  const marginPercent=clientFee>0?(grossMargin/clientFee)*100:null;
  const schedulesForProject=schedules.filter(s=>projectEngagements.some(e=>e.id===s.engagement_id));
  const partnerPaid=sum(schedulesForProject,"paid_amount");
  const partnerOutstanding=Math.max(0,specialistCommitments-partnerPaid);
  return {id:project.id,code:project.project_code,name:project.name,status:project.status,currency,clientFee,specialistCommitments,directCosts,invoiced,receipts,invoiceBalance,grossMargin,marginPercent,partnerPaid,partnerOutstanding,hasFinancialData:clientFee>0||projectEngagements.length>0||projectExpenses.length>0||projectInvoices.length>0};
 });
 const queryError=projectRes.error||engagementRes.error||expenseRes.error||invoiceRes.error||scheduleRes.error||paymentRes.error;
 const currencyTotals=new Map<string,{fee:number;commitments:number;costs:number;margin:number;invoiced:number;receipts:number;receivable:number;payable:number}>();
 for(const row of rows){const x=currencyTotals.get(row.currency)||{fee:0,commitments:0,costs:0,margin:0,invoiced:0,receipts:0,receivable:0,payable:0};x.fee+=row.clientFee;x.commitments+=row.specialistCommitments;x.costs+=row.directCosts;x.margin+=row.grossMargin;x.invoiced+=row.invoiced;x.receipts+=row.receipts;x.receivable+=row.invoiceBalance;x.payable+=row.partnerOutstanding;currencyTotals.set(row.currency,x);}
 const truncated=projects.length>=500||engagements.length>=2000||expenses.length>=2000||invoices.length>=2000||schedules.length>=4000||payments.length>=4000;
 return <main className="admin-shell">
  <aside className="admin-sidebar"><Link href="/admin" className="admin-sidebar-brand"><span className="admin-brand-mark">B</span><span><strong>BABTEK CORE</strong><small>ENTERPRISE CONTROL</small></span></Link><p className="admin-nav-label">COMMAND CENTRE</p><Link className="admin-nav-item" href="/admin">Enterprise overview</Link><p className="admin-nav-label">FINANCE & COMMERCIAL</p><Link className="admin-nav-item" href="/admin/finance">Finance centre</Link><Link className="admin-nav-item active" href="/admin/finance/projects">Project profitability</Link><Link className="admin-nav-item" href="/admin/projects">Project records</Link><Link className="admin-nav-item" href="/admin/clients">Client register</Link><Link className="admin-nav-item" href="/admin/partners">Partner register</Link><div className="admin-sidebar-bottom"><span className="admin-avatar">MD</span><span><strong>Finance oversight</strong><small>RESTRICTED WORKSPACE</small></span></div></aside>
  <section className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">BABTEK / FINANCE / PROJECT PROFITABILITY</span><h1>Project financial performance</h1></div><div className="admin-top-actions"><Link className="admin-signout" href="/admin/finance">Finance centre</Link><SignOutButton/></div></header>
   <div className="admin-welcome admin-register-welcome"><div><p className="admin-kicker">PROJECT COMMERCIAL INTELLIGENCE</p><h2>Understand the financial position of each project.</h2><p>Compare agreed client fees, specialist commitments, direct costs, invoices, recorded receipts and outstanding balances.</p></div><span className="admin-welcome-mark">₦</span></div>
   {queryError&&<p className="admin-alert">One or more financial data sources could not be loaded. Some figures may be incomplete; check access permissions before relying on this report.</p>}
   {truncated&&<p className="admin-alert">The report reached a record retrieval limit. Totals may be incomplete; narrow the reporting period or add pagination before relying on portfolio-wide totals.</p>}
   <section className="admin-panel finance-method-panel"><div className="admin-panel-heading"><div><h2>How the figures are calculated</h2><p>Project-level operational management view.</p></div><span>IMPORTANT</span></div><div className="finance-method-grid"><p><strong>Gross project margin</strong><br/>Recorded client fee less active specialist engagement fees and project-linked expenses. It is not net profit and excludes general overhead, tax, financing and other unrecorded costs.</p><p><strong>Client receivable</strong><br/>Linked issued/paid invoices less recorded confirmed, paid or completed receipts. Draft and cancelled invoices are excluded.</p><p><strong>Partner payable</strong><br/>Active specialist commitments less payment amounts recorded against their schedules. Missing payment schedules may make this estimate incomplete.</p><p><strong>Currency handling</strong><br/>Figures are grouped by each project's currency. No foreign-exchange conversion or cross-currency total is performed.</p></div></section>
   <section className="admin-panel finance-table-panel"><div className="admin-panel-heading"><div><h2>Portfolio totals by currency</h2><p>Only project-linked records returned by the database are included.</p></div><span>{rows.length} projects</span></div>
    {currencyTotals.size?<div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Currency</th><th>Client fees</th><th>Specialist commitments</th><th>Direct costs</th><th>Gross margin</th><th>Receipts</th><th>Receivables</th><th>Partner payable</th></tr></thead><tbody>{Array.from(currencyTotals.entries()).map(([currency,x])=><tr key={currency}><td><strong>{currency}</strong></td><td>{amount(x.fee,currency)}</td><td>{amount(x.commitments,currency)}</td><td>{amount(x.costs,currency)}</td><td><strong>{amount(x.margin,currency)}</strong></td><td>{amount(x.receipts,currency)}</td><td>{amount(x.receivable,currency)}</td><td>{amount(x.payable,currency)}</td></tr>)}</tbody></table></div>:<p className="admin-empty-note">No project records are available yet.</p>}
   </section>
   <section className="admin-panel finance-table-panel"><div className="admin-panel-heading"><div><h2>Project-by-project performance</h2><p>Projects without recorded fees or costs remain visible; missing values are not invented.</p></div><span>{rows.length} shown</span></div>
    {rows.length?<div className="finance-table-wrap"><table className="finance-table project-finance-table"><thead><tr><th>Project</th><th>Client fee</th><th>Specialist commitments</th><th>Direct costs</th><th>Gross margin</th><th>Invoiced</th><th>Receipts</th><th>Receivable</th><th>Partner payable</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.code||"Project"}</strong><small>{row.name}</small><small>{row.status.replaceAll("_"," ")}</small></td><td>{amount(row.clientFee,row.currency)}</td><td>{amount(row.specialistCommitments,row.currency)}</td><td>{amount(row.directCosts,row.currency)}</td><td><strong>{amount(row.grossMargin,row.currency)}</strong><small>{row.marginPercent===null?"Margin % unavailable":row.marginPercent.toFixed(1)+"% of client fee"}</small></td><td>{amount(row.invoiced,row.currency)}</td><td>{amount(row.receipts,row.currency)}</td><td>{amount(row.invoiceBalance,row.currency)}</td><td>{amount(row.partnerOutstanding,row.currency)}</td></tr>)}</tbody></table></div>:<p className="admin-empty-note">No project financial records have been registered yet.</p>}
   </section>
   <p className="admin-footnote finance-disclaimer">This is a management report, not a reconciled cashbook, statutory accounting ledger, tax statement or audited financial statement. It relies on accurate project fees, engagement records, payment schedules, invoices, payment statuses and project-linked expense entries. Amounts recorded in another currency are not converted. Reconcile all figures to approved agreements, source documents and bank statements.</p>
   <footer className="admin-footer">BABTEK CORE NIGERIA LIMITED <span>Project financial performance · Access-controlled</span></footer>
  </section>
 </main>;
}
