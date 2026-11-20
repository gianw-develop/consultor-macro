/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CALENDAR_CHECKED_AT,ECONOMIC_EVENTS,PREVIOUS_WEEK_EVENTS,NEXT_WEEK_EVENTS,eventStatus,calendarSummary,madridEventTime}=require('../.foundation-test-build/modules/annienexus/economic-calendar.js');
const historical=require('./fixtures/calendar-2026-10-15.json');
const fixtureEvents=historical.events,fixturePrevious=historical.previous,fixtureCut=historical.checkedAt;
const byId=id=>fixtureEvents.find(e=>e.id===id);
test('time alone cannot publish a scheduled release',()=>{
 const e=byId('retail');assert.equal(eventStatus(e,'2026-10-15T12:29:59Z'),'Programado');
 for(const now of ['2026-10-15T12:30:00Z','2026-10-16T00:00:00Z','invalid'])assert.equal(eventStatus(e,now),'Resultado por verificar');
});
test('Madrid release times and weekly boundaries are explicit',()=>{
 const expected={cpi:'14/10, 14:30',ppi:'15/10, 14:30',retail:'15/10, 14:30',claims:'15/10, 14:30','import-prices':'16/10, 14:30','industrial-production':'16/10, 15:15'};
 for(const [id,time] of Object.entries(expected))assert.equal(madridEventTime(byId(id).scheduledAt),time);
 assert.equal(madridEventTime(PREVIOUS_WEEK_EVENTS.find(e=>e.id==='michigan-final').scheduledAt),'23/10, 16:00');
 assert.equal(madridEventTime('2026-11-06T13:30:00Z').replace(/^0/,''),'6/11, 14:30');
});
test('results require both publication and verification, including valid metadata',()=>{
 const event=byId('cpi');assert.equal(eventStatus(event,fixtureCut),'Publicado · verificado');
 assert.equal(eventStatus(event,'2026-10-14T12:29:59Z'),'Programado');assert.equal(eventStatus(event,'2026-10-14T12:30:00Z'),'Resultado por verificar');
 for(const result of [{...event.result,publishedAt:'invalid'},{...event.result,verifiedAt:'invalid'},{...event.result,verifiedAt:'2026-10-14T12:00:00Z'}])assert.equal(eventStatus({...event,result},fixtureCut),'Resultado por verificar');
});
test('three simultaneous releases become unverified together, without invented results',()=>{
 const before=calendarSummary(fixtureEvents,fixtureCut);assert.deepEqual([before.published,before.scheduled,before.unverified],[1,5,0]);assert.equal(before.next.scheduledAt,'2026-10-15T12:30:00Z');
 const after=calendarSummary(fixtureEvents,'2026-10-15T12:30:00Z');assert.deepEqual([after.published,after.scheduled,after.unverified],[1,2,3]);assert.equal(after.next.id,'import-prices');
 assert.deepEqual(calendarSummary([],fixtureCut),{published:0,scheduled:0,unverified:0,next:null});
});
test('previous week keeps revisions and all seven verified releases',()=>{
 assert.equal(calendarSummary(fixturePrevious,fixtureCut).published,7);
 assert.match(fixturePrevious.find(e=>e.id==='claims').result.details.join(' '),/199.000/);
 assert.match(fixturePrevious.find(e=>e.id==='consumer-credit').result.details.join(' '),/No es un aumento mensual/);
 for(const event of [...fixtureEvents,...fixturePrevious]){assert.ok(event.period&&event.source&&event.relevance&&event.url.startsWith('https://'));if(Date.parse(event.scheduledAt)>Date.parse(fixtureCut))assert.equal(event.result,undefined);}
 assert.equal(new Set(fixtureEvents.map(e=>e.id)).size,fixtureEvents.length);
});

test('current cut keeps future results empty and preserves Madrid DST times',()=>{
 assert.deepEqual([calendarSummary(ECONOMIC_EVENTS,CALENDAR_CHECKED_AT).published,calendarSummary(ECONOMIC_EVENTS,CALENDAR_CHECKED_AT).scheduled],[4,4]);
 for(const e of [...ECONOMIC_EVENTS,...NEXT_WEEK_EVENTS])if(Date.parse(e.scheduledAt)>Date.parse(CALENDAR_CHECKED_AT))assert.equal(e.result,undefined);
 assert.equal(madridEventTime(PREVIOUS_WEEK_EVENTS.find(e=>e.id==='fomc').scheduledAt),'28/10, 19:00');
 assert.equal(madridEventTime(PREVIOUS_WEEK_EVENTS.find(e=>e.id==='gdp').scheduledAt),'29/10, 13:30');
 assert.match(PREVIOUS_WEEK_EVENTS.find(e=>e.id==='claims'&&e.scheduledAt.startsWith('2026-10-15')).result.details.join(' '),/198.250/);
});

test('Michigan final retains the preliminary history and cannot be verified before the new cut',()=>{
 const final=PREVIOUS_WEEK_EVENTS.find(e=>e.id==='michigan-final');
 const preliminary=PREVIOUS_WEEK_EVENTS.find(e=>e.id==='michigan');
 assert.match(final.result.headline,/48,0/);assert.match(preliminary.result.headline,/46,3/);
 assert.match(final.result.details.join(' '),/4,7 %.*3,5 %/);
 assert.equal(eventStatus(final,'2026-10-23T14:01:00Z'),'Resultado por verificar');
 assert.equal(eventStatus(final,CALENDAR_CHECKED_AT),'Publicado · verificado');
 assert.equal(madridEventTime('2026-11-06T15:00:00Z').replace(/^0/,''),'6/11, 16:00');
});

test('October hold preserves September hike and does not publish releases merely because time passes',()=>{
 const {FED_TARGET,FED_DECISIONS}=require('../.foundation-test-build/modules/annienexus/sectors-data.js');
 assert.equal(FED_TARGET.decision,'2026-10-28');assert.equal(FED_TARGET.action,'Mantiene');
 assert.deepEqual(FED_DECISIONS.map(d=>[d.decision,d.action]),[['2026-07-29','Mantiene'],['2026-09-16','Sube 0,25 pp'],['2026-10-28','Mantiene']]);
 for(const id of ['gdp','pce','claims-next']){const e=PREVIOUS_WEEK_EVENTS.find(e=>e.id===id);assert.equal(eventStatus(e,CALENDAR_CHECKED_AT),'Publicado · verificado');assert.equal(eventStatus(e,'2026-10-29T13:00:00Z'),'Resultado por verificar');}
 const all=[...PREVIOUS_WEEK_EVENTS,...ECONOMIC_EVENTS,...NEXT_WEEK_EVENTS];
 assert.equal(new Set(all.map(e=>e.id+'-'+e.scheduledAt)).size,all.length);
});
