"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPartner(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");

  const legal_name = String(formData.get("legal_name") || "").trim().slice(0, 200);
  const trading_name = String(formData.get("trading_name") || "").trim().slice(0, 200);
  const email = String(formData.get("email") || "").trim().slice(0, 254);
  const phone = String(formData.get("phone") || "").trim().slice(0, 40);
  const professional_category = String(formData.get("professional_category") || "").trim().slice(0, 120);
  const registration_details = String(formData.get("registration_details") || "").trim().slice(0, 500);
  if (!legal_name) redirect("/admin/partners?error=required");
  const { error } = await supabase.from("professional_partners").insert({
    legal_name, trading_name: trading_name || null, email: email || null,
    phone: phone || null, professional_category: professional_category || null,
    registration_details: registration_details || null, created_by: user.id,
  });
  if (error) redirect("/admin/partners?error=save");
  revalidatePath("/admin/partners");
  revalidatePath("/admin");
  redirect("/admin/partners?created=1");
}
