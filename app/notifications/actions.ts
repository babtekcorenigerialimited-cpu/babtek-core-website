"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationRead(formData: FormData) {
  const id=String(formData.get("notification_id")||"");
  if(!/^[0-9a-f-]{36}$/i.test(id)) redirect("/notifications");
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  await supabase.from("user_notifications").update({read_at:new Date().toISOString()}).eq("id",id).eq("recipient_id",user.id).is("read_at",null);
  redirect("/notifications?updated=1");
}

export async function markAllNotificationsRead() {
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  await supabase.from("user_notifications").update({read_at:new Date().toISOString()}).eq("recipient_id",user.id).is("read_at",null);
  redirect("/notifications?updated=1");
}
