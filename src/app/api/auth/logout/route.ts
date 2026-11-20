import { NextResponse } from "next/server";
import { sameOrigin } from "../../../../shared/server/auth-config";
import { requestAuth } from "../../../../shared/server/supabase-request";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origen no permitido."},{status:403});
 const auth=requestAuth(request);if(!auth)return NextResponse.json({error:"Acceso no configurado."},{status:503});
 const {error}=await auth.client.auth.signOut({scope:"local"});
 return auth.apply(NextResponse.json(error?{error:"No se pudo cerrar la sesión. Inténtalo otra vez."}:{ok:true},{status:error?503:200}));
}
