"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = ["proposed", "ongoing", "on_hold", "completed", "cancelled"] as const;

export async function updateProjectStatus(formData: FormData) {
  const id = String(formData.get("project_id") || "");
  const status = String(formData.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    redirect("/admin/projects?error=invalid");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");
  const { error } = await supabase.from("projects").update({ status }).eq("id", id);
  if (error) redirect("/admin/projects?error=update");
  redirect("/admin/projects?updated=1");
}
