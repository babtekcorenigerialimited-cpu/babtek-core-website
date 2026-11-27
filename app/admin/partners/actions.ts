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
  const partner_type = String(formData.get("partner_type") || "professional").trim().slice(0, 80);
  const specialties = String(formData.get("specialties") || "").split(",").map((v) => v.trim().slice(0, 80)).filter(Boolean).slice(0, 20);
  const division_affiliations = formData.getAll("division_affiliations").map((v) => String(v).slice(0, 80)).filter(Boolean).slice(0, 8);
  const website = String(formData.get("website") || "").trim().slice(0, 255);
  const notes = String(formData.get("notes") || "").trim().slice(0, 2000);
  const registration_details = String(formData.get("registration_details") || "").trim().slice(0, 500);
  const allowedPartnerTypes = ["professional","technology","supplier","venture","strategic","research","education","other"];
  if (!legal_name || !allowedPartnerTypes.includes(partner_type)) redirect("/admin/partners?error=required");
  const { error } = await supabase.from("professional_partners").insert({
    legal_name, trading_name: trading_name || null, email: email || null,
    phone: phone || null, professional_category: professional_category || null,
    partner_type, specialties, division_affiliations, website: website || null, notes: notes || null, relationship_status: "prospect",
    registration_details: registration_details || null, created_by: user.id,
  });
  if (error) redirect("/admin/partners?error=save");
  revalidatePath("/admin/partners");
  revalidatePath("/admin");
  redirect("/admin/partners?created=1");
}


export async function updatePartnerRelationshipStatus(formData: FormData) {
  const partnerId = String(formData.get("partner_id") || "");
  const status = String(formData.get("relationship_status") || "");
  const notes = String(formData.get("notes") || "").trim().slice(0, 2000);
  if (!/^[0-9a-f-]{36}$/i.test(partnerId) || !["prospect","active","paused","inactive","blacklisted"].includes(status)) {
    redirect("/admin/partners?error=status");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((item) => item.role === "owner")) redirect("/admin");
  const { error } = await supabase.rpc("update_partner_relationship_status", {
    p_partner_id: partnerId, p_status: status, p_notes: notes || null
  });
  if (error) {
    console.error("Partner relationship status update failed", error.message);
    redirect("/admin/partners?error=status");
  }
  revalidatePath("/admin/partners"); revalidatePath("/admin/partner-applications");
  revalidatePath("/partner"); revalidatePath("/admin/projects");
  redirect("/admin/partners?status_updated=1");
}
