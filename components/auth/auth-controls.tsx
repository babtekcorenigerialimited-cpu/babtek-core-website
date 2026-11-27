"use client";
import {useState,type FormEvent} from "react";
import {createBrowserClient} from "@supabase/ssr";

export function GoogleSignInButton({nextPath}:{nextPath:string}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function start(){setBusy(true);setError("");const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key){setError("Authentication is not configured for this deployment.");setBusy(false);return;}
 const sb=createBrowserClient(url,key);const redirectTo=window.location.origin+"/auth/callback?next="+encodeURIComponent(nextPath);
 const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo,queryParams:{access_type:"offline",prompt:"select_account"}}});
 if(error){setError("Google sign-in is not available yet. Use email and password, or ask the administrator to configure Google OAuth in Supabase.");setBusy(false);}
 }
 return <div className="auth-provider-block"><button type="button" className="auth-google-button" onClick={start} disabled={busy}><span className="auth-google-mark">G</span>{busy?"Connecting to Google…":"Continue with Google"}</button>{error&&<p className="admin-error" role="alert">{error}</p>}</div>;
}

export function PasswordRecoveryForm({mode,returnTo="/client/login"}:{mode:"request"|"reset";returnTo?:string}){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setNotice("");setBusy(true);const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key){setError("Authentication is not configured.");setBusy(false);return;}const sb=createBrowserClient(url,key);
 if(mode==="request"){const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/auth/callback?next="+encodeURIComponent("/auth/reset-password?returnTo="+encodeURIComponent(returnTo))});if(error)setError("We could not send a recovery email. Check the address or contact BABTEK.");else setNotice("If an account exists for that address, a password recovery link has been sent. Check your inbox and spam folder.");}
 else {if(password.length<8){setError("Use a password with at least 8 characters.");setBusy(false);return;}if(password!==confirm){setError("The passwords do not match.");setBusy(false);return;}const {error}=await sb.auth.updateUser({password});if(error)setError("The password could not be updated. Reopen the latest recovery link and try again.");else {await sb.auth.signOut();setNotice("Your password has been updated. You can now sign in with your new password.");}}
 setBusy(false);
 }
 return <form className="admin-login-form" onSubmit={submit}>{mode==="request"?<><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="admin-primary-button" disabled={busy}>{busy?"Sending recovery link…":"Send password recovery link"}</button></>:<><label>New password<input type="password" minLength={8} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm new password<input type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="admin-primary-button" disabled={busy}>{busy?"Updating password…":"Update password"}</button></>}{error&&<p className="admin-error" role="alert">{error}</p>}{notice&&<p className="admin-notice" role="status">{notice}</p>}</form>;
}