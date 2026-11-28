import {NextResponse,type NextRequest} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

function safeNext(value:string){
 const allowed=["/","/client","/partner","/admin"];
 if(allowed.includes(value))return value;
 try{
  const candidate=new URL(value,"https://babtek.invalid");
  if(candidate.origin!=="https://babtek.invalid"||candidate.pathname!=="/auth/reset-password")return "/";
  const returnTo=candidate.searchParams.get("returnTo")||"/client/login";
  const allowedReturnTos=["/admin/login","/client/login","/partner/login"];
  return "/auth/reset-password?returnTo="+encodeURIComponent(allowedReturnTos.includes(returnTo)?returnTo:"/client/login");
 }catch{return "/";}
}
function failurePath(next:string,origin:string){
 if(next.startsWith("/auth/reset-password")){
  const nested=new URL(next,origin).searchParams.get("returnTo")||"/client/login";
  const allowed=["/admin/login","/client/login","/partner/login"];
  const returnTo=allowed.includes(nested)?nested:"/client/login";
  return "/auth/forgot-password?error=callback&returnTo="+encodeURIComponent(returnTo);
 }
 if(next==="/partner")return "/partner/login?error=google_callback";
 if(next==="/client")return "/client/login?error=google_callback";
 if(next==="/admin")return "/admin/login?error=google_callback";
 return "/client/login?error=confirmation";
}
export async function GET(request:NextRequest){
 const url=new URL(request.url);
 const code=url.searchParams.get("code");
 const oauthError=url.searchParams.get("error");
 const rawNext=url.searchParams.get("next")||"/";
 const next=safeNext(rawNext);
 const fail=(codeName:string)=>NextResponse.redirect(new URL(failurePath(next,url.origin).replace(/([?&])error=[^&]+/,"$1error="+codeName),url.origin));
 if(oauthError)return fail(next.startsWith("/auth/reset-password")?"confirmation":"google_callback");
 if(!code)return fail("confirmation");
 const sb=await createSupabaseServerClient();
 const {error}=await sb.auth.exchangeCodeForSession(code);
 if(error)return fail("confirmation");
 const {data:{user}}=await sb.auth.getUser();
 if(!user)return fail("confirmation");
 if(next==="/partner"||next==="/client"||next==="/admin"){
  const {data:roles,error:roleError}=await sb.from("user_roles").select("role").eq("user_id",user.id);
  if(roleError)return fail("google_callback");
  const roleList=(roles||[]).map((r:any)=>r.role);
  if(next==="/partner"&&!roleList.includes("partner"))return NextResponse.redirect(new URL("/partner/login?error=partner_not_linked",url.origin));
  if(next==="/client"&&!roleList.includes("client"))return NextResponse.redirect(new URL("/client/login?error=client_not_linked",url.origin));
  if(next==="/admin"&&!roleList.includes("owner")&&!roleList.includes("administrator"))return NextResponse.redirect(new URL("/admin/login?error=admin_not_authorised",url.origin));
 }
 return NextResponse.redirect(new URL(next,url.origin));
}
