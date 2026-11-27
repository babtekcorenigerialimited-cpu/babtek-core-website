import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Owner Sign In | BABTEK Core" };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="admin-auth-screen">
      <section className="admin-auth-card">
        <a className="admin-brand" href="/">BABTEK <span>CORE</span></a>
        <p className="admin-kicker">SECURE ENTERPRISE ACCESS</p>
        <h1>Welcome back.</h1>
        <p className="admin-auth-copy">Sign in to the BABTEK Core management platform.</p>
        <AdminLoginForm />
        <a className="admin-back-link" href="/">← Return to corporate website</a>
      </section>
      <p className="admin-auth-foot">BABTEK CORE NIGERIA LIMITED · BUILDING A BETTER FUTURE</p>
    </main>
  );
}
