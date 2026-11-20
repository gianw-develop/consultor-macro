import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { localPreview } from "../../../../shared/server/auth-config";
import { requestAuth, authorizedUser } from "../../../../shared/server/supabase-request";
import files from "../../../../modules/annienexus/published-learning-files.json";
const allowedFiles=new Set(files.map(f=>f.file));
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{file:string}>}){
 const {file}=await params;if(!/^[a-f0-9]{16}\.(jpg|png|md|txt)$/.test(file))return new NextResponse(null,{status:404});
 const auth=requestAuth(request),local=localPreview()&&["127.0.0.1","localhost"].includes(new URL(request.url).hostname);
 try{
 if(!local&&(!auth||!await authorizedUser(auth)))return new NextResponse(null,{status:401,headers:{"Cache-Control":"no-store"}});
 if(!allowedFiles.has(file))return new NextResponse(null,{status:404,headers:{"Cache-Control":"no-store"}});
 const bytes=await readFile(path.join(process.cwd(),"private/learning-published",file));
 const type=file.endsWith('.jpg')?'image/jpeg':file.endsWith('.png')?'image/png':'text/plain; charset=utf-8';
 const response=new NextResponse(bytes,{headers:{"Content-Type":type,"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});return auth?auth.apply(response):response;
 }catch{return new NextResponse(null,{status:404,headers:{"Cache-Control":"no-store"}});}
}
