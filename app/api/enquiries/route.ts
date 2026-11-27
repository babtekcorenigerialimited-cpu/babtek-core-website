import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const maxLength = (value: unknown, max: number) =>
  typeof value === "string" && value.trim().length <= max ? value.trim() : "";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  // Honeypot: silently accept automated submissions without storing them.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true, reference: "received" });
  }

  const full_name = maxLength(body.full_name, 120);
  const email = maxLength(body.email, 254).toLowerCase();
  const phone = maxLength(body.phone, 40);
  const organisation = maxLength(body.organisation, 160);
  const subject = maxLength(body.subject, 180);
  const service_interest = maxLength(body.service_interest, 100);
  const message = maxLength(body.message, 10000);

  if (!full_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || message.length < 10) {
    return NextResponse.json({ error: "Please provide your name, a valid email, a subject and a message of at least 10 characters." }, { status: 400 });
  }
  if (JSON.stringify(body).length > 15000) {
    return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "The online enquiry service is not configured yet. Please email babtekcorenigerialimited@gmail.com." }, { status: 503 });
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase
    .from("enquiries")
    .insert({ full_name, email, phone: phone || null, organisation: organisation || null,
      subject, message, service_interest: service_interest || null, source: "website" })
    .select("reference_code")
    .single();

  if (error || !data) {
    console.error("Enquiry intake failed", error?.code || "unknown");
    return NextResponse.json({ error: "We could not save your enquiry. Please email BABTEK directly." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, reference: data.reference_code }, { status: 201 });
}
