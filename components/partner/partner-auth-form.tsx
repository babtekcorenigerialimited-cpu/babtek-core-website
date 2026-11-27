"use client";
import {useState,type FormEvent} from "react";
import {createBrowserClient} from "@supabase/ssr";
import {useRouter} from "next/navigation";

function authMessage(message:string){
 const m=message.toLowerCase();
 if(m.includes("already registered")||m.includes("already been registered")||m.includes("user already exists"))return "An account already exists with this email. Please sign in or use password recovery.";
 if(m.includes("invalid login credentials"))return "The email or password is incorrect. Check your details or reset your password.";
 if(m.includes("email not confirmed"))return "Please confirm your email using the link we sent before signing in.";
 if(m.includes("password")&&(m.includes("weak")||m.includes("short")||m.includes("characters")))return "Choose a stronger password with at least 8 characters.";
 if(m.includes("rate limit")||m.includes("too many requests"))return "Too many attempts. Please wait a little and try again.";
 if(m.includes("invalid email"))return "Enter a valid email address.";
 return message||"Authentication could not be completed. Please try again.";
}
export function PartnerAuthForm({mode}:{mode:"login"|"register"}){
 const router=useRouter();const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw new Error("Partner portal is not configured. Please contact BABTEK.");
   const sb=createBrowserClient(url,key);
   if(mode==="register"){
    const redirectTo=window.location.origin+"/auth/callback?next="+encodeURIComponent("/partner");
    const {data,error}=await sb.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim(),account_type:"partner"},emailRedirectTo:redirectTo}});
    if(error)throw error;
    if(data.session){router.replace("/partner");router.refresh();return;}
    setNotice("Your registration has been received. Check your inbox (and spam folder) and confirm your email using the BABTEK link. It will return you to the partner portal. BABTEK must approve/link your professional record before project assignments or payment details become visible.");
    return;
   }
   const {error}=await sb.auth.signInWithPassword({email:email.trim(),password});
   if(error)throw error;
   router.replace("/partner");router.refresh();
  }catch(err){setError(authMessage(err instanceof Error?err.message:""));}finally{setBusy(false);}
 }
 return <form className="admin-login-form" onSubmit={submit}>
  {mode==="register"&&<label>Full name<input required maxLength={160} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>}
  <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label>Password<input type="password" minLength={8} autoComplete={mode==="login"?"current-password":"new-password"} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
  {error&&<p className="admin-error" role="alert">{error}</p>}{notice&&<p className="admin-notice" role="status">{notice}</p>}
  <button className="admin-primary-button" type="submit" disabled={busy}>{busy?(mode==="login"?"Signing in…":"Creating account…"):(mode==="login"?"Sign in to partner portal":"Create partner account")}</button>
  <p className="admin-form-note">Access is restricted to assignments explicitly linked to your verified partner account. Never share your password or verification codes.</p>
 </form>;
}