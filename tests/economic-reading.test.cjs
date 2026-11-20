/* eslint-disable @typescript-eslint/no-require-imports -- private compiled-engine tests */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {evaluateEconomicReading:evaluate,activityEvidenceKey,teaching,readingPeriod}=require('../.foundation-test-build/modules/annienexus/economic-reading.js');
const fixture=require('./fixtures/reading-2026-10-02.json');
const at='2026-10-02T13:00:00Z';
const fresh=()=>structuredClone(fixture);
const signal=(input,id)=>evaluate(input,at).signals.find(s=>s.id===id);
function review(input,state='expansion') {input.review={state,cut:input.cut,evidenceKey:activityEvidenceKey(input),reviewedAt:at,expiresAt:'2026-10-05T07:00:00Z',rationale:'Private test assessment; never sent to production',contradictions:[]};return input;}

test('actual September employment includes revised levels and mixed labor context',()=>{
 const s=signal(fresh(),'employment');assert.equal(s.value,29);assert.equal(s.tone,'mixed');
 assert.equal(s.observations[0].value,152/3);assert.equal(s.observations[1].value,394/6);
 assert.ok(s.observations.some(o=>o.label==='Desempleo'&&o.value===4.2));
 assert.ok(s.observations.some(o=>o.label==='Participación laboral'&&o.value===61.8));
 assert.match(s.explanation,/Menor impulso/);assert.match(s.sources[0].revision,/−60/);
});
test('positive hiring averages alone never become confirmed labor strength',()=>{const i=fresh();i.laborContext=null;assert.equal(signal(i,'employment').tone,'neutral');});
test('weekly claims are inverse; equal, absent or discontinuous comparisons stay neutral',()=>{
 const i=fresh();assert.equal(signal(i,'claims').tone,'green');const p=i.claims.points;p.at(-1).value=p.at(-2).value+1000;assert.equal(signal(i,'claims').tone,'red');p.at(-1).value=p.at(-2).value;assert.equal(signal(i,'claims').tone,'neutral');p.at(-1).value=null;assert.equal(signal(i,'claims').tone,'neutral');p.at(-1).value=190000;p.splice(-2,1);assert.equal(signal(i,'claims').tone,'neutral');
});
test('retail uses real monthly growth; M1 separates positive growth from lost impulse',()=>{
 const i=fresh();assert.equal(signal(i,'retail').tone,'green');i.retail.points.at(-1).value=-.5;assert.equal(signal(i,'retail').tone,'red');i.retail.points.at(-1).value=0;assert.equal(signal(i,'retail').tone,'neutral');
 const m=signal(i,'money');assert.ok(m.value>0);assert.equal(m.tone,'red');assert.match(m.explanation,/no equivale a contracción/);
});
test('a future or impossible period, nonfinite number or metadata failure yields no directional state',()=>{
 for(const mutate of [i=>i.claims.points.at(-1).period='2026-10-03',i=>i.claims.points.at(-1).period='2026-09-31',i=>i.claims.points.at(-1).value=Infinity,i=>i.claims.source.publishedAt='2026-10-04',i=>i.claims.source.checkedAt='2026-10-04',i=>i.claims.unit='',i=>i.claims.source.url='',i=>i.claims.source.publishedAt='invalid']){const i=fresh();mutate(i);assert.equal(signal(i,'claims').tone,'neutral');assert.equal(signal(i,'claims').value,null);}
 const i=fresh();i.retail.points.at(-1).period='2026-10';assert.equal(signal(i,'retail').value,null);
});
test('annual CPI and Fed controls follow the input and reject future or nonfinite observations',()=>{
 const i=fresh();i.inflationAnnual.points.at(-1).value=3.1;assert.ok(signal(i,'inflation').observations.some(o=>o.label==='IPC general interanual'&&o.value===3.1));
 i.inflationAnnual.points.at(-1).period='2026-10';assert.ok(!signal(i,'inflation').observations.some(o=>o.label==='IPC general interanual'));
 i.fedTarget.upper=Infinity;assert.equal(signal(i,'bonds').observations.find(o=>o.label==='Fed · límite superior').value,null);
 i.fedTarget.upper=4;i.fedTarget.period='2026-10-03';assert.equal(signal(i,'bonds').observations.find(o=>o.label==='Fed · límite superior').value,null);
});
test('green broad activity can coexist with a red early vein; an adverse body can have green relief',()=>{
 const i=review(fresh());let r=evaluate(i,at);assert.equal(r.body.tone,'green');assert.equal(r.signals.find(s=>s.id==='money').tone,'red');
 for(const s of [i.cei,i.gdp])for(const p of s.points)p.value=-Math.abs(p.value);i.ceiSixMonth=-.4;i.ceiComponentsSixMonth=[-1,-1,-1,-1];review(i,'adverse');r=evaluate(i,at);assert.equal(r.body.tone,'red');assert.equal(r.signals.find(s=>s.id==='claims').tone,'green');
});
test('absence or expiry of review is not falsely described as contradictory economic data',()=>{
 const i=fresh();i.review=null;assert.equal(evaluate(i,at).body.tone,'neutral');review(i);i.review.expiresAt=at;assert.equal(evaluate(i,at).body.tone,'neutral');assert.doesNotMatch(evaluate(i,at).body.title,/mixt/);
});
test('same-cut data revisions invalidate the exact evidence binding',()=>{
 const i=review(fresh());const cut=i.cut;i.cei.points.at(-1).value+=.01;assert.equal(i.cut,cut);assert.equal(evaluate(i,at).body.tone,'neutral');review(i);i.nfp.points.at(-2).value-=5;assert.equal(evaluate(i,at).body.tone,'neutral');
});
test('genuine opposing broad observations are mixed, all ties or missing evidence are not',()=>{
 const i=fresh();i.gdp.points.at(-1).value=-1;assert.equal(evaluate(i,at).body.tone,'mixed');
 for(const s of [i.cei,i.gdp])for(const p of s.points)p.value=0;i.ceiSixMonth=0;i.ceiComponentsSixMonth=[0,0,0,0];assert.equal(evaluate(i,at).body.tone,'neutral');
 for(const value of [null,Infinity,NaN]){i.ceiSixMonth=value;assert.equal(evaluate(i,at).body.tone,'neutral');}
});
test('selection cannot enter diagnosis and leading indicators never vote into the body',()=>{
 const i=review(fresh());const expected=evaluate(i,at);for(let selection=0;selection<expected.signals.length;selection++)assert.deepEqual(evaluate(i,at),expected);
 i.claims.points.at(-1).value=500000;i.money.points.at(-1).value=-30;i.cli.points.at(-1).value=85;review(i);assert.equal(evaluate(i,at).body.tone,'green');
});
test('NFP rejects a missing calendar month and nonfinite differences',()=>{
 const i=fresh();i.nfp.points=i.nfp.points.filter(p=>p.period!=='2026-07');assert.equal(signal(i,'employment').tone,'neutral');assert.equal(signal(i,'employment').observations[0].value,null);
 const j=fresh();j.nfp.points.at(-1).value=Number.MAX_VALUE;j.nfp.points.at(-2).value=-Number.MAX_VALUE;assert.equal(signal(j,'employment').value,null);
});
test('teaching links land on the exact published audited fragment and periods read in Spanish',()=>{
 const audit=JSON.parse(fs.readFileSync('docs/annienexus/gregory-publication-audit.json'));
 const lib=JSON.parse(fs.readFileSync('src/modules/annienexus/published-library.json'));
 for(const t of Object.values(teaching)){const f=audit.fragments.find(f=>f.fragmentId===t.fragment);assert.ok(f);const body=lib.find(d=>d.id===t.lesson).body.replace(/^# [^\n]+\n+/,'');const line=Number(t.anchor.replace('tema-',''));assert.equal(body.split('\n')[line-1],'## '+f.heading);assert.ok(body.slice(body.split('\n').slice(0,line).join('\n').length).includes(f.publishedText));}
 assert.equal(readingPeriod('2026-09'),'septiembre de 2026');assert.equal(readingPeriod('2026-Q2'),'2.º trimestre de 2026');assert.match(readingPeriod('2026-09-26','week'),/semana terminada/);
});
test('current cut keeps Principal and brain on the same revised retail and claims data',()=>{
 const {makeReadingInput}=require('../.foundation-test-build/modules/annienexus/reading-data.js');
 const snapshot=JSON.parse(fs.readFileSync('data/macro/latest.json'));
 const i=makeReadingInput(snapshot),r=evaluate(i,snapshot.capturedAt);
 assert.deepEqual(i.inflation.points.at(-1),{period:'2026-09',value:.6});
 assert.deepEqual(i.inflationAnnual.points.at(-1),{period:'2026-09',value:3.7});
 assert.equal(i.claims.points.at(-1).period,'2026-10-24');assert.equal(i.claims.points.at(-1).value,196750);
 assert.equal(i.claims.points.at(-2).value,198000);assert.equal(r.signals.find(s=>s.id==='claims').tone,'green');
 assert.equal(i.retail.points.at(-1).period,'2026-09');assert.ok(Math.abs(i.retail.points.at(-1).value-.1215053474115102)<1e-9);
 assert.equal(i.treasury10.points.at(-1).period,'2026-11-03');assert.equal(i.treasury10.points.at(-1).value,4.95);
 assert.deepEqual(i.lei.points.map(p=>p.period),['2026-07','2026-08','2026-09']);
 assert.deepEqual(i.lei.points.map(p=>p.value),[.3,-.1,0]);
 assert.equal(i.cei.points.at(-1).value,.3);assert.equal(i.ceiSixMonth,.9);
 assert.equal(r.body.tone,'neutral');
 assert.deepEqual(i.gdp.points.at(-1),{period:'2026-Q3',value:3.4});
 assert.equal(i.gdp.source.publishedAt,'2026-10-29T12:30:00Z');
});
