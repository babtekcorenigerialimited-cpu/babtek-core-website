"use client";
import {useState,type FormEvent} from "react";
import {createBrowserClient} from "@supabase/ssr";

export function GoogleSignInButton({nextPath,label="Continue with Google"}:{nextPath:string;label?:string}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function start(){
  setBusy(true);setError("");
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw new Error("Authentication is not configured for this deployment.");
   const sb=createBrowserClient(url,key);
   const redirectTo=window.location.origin+"/auth/callback?next="+encodeURIComponent(nextPath);
   const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo,queryParams:{access_type:"offline",prompt:"select_account"}}});
   if(error)throw error;
  }catch(err){
   const message=err instanceof Error?err.message:"";
   setError(message.toLowerCase().includes("provider is not enabled")||message.toLowerCase().includes("unsupported provider")
    ?"Google sign-in has not been enabled in BABTEK's Supabase Auth settings yet. Use email and password for now."
    :message||"Google sign-in could not start. Please try again or use email and password.");
   setBusy(false);
  }
 }
 return <div className="auth-provider-block"><button type="button" className="auth-google-button" onClick={start} disabled={busy}><span className="auth-google-mark">G</span>{busy?"Connecting to Google…":label}</button>{error&&<p className="admin-error" role="alert">{error}</p>}</div>;
}

export function PasswordRecoveryForm({mode,returnTo="/client/login"}:{mode:"request"|"reset";returnTo?:string}){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setNotice("");setBusy(true);
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw new Error("Authentication is not configured.");
   const sb=createBrowserClient(url,key);
   if(mode==="request"){
    const {error}=await sb.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/auth/callback?next="+encodeURIComponent("/auth/reset-password?returnTo="+encodeURIComponent(returnTo))});
    if(error)throw error;
    setNotice("If an account exists for that address, a password recovery link has been sent. Check your inbox and spam folder.");
   }else{
    if(password.length<8)throw new Error("Use a password with at least 8 characters.");
    if(password!==confirm)throw new Error("The passwords do not match.");
    const {error}=await sb.auth.updateUser({password});if(error)throw error;
    await sb.auth.signOut();setNotice("Your password has been updated. You can now sign in with your new password.");
   }
  }catch(err){setError(err instanceof Error?err.message:"The request could not be completed. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="admin-login-form" onSubmit={submit}>{mode==="request"?<><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="admin-primary-button" disabled={busy}>{busy?"Sending recovery link…":"Send password recovery link"}</button></>:<><label>New password<input type="password" minLength={8} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm new password<input type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="admin-primary-button" disabled={busy}>{busy?"Updating password…":"Update password"}</button></>}{error&&<p className="admin-error" role="alert">{error}</p>}{notice&&<p className="admin-notice" role="status">{notice}</p>}</form>;
}

export function AuthRouteMessage({code}:{code?:string}){
 const messages:Record<string,string>={
  google_callback:"Google could not complete sign-in. Check that the Google provider and authorised redirect URLs are configured in Supabase Auth, then try again.",
  confirmation:"Your confirmation link may have expired or already been used. Request a fresh email and open the newest link.",
  partner_not_linked:"Your Google account is verified, but this email is not linked to an active, approved BABTEK partner record. Use the email registered with your approved partner profile or contact BABTEK.",
  client_not_linked:"This account does not currently have client portal access. Please contact BABTEK to verify and link your client account.",
  admin_not_authorised:"This Google account is not authorised for the founder or administration workspace. Use your authorised founder account.",
  partner_not_linked:"Your Google account is verified, but it is not linked to an active BABTEK partner relationship. Contact BABTEK if your partner application has been approved.",
  client_not_linked:"Your Google account is verified, but it is not linked to a BABTEK client record. Contact BABTEK to verify your client access."
 };
 if(!code||!messages[code])return null;
 return <p className="admin-alert" role="alert">{messages[code]}</p>;
}
