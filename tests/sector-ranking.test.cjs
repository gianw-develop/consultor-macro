/* eslint-disable @typescript-eslint/no-require-imports -- compiled contract tests */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rankSectorsByDailyChange:rank}=require('../.foundation-test-build/modules/annienexus/sector-ranking.js');
const session='2026-10-21';
const symbols=['XLK','XLF','XLY','XLP','XLC','XLU'];
const snapshot=()=>symbols.map((symbol,i)=>({symbol,session,price:100+i,previousClose:100}));

test('ranks daily percentage, not dollar price, and reorders on the next snapshot',()=>{
 const quotes=snapshot();
 quotes[0]={...quotes[0],price:500,previousClose:500};
 quotes[2]={...quotes[2],price:110,previousClose:100};
 const before=JSON.stringify(quotes);
 assert.equal(rank(quotes,session).rows[0].symbol,'XLY');
 assert.equal(JSON.stringify(quotes),before);
 const updated=quotes.map(q=>q.symbol==='XLK'?{...q,price:600}:q);
 assert.equal(rank(updated,session).rows[0].symbol,'XLK');
});
test('negative returns sort from smallest loss to largest loss',()=>{
 const result=rank(snapshot().map((q,i)=>({...q,price:99-i})),session);
 assert.equal(result.status,'complete');
 assert.deepEqual(result.rows.map(r=>r.symbol),symbols);
 assert.deepEqual(result.rows.map(r=>r.rank),[1,2,3,4,5,6]);
});
test('equal returns have shared ranks and deterministic alphabetical order',()=>{
 const result=rank(snapshot().map(q=>({...q,price:100})),session);
 assert.deepEqual(result.rows.map(r=>r.symbol),[...symbols].sort());
 assert.ok(result.rows.every(r=>r.rank===1&&r.changePercent===0));
});
test('missing and previous-session data are not zero returns or a complete ranking',()=>{
 const result=rank(snapshot().slice(1).map(q=>q.symbol==='XLY'?{...q,session:'2026-10-20'}:q),session);
 assert.equal(result.status,'partial');
 assert.deepEqual(result.rows.slice(-2).map(r=>r.symbol),['XLK','XLY']);
 assert.ok(result.rows.slice(-2).every(r=>r.changePercent===null));
 assert.ok(result.rows.every(r=>r.rank===null));
 assert.equal(rank([],session).status,'unavailable');
});
test('nonfinite, invalid prices and duplicate same-session quotes are unavailable',()=>{
 const quotes=snapshot();
 quotes[0].previousClose=0;quotes[1].price=NaN;quotes[2].price=Infinity;
 quotes[3].price=-1;quotes[4].previousClose=-1;quotes.push({...quotes[5]});
 const result=rank(quotes,session);
 assert.equal(result.status,'unavailable');
 assert.ok(result.rows.every(r=>r.changePercent===null&&r.rank===null));
});
test('rejects malformed and impossible session dates',()=>{
 for(const date of ['today','2026-02-30','2026-13-01'])assert.throws(()=>rank([],date));
});
