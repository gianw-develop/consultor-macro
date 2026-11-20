/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {agendaEvents,upcomingEvents,overdueEvents,agendaHorizon,daysBetween,evaluateFreshness}=require('../.foundation-test-build/modules/annienexus/freshness.js');
const {evaluateRegimeClock}=require('../.foundation-test-build/modules/annienexus/regime-clock.js');
test('a past release is never listed as upcoming',()=>{
 const now='2026-11-20T12:00:00Z';
 for(const e of upcomingEvents(now))assert.ok(Date.parse(e.scheduledAt)>Date.parse(now));
 const overdue=overdueEvents(now);
 assert.ok(overdue.some(e=>e.id==='cpi'),'CPI of 10/11 without result is overdue');
 assert.ok(overdue.every(e=>!e.result));
});
test('before a release it is upcoming, not overdue',()=>{
 const now='2026-11-09T12:00:00Z';
 assert.ok(upcomingEvents(now).some(e=>e.id==='cpi'));
 assert.ok(!overdueEvents(now).some(e=>e.id==='cpi'));
});
test('agenda is sorted and its horizon is the last event',()=>{
 const all=agendaEvents();
 for(let i=1;i<all.length;i++)assert.ok(Date.parse(all[i].scheduledAt)>=Date.parse(all[i-1].scheduledAt));
 assert.equal(agendaHorizon(),all.at(-1).scheduledAt);
});
test('invalid clock yields no events and null ages',()=>{
 assert.deepEqual(upcomingEvents('invalid'),[]);assert.deepEqual(overdueEvents('invalid'),[]);
 assert.equal(daysBetween('2026-11-04T00:00:00Z','x'),null);
 assert.equal(daysBetween('2026-11-04T00:00:00Z','2026-11-20T00:00:00Z'),16);
});
test('freshness flags new releases and an expired regime review',()=>{
 const now='2026-11-20T12:00:00Z',clock=evaluateRegimeClock(null,now);
 const f=evaluateFreshness(now,'2026-11-04T15:52:00Z',clock,{gdp:'',cpi:'',fed:'',claims:'',payrolls:''});
 const by=id=>f.items.find(i=>i.id===id);
 assert.equal(by('cpi').state,'pending');
 assert.equal(by('claims').state,'pending');
 assert.equal(by('gdp').state,'current');
 assert.equal(by('fed').state,'current');
 assert.equal(by('regime').state,'expired');
 assert.equal(f.state,'expired');
 assert.equal(f.cutAgeDays,15);
});
test('right after the cut, data with no due release stays current',()=>{
 const now='2026-11-04T16:00:00Z',clock=evaluateRegimeClock(null,now);
 const f=evaluateFreshness(now,'2026-11-04T15:52:00Z',clock,{gdp:'',cpi:'',fed:'',claims:'',payrolls:''});
 assert.equal(f.items.find(i=>i.id==='gdp').state,'current');
 assert.equal(f.items.find(i=>i.id==='cpi').state,'current');
});
