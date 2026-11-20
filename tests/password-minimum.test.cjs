/* eslint-disable @typescript-eslint/no-require-imports */
// Acceso por código: nunca crea cuentas, no revela correos autorizados y exige código numérico.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const config=require('../.foundation-test-build/shared/server/auth-config.js');
const {NextResponse}=require('next/server');
function loadEntry(){
 const calls=[];
 const auth={apply:r=>r,client:{auth:{
  signUp:async i=>{calls.push(['signUp',i]);return {error:null};},
  signInWithOtp:async i=>{calls.push(['otp',i]);return {error:null};},
  verifyOtp:async i=>{calls.push(['verify',i]);return {error:i.token==='123456'?null:{message:'bad'}};},
  signInWithPassword:async i=>{calls.push(['password',i]);return {error:{message:'bad'}};},
 }}};
 const source=ts.transpileModule(fs.readFileSync('src/app/api/auth/entry/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const output={};
 vm.runInNewContext(source,{exports:output,URL,require:name=>name==='next/server'?{NextResponse}:name.endsWith('auth-config')?config:{requestAuth:()=>auth}});
 return {POST:output.POST,calls};
}
function env(){process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test';process.env.ANNIENEXUS_ALLOWED_EMAILS='fixture@example.invalid';}
const post=(POST,body)=>POST(new Request('https://consultormacro.com/api/auth/entry',{method:'POST',headers:{origin:'https://consultormacro.com','content-type':'application/json'},body:JSON.stringify(body)}));
test('sending a code never creates accounts and answers the same for unknown emails',async()=>{
 env();const {POST,calls}=loadEntry();
 const ok=await post(POST,{action:'send-code',email:'Fixture@example.invalid'});
 const other=await post(POST,{action:'send-code',email:'intruder@example.invalid'});
 assert.equal(ok.status,200);assert.deepEqual(await ok.json(),await other.json());
 assert.equal(calls.length,1);assert.equal(calls[0][0],'otp');
 assert.equal(calls[0][1].email,'fixture@example.invalid');assert.equal(calls[0][1].options.shouldCreateUser,false);
});
test('registration is no longer available',async()=>{
 env();const {POST,calls}=loadEntry();
 const r=await post(POST,{action:'register',email:'fixture@example.invalid',password:'longenough'});
 assert.equal(r.status,400);assert.equal(calls.length,0);
});
test('codes must be numeric and come from an allowed email',async()=>{
 env();const {POST,calls}=loadEntry();
 assert.equal((await post(POST,{action:'verify-code',email:'fixture@example.invalid',code:'abc123'})).status,401);
 assert.equal((await post(POST,{action:'verify-code',email:'intruder@example.invalid',code:'123456'})).status,401);
 assert.equal(calls.length,0);
 assert.equal((await post(POST,{action:'verify-code',email:'fixture@example.invalid',code:'000000'})).status,401);
 const good=await post(POST,{action:'verify-code',email:'fixture@example.invalid',code:'123456'});
 assert.equal(good.status,200);assert.deepEqual(await good.json(),{ok:true});
});
