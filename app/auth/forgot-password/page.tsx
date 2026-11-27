import Link from "next/link";
import {PasswordRecoveryForm} from "@/components/auth/auth-controls";
export const dynamic="force-dynamic";
export default async function ForgotPasswordPage({searchParams}:{searchParams:Promise<{returnTo?:string;error?:string}>}){
 const p=await searchParams;const allowed=["/admin/login","/client/login","/partner/login"];const returnTo=allowed.includes(p.returnTo||"")?p.returnTo!:"/client/login";
 return <main className="admin-auth-screen"><section className="admin-auth-card"><Link className="admin-brand" href="/">BABTEK <span>CORE</span></Link><p className="admin-kicker">ACCOUNT RECOVERY</p><h1>Reset your password.</h1><p className="admin-auth-copy">Enter the email address registered to your BABTEK account. If it exists, Supabase will send a secure recovery link.</p>{p.error&&<p className="admin-alert">The recovery link could not be verified. Request a new one.</p>}<PasswordRecoveryForm mode="request" returnTo={returnTo}/><p className="admin-form-note"><Link href={returnTo}>Return to sign in</Link></p></section><p className="admin-auth-foot">BABTEK CORE NIGERIA LIMITED</p></main>;
}