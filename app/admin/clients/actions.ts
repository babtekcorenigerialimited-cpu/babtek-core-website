"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createClient(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const legal_name = String(formData.get("legal_name") || "").trim().slice(0, 200);
  const display_name = String(formData.get("display_name") || "").trim().slice(0, 200);
  const email = String(formData.get("email") || "").trim().slice(0, 254);
  const phone = String(formData.get("phone") || "").trim().slice(0, 40);
  if (!legal_name) redirect("/admin/clients?error=required");
  const { error } = await supabase.from("clients").insert({
    legal_name, display_name: display_name || null, email: email || null,
    phone: phone || null, created_by: user.id,
  });
  if (error) redirect("/admin/clients?error=save");
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect("/admin/clients?created=1");
}
