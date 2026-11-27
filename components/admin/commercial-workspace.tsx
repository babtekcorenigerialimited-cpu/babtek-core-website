"use client";
import {useState} from "react";
import {createQuotation} from "@/app/admin/commercial/actions";

type Client={id:string,label:string};type Project={id:string,label:string,client_id:string|null,currency_code:string};
type Item={description:string,quantity:string,unit:string,unit_price:string};
export function CommercialWorkspace({clients,projects}:{clients:Client[];projects:Project[]}){
 const [clientId,setClientId]=useState("");const [projectId,setProjectId]=useState("");const [currency,setCurrency]=useState("NGN");
 const [items,setItems]=useState<Item[]>([{description:"",quantity:"1",unit:"",unit_price:""}]);
 const [discount,setDiscount]=useState("0");const [tax,setTax]=useState("0");
 const scopedProjects=projects.filter(p=>(!p.client_id||p.client_id===clientId)&&p.currency_code===currency);
 const subtotal=items.reduce((s,x)=>s+(Number(x.quantity)||0)*(Number(x.unit_price)||0),0);
 const total=Math.max(0,subtotal-(Number(discount)||0)+(Number(tax)||0));
 const json=JSON.stringify(items.map(x=>({description:x.description,quantity:Number(x.quantity),unit:x.unit,unit_price:Number(x.unit_price)})));
 return <form action={createQuotation} className="cms-form commercial-quote-form">
  <div className="admin-panel-heading"><div><h2>Create client quotation</h2><p>Prepare a draft quotation with multiple priced service or deliverable lines.</p></div><span>NEW QUOTATION</span></div>
  <div className="commercial-form-grid"><label>Client<select name="client_id" required value={clientId} onChange={e=>{setClientId(e.target.value);setProjectId("");}}><option value="">Select registered client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label>Related project (optional)<select name="project_id" value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Not linked to a project</option>{scopedProjects.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label><label>Currency<select name="currency_code" value={currency} onChange={e=>{setCurrency(e.target.value);setProjectId("");}}><option value="NGN">NGN – Nigerian Naira</option><option value="USD">USD – US Dollar</option><option value="GBP">GBP – Pound Sterling</option><option value="EUR">EUR – Euro</option></select></label><label>Valid until<input type="date" name="valid_until"/></label></div>
  <input type="hidden" name="items_json" value={json}/>
  <div className="commercial-items-heading"><strong>Quotation line items</strong><button type="button" className="commercial-secondary" onClick={()=>setItems(v=>[...v,{description:"",quantity:"1",unit:"",unit_price:""}])} disabled={items.length>=30}>Add line item</button></div>
  {items.map((item,index)=><div className="commercial-line-item" key={index}><label>Description<input required value={item.description} onChange={e=>setItems(v=>v.map((x,i)=>i===index?{...x,description:e.target.value}:x))} placeholder="e.g. Architectural design and documentation"/></label><label>Qty<input required type="number" min="0.001" step="0.001" value={item.quantity} onChange={e=>setItems(v=>v.map((x,i)=>i===index?{...x,quantity:e.target.value}:x))}/></label><label>Unit<input value={item.unit} onChange={e=>setItems(v=>v.map((x,i)=>i===index?{...x,unit:e.target.value}:x))} placeholder="LS / m² / item"/></label><label>Unit price<input required type="number" min="0" step="0.01" value={item.unit_price} onChange={e=>setItems(v=>v.map((x,i)=>i===index?{...x,unit_price:e.target.value}:x))}/></label><strong>{new Intl.NumberFormat("en-NG",{style:"currency",currency,maximumFractionDigits:2}).format((Number(item.quantity)||0)*(Number(item.unit_price)||0))}</strong><button type="button" className="commercial-remove" onClick={()=>setItems(v=>v.length>1?v.filter((_,i)=>i!==index):v)} disabled={items.length===1}>Remove</button></div>)}
  <div className="commercial-form-grid commercial-totals"><label>Discount amount<input name="discount_amount" type="number" min="0" step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)}/></label><label>Tax amount<input name="tax_amount" type="number" min="0" step="0.01" value={tax} onChange={e=>setTax(e.target.value)}/></label><div><small>Subtotal</small><strong>{new Intl.NumberFormat("en-NG",{style:"currency",currency,maximumFractionDigits:2}).format(subtotal)}</strong></div><div><small>Quotation total</small><strong>{new Intl.NumberFormat("en-NG",{style:"currency",currency,maximumFractionDigits:2}).format(total)}</strong></div></div>
  <label>Commercial terms / payment terms<textarea name="terms" rows={3} maxLength={5000} placeholder="Scope assumptions, exclusions, payment stages, validity and other agreed terms"/></label>
  <button type="submit" disabled={!clients.length||!clientId||items.some(x=>!x.description.trim()||Number(x.quantity)<=0||Number(x.unit_price)<0)||Number(discount)>subtotal}>Save quotation as draft</button>
  {!clients.length&&<p className="admin-empty-note">Register a client before creating a quotation.</p>}
 </form>;
}
