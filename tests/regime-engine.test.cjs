/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {evaluateRegime,growthAxis,inflationAxis,phaseOf}=require('../.foundation-test-build/modules/annienexus/regime-engine.js');
const {cpiMonthlyRates}=require('../.foundation-test-build/modules/annienexus/economic-pillars-data.js');
const latest=require('../data/macro/latest.json');
const cli=latest.cli.G7.points.map(p=>({period:p.period,value:p.value}));
const annual=[{period:'2026-07',value:3.4},{period:'2026-08',value:3.4},{period:'2026-09',value:3.7}];
test('quadrants follow the sign of each axis',()=>{
 assert.equal(phaseOf(.5,.5),'inflationary_expansion');assert.equal(phaseOf(.5,-.5),'disinflationary_expansion');
 assert.equal(phaseOf(-.5,.5),'stagflation');assert.equal(phaseOf(-.5,-.5),'deflationary_crisis');
});
test('growth axis is the scaled 3-month CLI change',()=>{
 const sep=growthAxis(cli).at(-1);assert.equal(sep.period,'2026-09');assert.equal(sep.value,0.9);
});
test('inflation axis compares 3-month annualized CPI with annual CPI',()=>{
 const y=inflationAxis(cpiMonthlyRates,annual);
 assert.deepEqual(y.map(p=>p.period),['2026-07','2026-08','2026-09']);
 assert.equal(y.at(-1).value,0.39);assert.equal(y[1].value,-1);
});
test('real cut: September crosses into inflationary expansion near the inflation border',()=>{
 const r=evaluateRegime(cli,cpiMonthlyRates,annual,[]);
 assert.equal(r.point.phase,'inflationary_expansion');
 assert.equal(r.trail[1].phase,'disinflationary_expansion');
 assert.equal(r.monthsInPhase,1);assert.equal(r.stage,'early');
 assert.equal(r.nearestBorder.axis,'inflation');assert.equal(r.nearestBorder.nextPhase,'disinflationary_expansion');
});
test('a point close to a border and moving toward it is in transition',()=>{
 const cli=[100,100.1,100.2,100.3,100.35,100.38,100.33].map((v,i)=>({period:`2026-0${i+1}`,value:v}));
 const rates=cli.map(p=>({period:p.period,value:.3})), yoy=cli.map(p=>({period:p.period,value:3}));
 const r=evaluateRegime(cli,rates,yoy,[]);
 assert.equal(r.point.x,.1);assert.equal(r.nearestBorder.axis,'growth');
 assert.equal(r.stage,'transition');assert.equal(r.nearestBorder.nextPhase,'stagflation');
 assert.match(r.headline,/en transición/);
});
test('missing inputs return null instead of a guessed point',()=>{
 assert.equal(evaluateRegime([],[],[],[]),null);
});
