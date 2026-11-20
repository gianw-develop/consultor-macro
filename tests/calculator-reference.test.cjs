const test = require('node:test');
const assert = require('node:assert/strict');
const {approximatePrice, SIMPLE_REFERENCES, referenceFactor} = require('../.foundation-test-build/modules/annienexus/calculator-reference-data.js');

test('approximate route uses dated ETF prices and the observed FTMO midpoint',()=>{
 const examples=[['DIA','520',520*52478.10/524],['QQQ','721',721*29521.455/718.07],['GLD','370',370*4026.985/368.93]];
 for(const [symbol,raw,expected] of examples){
  assert.equal(approximatePrice(symbol,raw).value,Math.round(expected*100)/100);
  assert.equal(approximatePrice(symbol,raw).error,'');
 }
});
test('SPX nominal mapping does not turn overnight market movement into broker basis',()=>{
 assert.equal(referenceFactor('SPX'),1);
 assert.equal(approximatePrice('SPX','7700').value,7700);
 assert.notEqual(SIMPLE_REFERENCES.SPX.origin,(SIMPLE_REFERENCES.SPX.bid+SIMPLE_REFERENCES.SPX.ask)/2);
});
test('invalid prices and unrequested markets never produce a number',()=>{
 for(const raw of ['0','-1','abc','NaN','Infinity','7.700','1e6'])assert.equal(approximatePrice('QQQ',raw).value,null);
 for(const symbol of ['NDX','DJIA','GC',null])assert.equal(approximatePrice(symbol,'7700').value,null);
 assert.deepEqual(approximatePrice('QQQ',''),{value:null,error:''});
 assert.equal(approximatePrice('SPX','7700,25').value,7700.25);
});
test('dated observations retain their source timestamps and do not expire into a blocking calibration',()=>{
 assert.deepEqual(Object.keys(SIMPLE_REFERENCES),['SPX','DIA','GLD','QQQ']);
 for(const ref of Object.values(SIMPLE_REFERENCES)){
  assert.match(ref.observedAt,/^2026-10-29T/);
  assert.ok(ref.bid<=ref.ask);
  assert.match(ref.source,/^https:\/\/finance.yahoo.com\//);
 }
 assert.ok(approximatePrice('QQQ','721').value>0);
});
