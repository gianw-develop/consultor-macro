import { NextResponse } from "next/server";
import { applicationOrigin, emailAllowed, sameOrigin } from "../../../../shared/server/auth-config";
import { requestAuth } from "../../../../shared/server/supabase-request";
export async function POST(request:Request) {
  if(!sameOrigin(request)) return NextResponse.json({error:"Origen no permitido."},{status:403});
  const auth=requestAuth(request);
  if(!auth) return NextResponse.json({error:"Acceso pendiente de configuración."},{status:503});
  const raw=await request.text();
  if(raw.length>10000)return NextResponse.json({error:"Solicitud demasiado grande."},{status:413});
  let input;try{input=JSON.parse(raw);}catch{return NextResponse.json({error:"Solicitud inválida."},{status:400});}
  if(!input||typeof input!=="object"||Array.isArray(input))return NextResponse.json({error:"Solicitud inválida."},{status:400});
  const {email,password,action}=input;
  if(typeof email!=="string"||typeof password!=="string"||password.length>512||!emailAllowed(email)||!["login","register"].includes(action))return auth.apply(NextResponse.json({error:"No se pudo acceder con esos datos."},{status:400}));
  if(action==="register"){
    if(password.length<8)return auth.apply(NextResponse.json({error:"Usa al menos 8 caracteres."},{status:400}));
    const {error}=await auth.client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:new URL("/auth/callback",applicationOrigin(request)).href}});
    return auth.apply(NextResponse.json(error?{error:"No se pudo crear la cuenta. Comprueba el correo autorizado o vuelve a intentarlo más tarde."}:{message:"Comprueba tu correo para confirmar la cuenta. Después podrás iniciar sesión."},{status:error?400:200}));
  }
  const {error}=await auth.client.auth.signInWithPassword({email:email.trim(),password});
  return auth.apply(NextResponse.json(error?{error:"Correo, contraseña o confirmación pendientes. Comprueba los datos."}:{ok:true},{status:error?401:200}));
}
