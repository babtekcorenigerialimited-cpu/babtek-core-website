import Link from "next/link";
import {PasswordRecoveryForm} from "@/components/auth/auth-controls";
export const dynamic="force-dynamic";
export default async function ResetPasswordPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}){
 const p=await searchParams;const allowed=["/admin/login","/client/login","/partner/login"];const returnTo=allowed.includes(p.returnTo||"")?p.returnTo!:"/client/login";
 return <main className="admin-auth-screen"><section className="admin-auth-card"><Link className="admin-brand" href="/">BABTEK <span>CORE</span></Link><p className="admin-kicker">SECURE ACCOUNT RECOVERY</p><h1>Choose a new password.</h1><p className="admin-auth-copy">Set a new password for your BABTEK account. Use at least 8 characters.</p><PasswordRecoveryForm mode="reset" returnTo={returnTo}/><p className="admin-form-note"><Link href={returnTo}>Back to sign in</Link></p></section><p className="admin-auth-foot">BABTEK CORE NIGERIA LIMITED</p></main>;
}