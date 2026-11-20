/* eslint-disable @typescript-eslint/no-require-imports */
// Acceso con correo y clave: nunca registra cuentas y no revela qué correos existen.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const config=require('../.foundation-test-build/shared/server/auth-config.js');
const {NextResponse}=require('next/server');
function loadEntry(){
 const calls=[];
 const auth={apply:r=>r,client:{auth:{
  signUp:async i=>{calls.push(['signUp',i]);return {error:null};},
  signInWithPassword:async i=>{calls.push(['password',i]);return {error:i.password==='correcta-123'?null:{status:400,code:'invalid_credentials'}};},
 }}};
 const source=ts.transpileModule(fs.readFileSync('src/app/api/auth/entry/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const output={};
 vm.runInNewContext(source,{exports:output,URL,console:{info(){}},require:name=>name==='next/server'?{NextResponse}:name.endsWith('auth-config')?config:{requestAuth:()=>auth}});
 return {POST:output.POST,calls};
}
function env(){process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test';process.env.ANNIENEXUS_ALLOWED_EMAILS='fixture@example.invalid';}
const post=(POST,body)=>POST(new Request('https://consultormacro.com/api/auth/entry',{method:'POST',headers:{origin:'https://consultormacro.com','content-type':'application/json'},body:JSON.stringify(body)}));
test('correct password for the allowed email signs in',async()=>{
 env();const {POST,calls}=loadEntry();
 const r=await post(POST,{action:'login',email:'Fixture@example.invalid',password:'correcta-123'});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});assert.equal(calls[0][1].email,'fixture@example.invalid');
});
test('wrong password and unknown email get the same answer; unknown never reaches Supabase',async()=>{
 env();const {POST,calls}=loadEntry();
 const wrong=await post(POST,{action:'login',email:'fixture@example.invalid',password:'mala'});
 const other=await post(POST,{action:'login',email:'intruder@example.invalid',password:'correcta-123'});
 assert.equal(wrong.status,401);assert.equal(other.status,401);assert.deepEqual(await wrong.json(),await other.json());
 assert.equal(calls.length,1);
});
test('registration and other actions are refused without contacting Supabase',async()=>{
 env();const {POST,calls}=loadEntry();
 for(const action of ['register','send-code','verify-code'])assert.equal((await post(POST,{action,email:'fixture@example.invalid',password:'x'})).status,401);
 assert.equal(calls.length,0);
});
test('cross-origin requests are rejected',async()=>{
 env();const {POST}=loadEntry();
 const r=await POST(new Request('https://consultormacro.com/api/auth/entry',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'}));
 assert.equal(r.status,403);
});
