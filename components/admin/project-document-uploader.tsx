"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { registerProjectDocument } from "@/app/admin/projects/delivery-actions";

export function ProjectDocumentUploader({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) { setMessage("Choose a file first."); return; }
    const allowed = ["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation","text/plain","application/zip"];
    if (!allowed.includes(file.type) || file.size > 50 * 1024 * 1024) { setMessage("Use an approved PDF, image, Office, text or ZIP file up to 50 MB."); return; }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setMessage("Storage is not configured."); return; }
    setBusy(true); setMessage("Uploading securely…");
    const sb = createBrowserClient(url, key);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "document";
    const path = projectId + "/" + crypto.randomUUID() + "-" + safeName;
    const { error } = await sb.storage.from("babtek-private").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setBusy(false); setMessage("Upload failed. Confirm your owner session and try again."); return; }
    data.set("project_id", projectId);
    data.set("storage_path", path);
    data.delete("file");
    try { await registerProjectDocument(data); }
    catch { await sb.storage.from("babtek-private").remove([path]); setBusy(false); setMessage("The document record could not be saved. Please try again."); }
  }
  return <form onSubmit={submit} className="project-engagement-form">
    <input type="hidden" name="project_id" value={projectId}/>
    <div className="project-engagement-fields">
      <label>Document title<input name="title" required maxLength={180} placeholder="e.g. Approved architectural drawings"/></label>
      <label>Document category<input name="document_type" maxLength={80} placeholder="Drawing, report, contract..."/></label>
      <label>Version<input name="version_label" maxLength={50} placeholder="Rev 01"/></label>
      <label>File (max 50 MB)<input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.pptx,.txt,.zip"/></label>
    </div>
    <div className="project-document-permissions">
      <label><input type="checkbox" name="client_visible"/> Share with linked client</label>
      <label><input type="checkbox" name="partner_visible"/> Share with assigned partner(s)</label>
    </div>
    <small>Files remain private unless you explicitly enable a visibility option. Partner visibility is limited to partners assigned to the project.</small>
    <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload to private project library"}</button>
    {message && <p className="admin-form-note" role="status">{message}</p>}
  </form>;
}
