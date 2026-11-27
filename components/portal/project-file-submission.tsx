"use client";
import {useState,type FormEvent} from "react";
import {createBrowserClient} from "@supabase/ssr";
import {submitClientProjectFile} from "@/app/client/upload-actions";
import {submitPartnerProjectFile} from "@/app/partner/upload-actions";
const allowed=["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation","text/plain","application/zip"];
export function ProjectFileSubmission({projectId,kind,engagementId}:{projectId:string;kind:"client"|"partner";engagementId?:string}){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const data=new FormData(form);const file=data.get("file");if(!(file instanceof File)||!file.size){setMessage("Choose a file first.");return;}if(!allowed.includes(file.type)||file.size>50*1024*1024){setMessage("Use an approved PDF, image, Office, text or ZIP file up to 50 MB.");return;}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key){setMessage("Secure file storage is not configured.");return;}
 setBusy(true);setMessage("Uploading privately…");const sb=createBrowserClient(url,key);const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100)||"document";const path=kind==="partner"?[projectId,engagementId||"invalid",crypto.randomUUID()+"-"+safe]:[projectId,crypto.randomUUID()+"-"+safe];const storagePath=[(await sb.auth.getUser()).data.user?.id||"unauthenticated",...path].join("/");
 const {error}=await sb.storage.from("babtek-private").upload(storagePath,file,{contentType:file.type,upsert:false});if(error){setBusy(false);setMessage("Upload failed. Please sign in again or contact BABTEK.");return;}
 data.set("project_id",projectId);data.set("storage_path",storagePath);data.set("original_filename",file.name);data.set("mime_type",file.type);data.set("file_size_bytes",String(file.size));if(engagementId)data.set("engagement_id",engagementId);data.delete("file");
 if(kind==="client")await submitClientProjectFile(data);else await submitPartnerProjectFile(data);
 }
 return <form className="admin-comms-compose" onSubmit={submit}><label>Submit a file to BABTEK for review</label><input name="title" required maxLength={180} placeholder="Document title (e.g. Site photographs)"/><input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.pptx,.txt,.zip"/><textarea name="notes" rows={2} maxLength={2000} placeholder="Optional note or instructions for the BABTEK team"/><button type="submit" disabled={busy}>{busy?"Uploading securely…":"Upload file for BABTEK review"}</button>{message&&<small role="status">{message}</small>}<small>Private submission · Maximum 50 MB · BABTEK reviews before sharing or adding it to the project record.</small></form>;
}
