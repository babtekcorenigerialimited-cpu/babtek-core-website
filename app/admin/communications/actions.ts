"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendCommunicationMessage(formData: FormData) {
  const enquiryId = String(formData.get("enquiry_id") || "");
  const projectId = String(formData.get("project_id") || "");
  const body = String(formData.get("body") || "").trim();
  if ((!enquiryId && !projectId) || (enquiryId && projectId) || body.length < 1 || body.length > 10000) {
    redirect("/admin/communications?error=invalid");
  }
  const uuid = /^[0-9a-f-]{36}$/i;
  if ((enquiryId && !uuid.test(enquiryId)) || (projectId && !uuid.test(projectId))) {
    redirect("/admin/communications?error=invalid");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => ["owner", "administrator", "operations"].includes(item.role))) redirect("/admin");
  const { error } = await supabase.from("communication_messages").insert({
    enquiry_id: enquiryId || null,
    project_id: projectId || null,
    sender_id: user.id,
    body,
    message_type: "internal_note",
  });
  if (error) redirect("/admin/communications?error=send");
  redirect("/admin/communications?sent=1");
}
