/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const c=require('../.foundation-test-build/modules/annienexus/calculator-data.js');
const NOW=Date.parse('2026-10-29T15:00:00Z');
const iso=n=>new Date(n).toISOString();
// SYNTHETIC fixtures: known mappings exercise the implementation, NOT actual FTMO quotes.
function fixture(symbol='QQQ'){
 const ins=c.instrument(symbol), index=ins.kind==='Índice';
 const center=symbol==='DIA'?520:symbol==='GLD'?375:725;
 const slope=symbol==='DIA'?100:symbol==='GLD'?10:40;
 const xs=index?[7690,7710,7700,7701]:[center-1,center+1,center-2,center+2,center,center+.001];
 const common={sessionStart:'2026-10-29T13:30:00Z',sessionEnd:'2026-10-29T20:00:00Z'};
 return {version:1,symbol,destination:ins.destination,venue:'FTMO',market:'cash',evidence:'manual',tickSize:0.01,specificationSource:'SYNTHETIC specification',specificationAt:iso(NOW),continuity:'Synthetic cash test series',pairs:xs.map((x,i)=>{
  const at=iso(NOW-(xs.length-1-i)*60000), y=index?x+3:slope*x+100;
  return {origin:{...common,at,source:'SYNTHETIC origin',...(index?{value:x}:{bid:x-.01,ask:x+.01})},cfd:{...common,at,source:'SYNTHETIC FTMO test',bid:y-1,ask:y+1}};
 })};
}
const level=(symbol='QQQ',price=symbol==='QQQ'?725:7700)=>({symbol,price,type:'Call Wall'});
const conv=(cal,price,now=NOW,side='mid')=>c.convertLevel(level(cal.symbol,price),cal,now,side);
function rejected(cal,pattern,price=cal.symbol==='QQQ'?725:7700,now=NOW){const r=conv(cal,price,now);assert.equal(r.value,null);if(pattern)assert.match(r.error,pattern);}
test('explicit ETF/index routes, no seeded stale prices',()=>{
 assert.deepEqual(c.CALCULATOR_INSTRUMENTS.map(i=>[i.symbol,i.destination,i.method]),[['SPX','US500.cash','basis'],['DIA','US30.cash','affine'],['GLD','XAUUSD','affine'],['QQQ','US100.cash','affine']]);
 assert.deepEqual(c.initialCalibration(),{});
 assert.equal(c.convertLevel(level(),undefined,NOW).value,null);
});
test('SPX index basis offset is validated',()=>{
 for(const symbol of ['SPX']){const r=conv(fixture(symbol),7700);assert.equal(r.value,7703);assert.equal(r.method,'Diferencia de base validada');assert.ok(r.low<r.value&&r.high>r.value);}
});
test('ETFs fit affine sensitivity AND intercept; ratio would incorrectly differ',()=>{
 for(const [symbol,target,expected] of [['QQQ',725,29100],['DIA',520,52100],['GLD',375,3850]]){const r=conv(fixture(symbol),target);assert.equal(r.value,expected,symbol);assert.equal(r.method,'Ajuste lineal local validado');assert.ok(r.estimatedError>=1.1);assert.equal(r.at,iso(NOW));assert.deepEqual(r.sources,['SYNTHETIC origin','SYNTHETIC FTMO test']);}
});
test('bid/ask destination choice and tick rounding',()=>{
 const f=fixture('SPX');f.tickSize=.25;
 assert.equal(conv(f,7700.13,NOW,'mid').value,7703.25);
 assert.equal(conv(f,7700.13,NOW,'bid').value,7702.25);
 assert.equal(conv(f,7700.13,NOW,'ask').value,7704.25);
 const r=conv(f,7700.13);assert.ok(r.estimatedError>=1.125);assert.equal(r.low/.25,Math.round(r.low/.25));assert.equal(r.high/.25,Math.round(r.high/.25));
});
test('old saved October 12 references cannot masquerade as calibration',()=>{
 assert.equal(c.convertLevel(level(),{origin:'746.04',reference:'30664.70',manual:false},NOW).value,null);
 const f=fixture();f.pairs.forEach(p=>{p.origin.at='2026-10-12T15:00:00Z';p.cfd.at=p.origin.at;});rejected(f,/antigua/);
});
test('freshness expires automatically with clock, even after a successful result',()=>{
 const f=fixture();assert.notEqual(conv(f,725).value,null);rejected(f,/vencida/,725,NOW+120001);
});
test('reject future quotes, timezone omission and >2 second synchronization lag',()=>{
 let f=fixture();f.pairs.at(-1).origin.at=iso(NOW+1);rejected(f,/futura/);
 f=fixture();f.pairs[0].origin.at='2026-10-29T14:55:00';rejected(f,/zona/);
 f=fixture();f.pairs.at(-1).origin.at=iso(NOW-2001);rejected(f,/desincronizadas/);
});
test('closed sessions, extended hours, weekend, distinct days and DST boundaries',()=>{
 let f=fixture();f.pairs[0].origin.sessionEnd=iso(NOW);rejected(f,/Sesión cerrada/);
 f=fixture();rejected(f,/sesión regular/,725,Date.parse('2026-10-29T21:00:00Z'));
 rejected(f,/sesión regular/,725,Date.parse('2026-10-31T15:00:00Z'));
 // DST in US ends Nov 1, so Nov 2 at 14:00 UTC is premarket.
 f.specificationAt='2026-10-29T14:00:00Z';rejected(f,/sesión regular/,725,Date.parse('2026-11-02T14:00:00Z'));
 f=fixture();f.pairs[0].origin.sessionStart=iso(NOW+1);rejected(f,/Sesión cerrada/);
});
test('spread and invalid crossed quote rejection',()=>{
 let f=fixture();f.pairs[0].origin.ask+=2;rejected(f,/Spread/);
 f=fixture();f.pairs[0].cfd.ask+=100;rejected(f,/Spread/);
 f=fixture();f.pairs[0].cfd.ask=f.pairs[0].cfd.bid-1;rejected(f,/ask/);
});
test('single-point ratio, repeated quotes, too little price variation and out-of-range levels are blocked',()=>{
 let f=fixture();f.pairs=f.pairs.slice(-1);rejected(f,/necesitan/);
 f=fixture();f.pairs[1]=structuredClone(f.pairs[0]);rejected(f,/duplicados/);
 f=fixture();f.pairs.forEach(p=>{p.origin.bid=724.99;p.origin.ask=725.01;});rejected(f,/estrecha/);
 f=fixture();rejected(f,/rango/,750);
});
test('held-out observations are really checked and not silently fitted',()=>{
 let f=fixture();f.pairs.at(-1).cfd.bid+=200;f.pairs.at(-1).cfd.ask+=200;rejected(f,/inestable/);
 f=fixture();f.pairs.at(-1).origin.bid=799.99;f.pairs.at(-1).origin.ask=800.01;rejected(f,/rango/);
});
test('index basis drift cannot be hidden by a zero-offset assumption',()=>{
 const f=fixture('SPX');f.pairs[0].cfd.bid+=50;f.pairs[0].cfd.ask+=50;rejected(f,/inestable/);
});
test('wrong broker, target, futures, malicious verification claims, missing specification rejected',()=>{
 for(const [key,value] of [['venue','OANDA'],['destination','NDX'],['market','futures'],['evidence','verified'],['tickSize',0],['tickSize',Infinity],['specificationSource',''],['continuity',''],['specificationAt','2026-09-01T15:00:00Z']]){const f=fixture();f[key]=value;rejected(f);}
});
test('indices use published values; ETF and CFD must supply bid/ask',()=>{
 let f=fixture('SPX');f.pairs[0].origin.bid=7690;rejected(f,/índice/);
 f=fixture();delete f.pairs[0].origin.ask;rejected(f,/bid/);
 f=fixture();f.pairs[0].cfd.value=30000;rejected(f,/bid/);
});
test('source continuity is checked',()=>{
 const f=fixture();f.pairs[0].cfd.source='Another server';rejected(f,/proveedores/);
});
test('manual decimals safe; ambiguous thousands rejected instead of 7700 becoming 7.7',()=>{
 for(const [input,n] of [['7700',7700],['7700,25',7700.25],['7700.25',7700.25],['0.001',.001],['725',725]])assert.equal(c.parseCalculatorPrice(input),n);
 for(const input of ['7.700','7,700','1.000,25','1,000.25','1e3','NaN','Infinity','0','-1',''])assert.equal(c.parseCalculatorPrice(input),null,input);
});
test('manual batch and agent JSON preserve labels; exposure numbers/unknown symbols rejected',()=>{
 const expected=[{symbol:'QQQ',price:725,type:'Call Wall'},{symbol:'GLD',price:375,type:'Soporte'}];
 assert.deepEqual(c.parseLevels('QQQ;725;Call Wall\nGLD;375;Soporte'),expected);
 assert.deepEqual(c.parseLevels(JSON.stringify({version:1,levels:expected})),expected);
 for(const raw of ['SPX;7.700;Call Wall','GC;375;Soporte','QQQ;725;Bad','',JSON.stringify({version:1,levels:[{...expected[0],gex:1e9}]}),JSON.stringify({version:1,levels:[{...expected[0],price:'725'}]})])assert.throws(()=>c.parseLevels(raw));
 assert.throws(()=>c.parseLevels(Array(201).fill('QQQ;725;Nivel').join('\n')));
});
test('imported JSON is untrusted; malformed shapes never crash conversion',()=>{
 for(const f of [null,{},[],{version:1,symbol:'QQQ',pairs:[]},fixture()]){
  if(f?.pairs?.length)f.pairs[0]=null;
  assert.equal(c.convertLevel(level(),f,NOW).value,null);
 }
 assert.throws(()=>c.readCalibration('{','QQQ'));
 assert.throws(()=>c.readCalibration(JSON.stringify(fixture('SPX')),'QQQ'));
 const imported=c.readCalibration(JSON.stringify(fixture()),'QQQ');assert.equal(conv(imported,725).value,29100);
 assert.equal(c.convertLevel(level(),JSON.parse(c.calibrationTemplate('QQQ')),NOW).value,null);
});
test('margin includes age/lag; excessive moving-market uncertainty blocks',()=>{
 const f=fixture(),fresh=conv(f,725),aged=conv(f,725,NOW+1000);
 assert.ok(aged.estimatedError>fresh.estimatedError);
 rejected(f,/excesivo/,725,NOW+60000);
});

test('CFD quotes must respect the supplied tick grid',()=>{
 const f=fixture('SPX');f.tickSize=.25;f.pairs[0].cfd.bid+=.1;rejected(f,/tick/);
});

test('only the four requested instruments can be entered or imported',()=>{
 assert.deepEqual(Object.keys(c.emptyTargets()),['SPX','DIA','GLD','QQQ']);
 for(const symbol of ['NDX','DJIA']){assert.equal(c.instrument(symbol),undefined);assert.throws(()=>c.parseLevels(`${symbol};7700;Nivel`));assert.equal(c.convertLevel({symbol,price:7700,type:'Nivel'},undefined,NOW).value,null);}
});

test('plain symbol and price imports do not require a category',()=>{
 assert.deepEqual(c.parseLevels('QQQ;725\nGLD;375'),[{symbol:'QQQ',price:725,type:'Nivel'},{symbol:'GLD',price:375,type:'Nivel'}]);
 for(const raw of ['QQQ','QQQ;725;Nivel;extra','QQQ;7.700'])assert.throws(()=>c.parseLevels(raw));
});
