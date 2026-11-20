/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parseFredCsv,parseLiveCli,parseYahooCloses,monthlyRates,annualRates}=require('../.foundation-test-build/modules/annienexus/live-parse.js');
const read=f=>fs.readFileSync(`tests/fixtures/live/${f}`,'utf8');
test('FRED CSV parses dates and values and skips missing ones',()=>{
 const p=parseFredCsv(read('cpi.csv'));assert.ok(p.length>=9);assert.equal(p.at(-1).period,'2026-10-01');assert.equal(p.at(-1).value,337.476);
 assert.deepEqual(parseFredCsv('observation_date,X\n2026-01-01,.\n2026-02-01,1.5'),[{period:'2026-02-01',value:1.5}]);
 assert.deepEqual(parseFredCsv('<html>rate limited</html>'),[]);
});
test('monthly and annual rates come from the level index',()=>{
 const idx=[{period:'2025-10-01',value:100},{period:'2026-09-01',value:103},{period:'2026-10-01',value:103.515}];
 assert.deepEqual(monthlyRates(idx).at(-1),{period:'2026-10',value:0.5});
 assert.deepEqual(annualRates(idx),[{period:'2026-10',value:3.5}]);
});
test('OECD CLI keeps G7 and USA monthly points in range',()=>{
 const c=parseLiveCli(read('cli.csv'));assert.equal(c.G7.at(-1).period,'2026-10');assert.ok(c.G7.every(p=>p.value>80&&p.value<120));assert.ok(c.USA.length>=9);
 assert.deepEqual(parseLiveCli('garbage'),{G7:[],USA:[],G20:[]});
});
test('Yahoo closes parse and bad JSON returns nothing',()=>{
 const y=parseYahooCloses(read('yahoo.json'));assert.equal(y.length,5);assert.match(y[0].period,/^\d{4}-\d{2}-\d{2}$/);
 assert.deepEqual(parseYahooCloses('{bad'),[]);
});
test('a missing month is not turned into a two-month jump and annual rates bridge it',()=>{
 const idx=[['2025-09',100],['2025-11',101],['2026-09',103],['2026-10',103.5],['2026-11',104]].map(([p,v])=>({period:p+'-01',value:v}));
 const m=monthlyRates(idx);assert.ok(!m.some(p=>p.period==='2025-11'));
 const oct=annualRates(idx).find(p=>p.period==='2026-10');assert.equal(oct.value,Math.round((103.5/Math.sqrt(100*101)-1)*1000)/10);
});
