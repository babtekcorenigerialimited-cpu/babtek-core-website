"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = ["new", "reviewing", "qualified", "quoted", "converted", "declined", "closed"] as const;

export async function updateEnquiryStatus(formData: FormData) {
  const id = String(formData.get("enquiry_id") || "");
  const status = String(formData.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    redirect("/admin/enquiries?error=invalid");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) redirect("/admin/enquiries?error=update");
  redirect("/admin/enquiries?updated=1");
}
