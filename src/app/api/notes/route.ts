import { NextResponse } from "next/server";
import { requestAuth, authorizedUser } from "../../../shared/server/supabase-request";
import { sameOrigin } from "../../../shared/server/auth-config";
import { readNotebookBackup, mergeNotebookBackup } from "../../../shared/notebook-backup";
async function context(request:Request){const auth=requestAuth(request);if(!auth)return {error:NextResponse.json({error:"Acceso pendiente."},{status:503})};const user=await authorizedUser(auth);if(!user)return {error:auth.apply(NextResponse.json({error:"Se requiere una cuenta autorizada."},{status:401}))};return {auth,user};}
async function read(auth:NonNullable<ReturnType<typeof requestAuth>>,userId:string){const {data,error}=await auth.client.from("annienexus_notes").select("id,text,topic,created_at").eq("user_id",userId).order("created_at",{ascending:false});if(error)throw new Error("No se pudieron leer tus apuntes.");return (data??[]).map(n=>({id:n.id,text:n.text,topic:n.topic,at:new Date(n.created_at).toISOString()}));}
export async function GET(request:Request){try{const ctx=await context(request);if(ctx.error)return ctx.error;return ctx.auth.apply(NextResponse.json({notes:await read(ctx.auth,ctx.user.id)}));}catch{return NextResponse.json({error:"No se pudieron leer tus apuntes. Inténtalo de nuevo."},{status:503,headers:{"Cache-Control":"no-store"}});}}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no permitido."},{status:403});
 try{const ctx=await context(request);if(ctx.error)return ctx.error;const raw=await request.text();const incoming=readNotebookBackup(raw).map(n=>({...n,at:new Date(n.at).toISOString()}));const existing=await read(ctx.auth,ctx.user.id);mergeNotebookBackup(existing,incoming);const ids=new Set(existing.map(n=>n.id));const fresh=incoming.filter(n=>!ids.has(n.id));
 if(fresh.length){const {error}=await ctx.auth.client.from("annienexus_notes").insert(fresh.map(n=>({user_id:ctx.user.id,id:n.id,text:n.text,topic:n.topic,created_at:n.at})));if(error)throw new Error("No se guardó la copia. Puede haber un límite o un cambio simultáneo; vuelve a cargar tus apuntes.");}
 return ctx.auth.apply(NextResponse.json({notes:await read(ctx.auth,ctx.user.id)}));
 }catch(error){return NextResponse.json({error:error instanceof Error&&error.message.length<=240?error.message:"No se guardaron los apuntes. Revisa la copia, el límite de 50 y posibles versiones distintas."},{status:400,headers:{"Cache-Control":"no-store"}});}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no permitido."},{status:403});
 try{const ctx=await context(request);if(ctx.error)return ctx.error;const id=new URL(request.url).searchParams.get("id");if(!id||id.length>100)return NextResponse.json({error:"Apunte inválido."},{status:400});const {error}=await ctx.auth.client.from("annienexus_notes").delete().eq("user_id",ctx.user.id).eq("id",id);if(error)throw error;return ctx.auth.apply(NextResponse.json({notes:await read(ctx.auth,ctx.user.id)}));}catch{return NextResponse.json({error:"No se pudo eliminar el apunte."},{status:503,headers:{"Cache-Control":"no-store"}});}
}
