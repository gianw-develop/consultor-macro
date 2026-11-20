import { NextResponse } from "next/server";
import { requestAuth } from "../../../shared/server/supabase-request";
import { applicationOrigin } from "../../../shared/server/auth-config";
export async function GET(request:Request){
 const auth=requestAuth(request),code=new URL(request.url).searchParams.get("code");
 const response=NextResponse.redirect(new URL("/acceso",applicationOrigin(request)));
 if(auth&&code){await auth.client.auth.exchangeCodeForSession(code);return auth.apply(response);}
 return response;
}
