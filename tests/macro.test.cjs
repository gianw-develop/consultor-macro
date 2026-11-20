/* eslint-disable @typescript-eslint/no-require-imports -- tests execute the CommonJS contract build */
const {test}=require('node:test'); const assert=require('node:assert/strict');
const {readFileSync,readdirSync}=require('node:fs');
const m=require('../.foundation-test-build/modules/annienexus/macro-data.js');
const run='data/macro/runs/'+readdirSync('data/macro/runs').sort()[0]+'/';
const snapshot=JSON.parse(readFileSync(run+'snapshot.json','utf8'));
const now='2026-09-30T16:06:29.854Z';
test('CLI separates exact G7/G20/USA dimensions',()=>{const csv=readFileSync(run+'oecd-cli.csv','utf8');for(const area of ['G7','G20','USA'])assert.deepEqual(m.parseCli(csv,area,now),snapshot.cli[area].points);assert.notDeepEqual(snapshot.cli.G7.points,snapshot.cli.USA.points);assert.throws(()=>m.parseCli(csv.replaceAll(',AA,',',N,'),'G7',now));});
test('BLS payroll levels yield monthly changes and full-window means',()=>{const p=m.parseNfp(JSON.parse(readFileSync(run+'bls.json','utf8')),now);assert.equal(m.change(p,1,true),162);assert.equal(m.change(p,3,true),214/3);assert.equal(m.change(p,6,true),639/6);assert.equal(p.at(-1).preliminary,true);});
test('a missing calendar month never turns into a shorter window',()=>{const p=snapshot.nfp.points.filter(p=>p.period!=='2026-07');assert.equal(m.change(p,3,true),null);assert.equal(m.change(p,1,true),null);});
test('duplicate, future and nonfinite monthly observations fail',()=>{for(const points of [[{period:'2026-08',value:1},{period:'2026-08',value:2}],[{period:'2026-09',value:1}],[{period:'2026-08',value:NaN}]])assert.throws(()=>m.validateMonthly(points,now));});
test('BLS failure and wrong series never become zero',()=>{assert.throws(()=>m.parseNfp({status:'REQUEST_FAILED'},now));assert.throws(()=>m.parseNfp({status:'REQUEST_SUCCEEDED',Results:{series:[{seriesID:'OTHER',data:[]}]}},now));});
test('Treasury header mapping includes 20-year and latest published day',()=>{const rows=m.parseTreasury(readFileSync(run+'treasury.csv','utf8'),now);assert.equal(rows[0].date,'2026-09-29');assert.deepEqual(rows[0].values,[4.25,4.36,4.58,4.89,4.98,5.06,5.16,5.26,5.64,5.59]);assert.ok(Math.abs(rows[0].values[7]-rows[0].values[3]-.37)<1e-9);});
test('Treasury rejects blank values and future observations',()=>{const csv=readFileSync(run+'treasury.csv','utf8');assert.throws(()=>m.parseTreasury(csv.replace('09/29/2026','10/01/2026'),now));assert.throws(()=>m.parseTreasury(csv.replace('4.25,4.30',',4.30'),now));});
test('revision comparison tracks overlapping periods without inventing a vintage',()=>{const before={id:'x',points:[{period:'2026-06',value:1}]};const after={id:'x',points:[{period:'2026-06',value:2},{period:'2026-07',value:3}]};assert.deepEqual(m.compareRevisions(before,after),[{series:'x',period:'2026-06',previous:1,current:2}]);assert.deepEqual(m.compareRevisions(null,after),[]);});
test('fixed direction is precision-aware, absence distinct from flat',()=>{assert.equal(m.direction(null),'missing');assert.equal(m.direction(.001),'flat');assert.equal(m.direction(.2),'up');assert.equal(m.direction(-.2),'down');assert.equal(m.isOld('2026-08', '2027-01-01',100),true);});
test('official September CLI export replaces the full window and retains revisions',()=>{
 const {createHash}=require('node:crypto');
 const folder='data/macro/runs/2026-10-15T09-34-18.010Z/';
 const s=JSON.parse(readFileSync(folder+'snapshot.json','utf8'));
 const hash=createHash('sha256').update(readFileSync(folder+'oecd-cli.xlsx')).digest('hex');
 for(const [area,last,three,six] of [['USA',100.9993,.2363,.5678],['G7',100.937,.2699,.4923],['G20',100.1431,-.0609,-.1716]]){
  const series=s.cli[area];assert.equal(series.points.at(-1).period,'2026-09');assert.equal(series.points.at(-1).value,last);
  assert.equal(series.points[0].period,'2025-12');assert.equal(series.points.length,10);
  assert.ok(Math.abs(m.change(series.points,3)-three)<1e-8);assert.ok(Math.abs(m.change(series.points,6)-six)<1e-8);
  assert.equal(series.source.sha256,hash);assert.equal(series.source.mode,'reviewed_release');assert.equal(series.source.publishedAt,null);
 }
 assert.equal(s.revisions.length,27);
 assert.equal(s.revisions.find(r=>r.series==='OECD.CLI.USA'&&r.period==='2026-08').current,100.9464);
});
test('an older connector response cannot replace a newer reviewed period',()=>{
 const before={points:[{period:'2026-09',value:100}]};
 assert.throws(()=>m.assertNoPeriodRegression(before,{points:[{period:'2026-08',value:101}]}),/periodo anterior/);
 assert.doesNotThrow(()=>m.assertNoPeriodRegression(before,{points:[{period:'2026-09',value:99}]}));
 assert.doesNotThrow(()=>m.assertNoPeriodRegression(null,{points:[{period:'2026-09',value:100}]}));
});
