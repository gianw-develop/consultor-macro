/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');
const {authConfiguration,emailAllowed,localPreview,sameOrigin}=require('../.foundation-test-build/shared/server/auth-config.js');
const {authorizedUser}=require('../.foundation-test-build/shared/server/supabase-request.js');
function configured(){process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-public';process.env.ANNIENEXUS_ALLOWED_EMAILS='owner@example.invalid';}
test('configuration requires an explicit allowlist and local preview never opens on Vercel',()=>{configured();delete process.env.ANNIENEXUS_ALLOWED_EMAILS;assert.equal(authConfiguration(),null);configured();assert.equal(emailAllowed('OWNER@example.invalid'),true);assert.equal(emailAllowed('other@example.invalid'),false);process.env.ANNIENEXUS_LOCAL_PREVIEW='1';delete process.env.VERCEL;assert.equal(localPreview(),true);process.env.VERCEL='1';assert.equal(localPreview(),false);delete process.env.ANNIENEXUS_LOCAL_PREVIEW;delete process.env.VERCEL;});
test('unconfirmed, anonymous and non-allowed users never gain private access',async()=>{configured();const owner={id:'owner',email:'owner@example.invalid',email_confirmed_at:'2026-10-01T00:00:00Z'};for(const user of [null,{...owner,email_confirmed_at:null},{...owner,email:'other@example.invalid'}])assert.equal(await authorizedUser({user:async()=>user}),null);assert.equal(await authorizedUser({user:async()=>owner}),owner);});
test('mutations require same-origin requests, including logout and notes',()=>{assert.equal(sameOrigin(new Request('https://consultormacro.com/api/notes',{headers:{origin:'https://consultormacro.com'}})),true);for(const origin of ['https://example.invalid','http://consultormacro.com','null'])assert.equal(sameOrigin(new Request('https://consultormacro.com/api/notes',{headers:{origin}})),false);assert.equal(sameOrigin(new Request('https://consultormacro.com/api/notes')),false);});

test('production origin is canonical; local proxy preserves loopback host',()=>{process.env.VERCEL='1';assert.equal(sameOrigin(new Request('http://localhost:3000/api/notes',{headers:{origin:'https://consultormacro.com',host:'evil.invalid'}})),true);assert.equal(sameOrigin(new Request('http://localhost:3000/api/notes',{headers:{origin:'https://evil.invalid',host:'evil.invalid'}})),false);delete process.env.VERCEL;assert.equal(sameOrigin(new Request('http://localhost:3020/api/notes',{headers:{origin:'http://127.0.0.1:3020',host:'127.0.0.1:3020'}})),true);});

test('direct private links preserve only allowlisted destinations after login',()=>{
 const {safePostLoginPath}=require('../.foundation-test-build/shared/auth-destination.js');
 assert.equal(safePostLoginPath('/annienexus/calculadora'),'/annienexus/calculadora');
 assert.equal(safePostLoginPath('/radar'),'/radar');
 for(const value of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','javascript:alert(1)','/annienexus/calculadora?next=https://evil.invalid',['/annienexus/calculadora'],undefined,null])assert.equal(safePostLoginPath(value),'/annienexus');
});
