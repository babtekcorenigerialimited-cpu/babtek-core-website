import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function getPublicContent<T=any>(table:string,columns:string,orderColumn="updated_at"):Promise<T[]>{
 try{const supabase=await createSupabaseServerClient();const {data,error}=await supabase.from(table).select(columns).eq("visibility","published").order(orderColumn,{ascending:false}).limit(100);if(error){console.error("Public content query failed",table,error.message);return [];}return (data||[]) as T[];}catch{return [];}
}
export async function getPublicDivisions(){
 try{const supabase=await createSupabaseServerClient();const {data,error}=await supabase.from("divisions").select("id,slug,name,pillar,summary,description,lifecycle,display_order").eq("is_public",true).order("display_order");if(error){console.error("Public divisions query failed",error.message);return [];}return data||[];}catch{return [];}
}