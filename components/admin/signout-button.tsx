"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ redirectTo = "/admin/login" }: { redirectTo?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createBrowserClient(url, key);
      await supabase.auth.signOut();
    }
    router.replace(redirectTo);
    router.refresh();
  }
  return <button className="admin-signout" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>;
}
