/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {m1SixMonthGrowth,nominalM1,realM1,m1Growth,M1_AVAILABLE_FROM,M1_RELEASED_AT,M1_CPI_RELEASED_AT}=require('../.foundation-test-build/modules/annienexus/m1-data.js');
const {recentRetailRates,pillarMonthLabel,deflateRetail}=require('../.foundation-test-build/modules/annienexus/economic-pillars-data.js');
const p=(period,value)=>({period,value});
test('six-month growth uses exact calendar endpoints and exact deflation',()=>{
 const real=deflateRetail([p('2026-02',100),p('2026-08',110)],[p('2026-02',100),p('2026-08',105)]).map(v=>p(v.period,v.real));
 assert.ok(Math.abs(m1SixMonthGrowth(real,'2026-08')-4.761904761904767)<1e-10);
 assert.equal(m1SixMonthGrowth([p('2026-01',100),p('2026-08',110)],'2026-08'),null);
 assert.equal(m1SixMonthGrowth([p('2026-02',null),p('2026-08',110)],'2026-08'),null);
 assert.equal(m1SixMonthGrowth([p('2026-02',0),p('2026-08',110)],'2026-08'),null);
});
test('definition break blocks crossings but permits same-definition windows',()=>{
 assert.equal(m1SixMonthGrowth([p('2020-04',100),p('2020-10',400)],'2020-10'),null);
 assert.ok(Math.abs(m1SixMonthGrowth([p('2020-05',100),p('2020-11',110)],'2020-11')-10)<1e-10);
});
test('dated M1 snapshot preserves missing April growth and input publication dates',()=>{
 assert.equal(realM1.at(-1).period,'2026-09');
 assert.ok(Math.abs(m1Growth.at(-1).value-1.6602865658864374)<1e-10);
 assert.equal(m1Growth.find(p=>p.period==='2026-04').value,null);
 assert.ok(realM1.find(p=>p.period==='2026-04').real>0);
 assert.equal(M1_AVAILABLE_FROM,'2026-10-27');
 assert.ok(M1_AVAILABLE_FROM>=M1_RELEASED_AT&&M1_AVAILABLE_FROM>=M1_CPI_RELEASED_AT);
});
test('retail shows last three actual monthly observations with stable unique labels',()=>{
 assert.deepEqual(recentRetailRates.map(p=>p.period),['2026-07','2026-08','2026-09']);
 const tz=process.env.TZ; process.env.TZ='America/Los_Angeles';
 try {assert.deepEqual(recentRetailRates.map(p=>pillarMonthLabel(p.period)),['julio 2026','agosto 2026','septiembre 2026']);} finally {if(tz===undefined)delete process.env.TZ;else process.env.TZ=tz;}
 assert.ok(recentRetailRates[0].nominal<0&&recentRetailRates[0].real<0);
 assert.ok(recentRetailRates[1].nominal>0&&recentRetailRates[1].real>0);
 assert.ok(Math.abs(recentRetailRates[2].real-0.1215053474115102)<1e-10);
});

test('October H6 revision updates both six-month endpoints and preserves the prior vintage in the audit',()=>{
 assert.equal(nominalM1.find(p=>p.period==='2026-03').value,19381.2);
 assert.equal(nominalM1.find(p=>p.period==='2026-08').value,19967.3);
 assert.equal(realM1.at(-1).cpi,336.298);
 assert.ok(Math.abs(m1Growth.find(p=>p.period==='2026-08').value-1.1508756248458152)<1e-10);
});
