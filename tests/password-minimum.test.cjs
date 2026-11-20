/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const config=require('../.foundation-test-build/shared/server/auth-config.js');
const {NextResponse}=require('next/server');
function loadEntry(){
 const registrations=[];
 const auth={apply:r=>r,client:{auth:{signUp:async input=>{registrations.push(input);return {error:null};}}}};
 const source=ts.transpileModule(fs.readFileSync('src/app/api/auth/entry/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const output={};
 vm.runInNewContext(source,{exports:output,URL,require:name=>name==='next/server'?{NextResponse}:name.endsWith('auth-config')?config:{requestAuth:()=>auth}});
 return {POST:output.POST,registrations};
}
test('registration rejects 7 characters before contacting Supabase and accepts 8 at the application boundary',async()=>{
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test';process.env.ANNIENEXUS_ALLOWED_EMAILS='fixture@example.invalid';
 const {POST,registrations}=loadEntry();
 const submit=password=>POST(new Request('https://consultormacro.com/api/auth/entry',{method:'POST',headers:{origin:'https://consultormacro.com','content-type':'application/json'},body:JSON.stringify({email:'fixture@example.invalid',password,action:'register'})}));
 const rejected=await submit('test123');assert.equal(rejected.status,400);assert.deepEqual(await rejected.json(),{error:'Usa al menos 8 caracteres.'});assert.equal(registrations.length,0);
 const accepted=await submit('test1234');assert.equal(accepted.status,200);assert.equal(registrations.length,1);assert.equal(registrations[0].password.length,8);assert.equal(registrations[0].options.emailRedirectTo,'https://consultormacro.com/auth/callback');
});
