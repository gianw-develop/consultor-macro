/* eslint-disable @typescript-eslint/no-require-imports -- compiled contract tests */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const c=require('../.foundation-test-build/modules/annienexus/cloud-refresh.js');
// Pin the prior vintage to the simulated clock; production latest.json keeps advancing.
const prior=JSON.parse(readFileSync('data/macro/runs/2026-10-20T23-15-45Z/snapshot.json','utf8'));
const now='2026-10-21T15:00:00Z';
const options={now,clock:()=>now};
const fail=async()=>new Response('unavailable',{status:500});

test('Madrid 17:00 slot follows both DST changes and rejects the other UTC hour',()=>{
 for(const date of ['2026-03-28T16:00:00Z','2026-03-29T15:00:00Z','2026-10-24T15:00:00Z','2026-10-25T16:00:00Z'])assert.equal(c.madridRefreshSlot(date).due,true,date);
 for(const date of ['2026-03-28T15:00:00Z','2026-03-29T16:00:00Z','2026-10-24T16:00:00Z','2026-10-25T15:00:00Z', '2026-10-21T15:15:00Z'])assert.equal(c.madridRefreshSlot(date).due,false,date);
 assert.equal(c.madridRefreshSlot('2026-10-20T22:30:00Z').day,'2026-10-21');
 assert.throws(()=>c.madridRefreshSlot('bad date'));
});
test('failed checks preserve values and original source dates, without inventing freshness',async()=>{
 const copy=JSON.stringify(prior);
 const result=await c.collectCloudCandidate(prior,{...options,fetcher:fail});
 assert.equal(result.status,'failed');assert.equal(result.mode,'candidate_only');
 for(const key of ['cli','nfp','treasury'])assert.deepEqual(result.snapshot[key],prior[key]);
 assert.ok(result.attempts.every(a=>a.state==='retained'));
 assert.equal(JSON.stringify(prior),copy);
});
test('missing source with no previous cut remains unavailable, never zero',async()=>{
 const result=await c.collectCloudCandidate(null,{...options,fetcher:fail});
 assert.ok(result.attempts.every(a=>a.state==='unavailable'&&a.observedThrough===null));
 assert.equal(result.snapshot.nfp,null);assert.equal(result.snapshot.cli,null);assert.equal(result.snapshot.treasury,null);
});
test('a source failure does not discard other independently valid series',async()=>{
 const raw=readFileSync('data/macro/runs/2026-10-20T23-09-40.937Z/bls.json','utf8');
 const result=await c.collectCloudCandidate(prior,{...options,fetcher:async url=>String(url).includes('api.bls.gov')?new Response(raw):fail()});
 assert.equal(result.status,'partial');assert.equal(result.snapshot.nfp.source.fetchedAt,now);
 assert.equal(result.snapshot.nfp.source.publishedAt,null);
 assert.deepEqual(result.snapshot.cli,prior.cli);
 assert.deepEqual(result.snapshot.treasury,prior.treasury);
 assert.equal(result.evidence.length,1);
 assert.match(result.evidence[0].source.sha256,/^[a-f0-9]{64}$/);
});
test('older successful responses cannot roll back current data',async()=>{
 const oldRoot='data/macro/runs/2026-09-30T16-06-29.854Z/';
 const fetcher=async url=>new Response(readFileSync(oldRoot+(String(url).includes('oecd')?'oecd-cli.csv':String(url).includes('bls.gov')?'bls.json':'treasury.csv'),'utf8'));
 const result=await c.collectCloudCandidate(prior,{...options,fetcher});
 assert.equal(result.status,'failed');
 assert.deepEqual(result.snapshot.cli,prior.cli);assert.deepEqual(result.snapshot.nfp,prior.nfp);assert.deepEqual(result.snapshot.treasury,prior.treasury);
 assert.equal(result.evidence.length,3);
});
test('candidate guard bounds response size and never copies remote errors',async()=>{
 const result=await c.collectCloudCandidate(null,{...options,fetcher:async()=>new Response('secret-remote-error',{headers:{'content-length':'8000001'}})});
 assert.equal(result.status,'failed');assert.equal(result.evidence.length,0);assert.ok(!JSON.stringify(result).includes('secret-remote-error'));
 await assert.rejects(c.collectCloudCandidate({...prior,capturedAt:'2027-01-01T00:00:00Z'},options),/future/);
});
test('only an acquired daily lease can store a candidate; no publication hook exists',async()=>{
 let claimed=0,finished=0,failed=0;
 const store={claim:async day=>{assert.equal(day,'2026-10-21');claimed++;return {lease:'lease-test',prior}},finish:async(lease,data)=>{assert.equal(lease,'lease-test');assert.equal(data.mode,'candidate_only');finished++},fail:async()=>{failed++}};
 assert.equal((await c.runCloudCandidate(store,{...options,now:'2026-10-21T16:00:00Z',fetcher:fail})).state,'outside_schedule');
 assert.equal(claimed,0);
 assert.equal((await c.runCloudCandidate({...store,claim:async()=>null},{...options,fetcher:fail})).state,'already_claimed');
 assert.equal((await c.runCloudCandidate(store,{...options,fetcher:fail})).state,'stored_candidate');
 assert.equal(finished,1);assert.equal(failed,0);
 await assert.rejects(c.runCloudCandidate({...store,finish:async()=>{throw new Error('Storage unavailable')}},{...options,fetcher:fail}),/Storage unavailable/);
 assert.equal(failed,1);
});
