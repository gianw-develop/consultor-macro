/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {deflateRetail,monthlyRate,nominalRetail,consumerPrices,realRetail,weeklyClaims}=require('../.foundation-test-build/modules/annienexus/economic-pillars-data.js');
const p=(period,value)=>({period,value});
test('real growth uses exact division, not subtraction of rates or levels',()=>{
 const real=deflateRetail([p('2026-07',100),p('2026-08',110)],[p('2026-07',100),p('2026-08',105)]);
 assert.ok(Math.abs(real[1].real-104.7619047619)<1e-8);
 assert.ok(Math.abs(monthlyRate(real.map(v=>p(v.period,v.real)))-4.7619047619)<1e-8);
});
test('missing prices stay missing; rates require the immediately preceding month',()=>{
 assert.equal(deflateRetail([p('2026-08',110)],[])[0].real,null);
 assert.equal(deflateRetail([p('2026-08',110)],[p('2026-08',null)])[0].real,null);
 assert.equal(monthlyRate([p('2026-06',100),p('2026-08',110)]),null);
 assert.throws(()=>deflateRetail([p('2026-08',110)],[p('2026-08',0)]));
 assert.throws(()=>deflateRetail([p('2026-08',110)],[p('2026-08',100)],'SA','NSA'));
 assert.throws(()=>deflateRetail([p('2026-08',100),p('2026-08',110)],[]));
});
test('current published cut aligns monthly levels and retains missing historical observations',()=>{
 assert.equal(nominalRetail.at(-1).value,745021);
 assert.equal(consumerPrices.at(-1).value,336.298);
 assert.equal(realRetail.find(p=>p.period==='2025-10').real,null);
 assert.ok(Math.abs(monthlyRate(nominalRetail)-0.7708413925190838)<1e-10);
 assert.ok(Math.abs(monthlyRate(realRetail.map(v=>p(v.period,v.real)))-0.1215053474115102)<1e-10);
 assert.equal(realRetail.filter(p=>p.period>='2026-03'&&p.real!==null).length,7);
 assert.deepEqual(weeklyClaims.map(p=>p.initial),[199000,198000,200000,195000,194000]);
 assert.equal(weeklyClaims.at(-1).average,196750);
});
