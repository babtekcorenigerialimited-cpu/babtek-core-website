import {NextResponse,type NextRequest} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function GET(request:NextRequest){
 const url=new URL(request.url);const code=url.searchParams.get("code");const rawNext=url.searchParams.get("next")||"/";
 const next=rawNext.startsWith("/")&&!rawNext.startsWith("//")?rawNext:"/";
 if(code){const sb=await createSupabaseServerClient();const {error}=await sb.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,url.origin));}
 return NextResponse.redirect(new URL("/auth/forgot-password?error=callback",url.origin));
}