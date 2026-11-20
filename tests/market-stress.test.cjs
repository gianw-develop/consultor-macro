/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {evaluateMarket,coherence,readIndex}=require('../.foundation-test-build/modules/annienexus/market-stress.js');
const days=(vals,start=1)=>vals.map((v,i)=>({period:`2026-09-${String(start+i).padStart(2,'0')}`,value:v}));
const flat=(n,v)=>Array.from({length:n},()=>v);
// S&P 500 real: máximo 7619 (11-11) y cierre 6910 (11-20); semana -8,6 %.
const spx=days([...flat(20,7400),7550,7521,7619,7592,7562,7417,7341,7324,7176,6910]);
test('the real week of 20 Nov reads as panic with growth fear',()=>{
 const m=evaluateMarket({spx,dji:spx,ndx:spx,vix:days([...flat(25,19),19.3,25.5,24.6,28.4,35.9]),ust10:days([...flat(25,5.15),5.10,5.07,5.04,5.0,4.91])});
 assert.equal(m.state,'panic');assert.equal(m.fear,'growth');assert.equal(m.indexes[0].fromHigh,-9.3);
 const c=coherence(true,m);assert.equal(c.agrees,false);assert.match(c.text,/frenazo del crecimiento/);
});
test('a calm market agrees with expansion',()=>{
 const up=days([...flat(25,7000),7010,7020,7030,7040,7050]);
 const m=evaluateMarket({spx:up,dji:up,ndx:up,vix:days(flat(30,15)),ust10:days(flat(30,4.5))});
 assert.equal(m.state,'normal');assert.equal(coherence(true,m).agrees,true);
});
test('a 5 % drawdown without fear is a correction; stocks down with rising yields means inflation fear',()=>{
 const s=days([...flat(25,7000),6900,6850,6800,6700,6640]);
 const m=evaluateMarket({spx:s,dji:s,ndx:s,vix:days(flat(30,20)),ust10:days([...flat(25,4.5),4.55,4.6,4.62,4.66,4.7])});
 assert.equal(m.state,'correction');assert.equal(m.fear,'inflation');
});
test('no index data means no reading',()=>{
 assert.equal(evaluateMarket({spx:[],dji:[],ndx:[],vix:[],ust10:[]}),null);assert.equal(readIndex('x','X',[]),null);
});
