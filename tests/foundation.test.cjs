/* eslint-disable @typescript-eslint/no-require-imports -- tests run against compiled CommonJS contracts. */
const test=require('node:test');
const assert=require('node:assert/strict');
const {authorizeRead}=require('../.foundation-test-build/shared/server/access.js');
const {getPendingContext}=require('../.foundation-test-build/modules/annienexus/context.js');
const {HORIZONS}=require('../.foundation-test-build/contracts/core.js');
const routes=[
 require('../.foundation-test-build/app/api/annienexus/context/route.js'),
 require('../.foundation-test-build/app/api/radar/opportunities/route.js'),
 require('../.foundation-test-build/app/api/radar/observations/route.js'),
 require('../.foundation-test-build/app/api/radar/health/route.js'),
];
const clock=()=>new Date('2026-09-30T12:00:00.000Z');
const request=new Request('https://local.example/api/annienexus/context?horizon=today');
const provider=(session)=>({resolve:async()=>session});
const authenticated={state:'authenticated',userId:'test-user',expiresAt:'2026-09-30T12:01:00.000Z',capabilities:['annienexus:read']};
test('Missing evidence remains unavailable for every horizon; it is never a neutral thesis',()=>{
 for(const horizon of HORIZONS){const result=getPendingContext(horizon,clock);assert.equal(result.status,'unavailable');assert.equal(result.dataAsOf,null);assert.equal(result.data.contextVersion,null);assert.equal(result.data.asOf,null);assert.equal(result.data.modelVersion,null);assert.deepEqual(result.sources,[]);assert.equal(result.data.horizon,horizon);assert.equal(result.data.theses.length,3);for(const thesis of result.data.theses){assert.equal(thesis.direction,'not_evaluated');assert.equal(thesis.asOf,null);}}
});
test('Real authorization distinguishes unconfigured, anonymous, expired and forbidden sessions',async()=>{
 for(const [state,status] of [[{state:'unconfigured'},503],[{state:'anonymous'},401],[{...authenticated,expiresAt:clock().toISOString()},401],[{...authenticated,expiresAt:'not-a-date'},401],[{...authenticated,userId:''},401],[{...authenticated,capabilities:[]},403]]){const response=await authorizeRead(request,'annienexus:read',provider(state),clock);assert.equal(response.status,status);assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert.equal((await response.json()).data,null);}
 assert.equal(await authorizeRead(request,'annienexus:read',provider(authenticated),clock),null);
 assert.equal((await authorizeRead(request,'radar:read',provider(authenticated),clock)).status,403);
});
test('Identity provider failure does not expose its error or accidentally allow access',async()=>{
 const response=await authorizeRead(request,'annienexus:read',{resolve:async()=>{throw new Error('internal-sensitive-test-detail');}},clock);assert.equal(response.status,503);assert.ok(!(await response.text()).includes('internal-sensitive-test-detail'));
});
test('All new data endpoints stay closed with arbitrary legacy cookies or authorization headers',async()=>{
 for(const route of routes){const response=await route.GET(new Request(request.url,{headers:{cookie:'consultor_session=arbitrary','Authorization':'Bearer arbitrary','X-User-Id':'test-user'}}));assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'private, no-store');const body=await response.json();assert.equal(body.schemaVersion,'0.2.0');assert.equal(body.data,null);assert.equal(body.dataAsOf,null);assert.deepEqual(body.sources,[]);}
});
