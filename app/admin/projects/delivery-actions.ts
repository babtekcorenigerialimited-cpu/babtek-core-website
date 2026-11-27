"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireProjectManager() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((role) => ["owner", "administrator", "operations"].includes(role.role))) redirect("/admin");
  return { supabase, user };
}

export async function createProjectTask(formData: FormData) {
  const projectId = String(formData.get("project_id") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const description = String(formData.get("description") || "").trim().slice(0, 3000);
  const partnerId = String(formData.get("assigned_partner_id") || "").trim();
  const priority = String(formData.get("priority") || "normal");
  const dueDate = String(formData.get("due_date") || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || title.length < 3 || !["low","normal","high","urgent"].includes(priority) || (partnerId && !/^[0-9a-f-]{36}$/i.test(partnerId))) redirect("/admin/projects?error=task");
  const { supabase, user } = await requireProjectManager();
  if (partnerId) {
    const { data: engagement } = await supabase.from("project_partner_engagements").select("id").eq("project_id", projectId).eq("partner_id", partnerId).limit(1).maybeSingle();
    if (!engagement) redirect("/admin/projects?error=task");
  }
  const { error } = await supabase.from("project_tasks").insert({
    project_id: projectId, title, description: description || null, assigned_partner_id: partnerId || null,
    priority, status: "not_started", due_date: dueDate || null, created_by: user.id
  });
  if (error) { console.error("Project task creation failed", error.message); redirect("/admin/projects?error=task"); }
  await supabase.from("audit_logs").insert({ actor_id: user.id, action: "project.task_created", table_name: "project_tasks", metadata: { project_id: projectId, assigned_partner_id: partnerId || null, title } });
  revalidatePath("/admin/projects"); revalidatePath("/partner");
  redirect("/admin/projects?task_created=1");
}

export async function uploadProjectDocument(formData: FormData) {
  const projectId = String(formData.get("project_id") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const documentType = String(formData.get("document_type") || "project_document").trim().slice(0, 80);
  const versionLabel = String(formData.get("version_label") || "").trim().slice(0, 50);
  const clientVisible = formData.get("client_visible") === "on";
  const partnerVisible = formData.get("partner_visible") === "on";
  const file = formData.get("file");
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || title.length < 2 || !(file instanceof File) || file.size < 1 || file.size > 50 * 1024 * 1024) redirect("/admin/projects?error=document");
  const allowed = new Set(["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation","text/plain","application/zip"]);
  if (!allowed.has(file.type)) redirect("/admin/projects?error=document");
  const { supabase, user } = await requireProjectManager();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "document";
  const path = projectId + "/" + crypto.randomUUID() + "-" + safeName;
  const { error: uploadError } = await supabase.storage.from("babtek-private").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) { console.error("Project document upload failed", uploadError.message); redirect("/admin/projects?error=document"); }
  const { error: recordError } = await supabase.from("project_documents").insert({
    project_id: projectId, title, document_type: documentType, storage_path: path,
    version_label: versionLabel || null, uploaded_by: user.id, client_visible: clientVisible, partner_visible: partnerVisible
  });
  if (recordError) {
    await supabase.storage.from("babtek-private").remove([path]);
    console.error("Project document record creation failed", recordError.message);
    redirect("/admin/projects?error=document");
  }
  await supabase.from("audit_logs").insert({ actor_id: user.id, action: "project.document_uploaded", table_name: "project_documents", metadata: { project_id: projectId, title, client_visible: clientVisible, partner_visible: partnerVisible } });
  revalidatePath("/admin/projects"); revalidatePath("/partner"); revalidatePath("/client");
  redirect("/admin/projects?document_uploaded=1");
}
