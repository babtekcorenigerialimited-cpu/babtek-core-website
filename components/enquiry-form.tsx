"use client";

import { useState } from "react";

type Props = { defaultSubject: string };

export function EnquiryForm({ defaultSubject }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your enquiry.");
      setStatus("success");
      setMessage(`Thank you. Your enquiry reference is ${result.reference}.`);
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again or contact BABTEK by email.");
    }
  }

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <label>Full name<input name="full_name" autoComplete="name" required maxLength={120} /></label>
      <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
      <label>Organisation (optional)<input name="organisation" autoComplete="organization" maxLength={160} /></label>
      <label>What is your enquiry about?<input name="subject" defaultValue={defaultSubject} required maxLength={180} /></label>
      <label>Division or service of interest
        <select name="service_interest" defaultValue="">
          <option value="">Select if known</option>
          <option>Design & Construction</option><option>Interiors</option><option>Real Estate</option>
          <option>Smart Solutions</option><option>Academy</option><option>Ventures</option>
          <option>Products & Supply</option><option>Research & Innovation</option><option>General</option>
        </select>
      </label>
      <label className="enquiry-message">Tell us about your requirement<textarea name="message" required minLength={10} maxLength={10000} rows={5} /></label>
      <div className="form-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Submitting…" : "Submit enquiry ↗"}</button>
      {message && <p role="status" aria-live="polite" className={status === "error" ? "form-error" : "form-success"}>{message}</p>}
      <small>Submitting this form authorises BABTEK to use these details to respond to your enquiry. Please do not submit confidential documents or sensitive personal information here.</small>
    </form>
  );
}
