import fs from 'node:fs';
import assert from 'node:assert/strict';
// Start production-like local server with VERCEL=1 and test-only allowlist first.
const base='http://127.0.0.1:3020';
const cases=[['/acceso',200],['/annienexus',307],['/annienexus/formacion',307],['/api/notes',401],['/api/learning/122b243c641844fd.jpg',401],['/annienexus/learning/122b243c641844fd.jpg',401],['/_next/image?url=%2Fapi%2Flearning%2F122b243c641844fd.jpg&w=640&q=75',401],['/fonts/RobotoCondensed.ttf',200]];
const rows=[];
for(const [path,expected] of cases){const r=await fetch(base+path,{redirect:'manual',headers:{cookie:'site-auth=1; annienexus_session=fake','x-annienexus-user':'owner'}});rows.push({path,status:r.status,expected,cache:r.headers.get('cache-control'),location:r.headers.get('location')});assert.equal(r.status,expected,path);if(expected===307)assert.equal(r.headers.get('location'),'https://consultormacro.com/acceso');}
for(const body of ['null','{}']){const r=await fetch(base+'/api/auth/entry',{method:'POST',headers:{origin:'https://consultormacro.com','content-type':'application/json'},body});rows.push({path:'/api/auth/entry',body,status:r.status});assert.equal(r.status,400);}
const r=await fetch(base+'/api/auth/entry',{method:'POST',headers:{origin:'https://example.invalid'},body:'{}'});assert.equal(r.status,403);rows.push({path:'/api/auth/entry',crossOrigin:true,status:r.status});
const local=await fetch('http://127.0.0.1:3017/api/learning/122b243c641844fd.jpg');assert.equal(local.status,200);assert.deepEqual(Buffer.from(await local.arrayBuffer()),fs.readFileSync('private/learning/122b243c641844fd.jpg'));
const trace=JSON.parse(fs.readFileSync('.next/server/app/api/learning/[file]/route.js.nft.json','utf8'));const privateFiles=[...new Set(trace.files.filter(x=>x.includes('private/learning/')))];assert.equal(privateFiles.length,16);
const result={checkedAt:new Date().toISOString(),mode:'VERCEL=1 with preview flag deliberately present; test-only nonexistent allowlist, no accounts created',rows,privateAssetByteEquality:true,privateFilesPackaged:privateFiles.length};
console.log(JSON.stringify(result,null,2));
