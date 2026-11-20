/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {evaluateRegimeClock:evaluate,clockEvidenceKey}=require('../.foundation-test-build/modules/annienexus/regime-clock.js');
const {makeReadingInput}=require('../.foundation-test-build/modules/annienexus/reading-data.js');
const {evaluateEconomicReading}=require('../.foundation-test-build/modules/annienexus/economic-reading.js');
const review=require('../src/modules/annienexus/regime-clock-review.json');
const input=()=>makeReadingInput(JSON.parse(fs.readFileSync('data/macro/latest.json')));
const now='2026-10-21T12:00:00Z';
test('dated review shows a provisional pointer while broad activity remains unconfirmed',()=>{
 const i=input();const testNow=i.cut;const testReview={...review,cut:testNow,reviewedAt:testNow,reviewBy:new Date(Date.parse(testNow)+3600000).toISOString(),evidenceKey:clockEvidenceKey(i)};const r=evaluate(i,testNow,testReview);assert.equal(r.status,'provisional');assert.equal(r.angle,45);assert.equal(r.zone,'growth_prices_up');assert.match(r.explanation,/Mercado mixto/);assert.equal(evaluateEconomicReading(i,testNow).body.tone,'neutral');
});
test('same-cut revisions preserve only the last dated orientation, never automatically reclassify',()=>{
 const i=input();i.cli.points.at(-1).value=90;const r=evaluate(i,now);assert.equal(r.status,'historical');assert.equal(r.angle,45);assert.match(r.explanation,/no representa una lectura actual/);
});
test('expired or missing input cannot claim a current orientation',()=>{
 for(const r of [evaluate(input(),input().cut),evaluate(input(),review.reviewBy),evaluate(null,now)]){assert.equal(r.status,'historical');assert.equal(r.review.cut,review.cut);assert.equal(r.angle,45);}
});
test('future or incomplete review hides the hand instead of inventing a default sector',()=>{
 for(const r of [null,{...review,reviewedAt:'2027-01-01'}, {...review,evidence:[]},{...review,inflation:''},{...review,zone:'transition'}, {...review,evidence:[{...review.evidence[0],checkedAt:'2027-01-01'}]}]){const result=evaluate(input(),now,r);assert.equal(result.status,'unavailable');assert.equal(result.angle,null);}
 assert.equal(evaluate(input(),'2026-10-20T22:00:00Z').angle,null);
});
test('hand stays fixed as time passes within a review and review is explicit for each sector',()=>{
 assert.equal(evaluate(input(),'2026-10-21T13:00:00Z').angle,45);
 for(const [zone,angle] of Object.entries({growth_prices_up:45,growth_down_prices_up:-45,growth_prices_easing:-135,growth_up_prices_easing:135})){assert.equal(evaluate(input(),now,{...review,zone}).angle,angle);}
});
