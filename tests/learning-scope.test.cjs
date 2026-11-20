/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS contract tests */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,readdirSync}=require('node:fs');
const {createHash}=require('node:crypto');
const original=[...require('../src/modules/annienexus/library.json'),...require('../private/learning-sources/gregory-additions-2026-10-02.json')];
const published=require('../src/modules/annienexus/published-library.json');
const resources=require('../src/modules/annienexus/published-learning-resources.json');
const files=require('../src/modules/annienexus/published-learning-files.json');
const {visibleLearningNotes}=require('../.foundation-test-build/shared/learning-scope.js');
const {readNotebookBackup,mergeNotebookBackup}=require('../.foundation-test-build/shared/notebook-backup.js');
const hash=x=>createHash('sha256').update(x).digest('hex');
test('publication excludes mixed Master and other courses, retaining original IDs and hashes',()=>{
 const ids=published.map(d=>d.id);
 for(const id of ['source-2','source-7','source-8','source-9','source-10'])assert.ok(!ids.includes(id));
 for(const d of published){const source=original.find(o=>o.id===(d.id==='source-14'?'source-12':d.id));assert.ok(source);assert.equal(d.originalSha256,source.sha256);assert.equal(d.sha256,hash(d.body));assert.doesNotMatch(d.body,/hunab|junat|\bGEX\b/i);}
});
test('links cannot escape the publication selection; exact file bytes remain intact',()=>{
 for(const [id,links] of Object.entries(resources)){assert.ok(published.some(d=>d.id===id));for(const r of Object.values(links)){if(r.kind==='lesson')assert.ok(published.some(d=>d.id===r.id));else assert.ok(files.some(f=>r.url==='/api/learning/'+f.file));}}
 assert.deepEqual(readdirSync('private/learning-published').sort(),files.map(f=>f.file).sort());
 for(const f of files){assert.equal(hash(readFileSync('private/learning-published/'+f.file)),f.sha256);assert.equal(hash(readFileSync('private/learning/'+f.file)),f.sha256);}
});
test('personal notes are selected conservatively without deleting, rewriting or renumbering backups',()=>{
 const base={at:'2026-10-01T12:00:00Z',text:'Contrastar la curva',topic:published[0].title};
 const notes=[{...base,id:'gregory'},{...base,id:'other',topic:'Hunab · Mentoría 10'},{...base,id:'mixed',text:'Comparar con Hunab y GEX'},{...base,id:'unknown',topic:'MASTER MARKET MODEL v0.1'}];
 const backup=JSON.stringify({version:1,notes});
 const shown=visibleLearningNotes(notes);assert.deepEqual(shown.map(n=>n.id),['gregory']);assert.equal(shown[0],notes[0]);
 assert.equal(JSON.stringify({version:1,notes}),backup);assert.deepEqual(readNotebookBackup(backup),notes);
 assert.equal(mergeNotebookBackup(notes,readNotebookBackup(backup)).length,4);
});
test('M1/M2 use disjoint source ranges, while curve 5/6 remains a single stable ID',()=>{
 const audit=require('../docs/annienexus/gregory-publication-audit.json');
 assert.deepEqual(published.map(d=>d.id),['source-14','source-12','source-3','source-4','source-5','source-13','source-0','source-1']);
 for(const f of audit.fragments.filter(f=>f.id==='source-14'))assert.ok(f.end<399);
 for(const f of audit.fragments.filter(f=>f.id==='source-12'))assert.ok(f.start>=399);
 assert.match(published.find(d=>d.id==='source-14').body,/Reflexividad|reflexividad/);
 assert.match(published.find(d=>d.id==='source-12').body,/promedio móvil de cuatro semanas/);
 assert.match(published.find(d=>d.id==='source-5').title,/clase 6.*archivo rotulado 5/);
});
test('M9 remains open and only normalized received continuation is published',()=>{
 const m9=published.find(d=>d.id==='source-1');const continuation=require('../private/learning-sources/gregory-m9-continuation-normalized.json');
 assert.match(m9.status,/en curso/);assert.doesNotMatch(m9.body,/mentoría 9 (?:completada|terminada)|Cierre del bloque 4 y de la mentoría 9/);
 for(const section of continuation.sections){assert.ok(m9.body.includes(section.body));assert.ok(section.evidence.every(e=>e.ordinal>=15500&&e.ordinal<=15762&&e.sha256.length===64));}
 assert.match(m9.body,/El fragmento se interrumpe antes de desarrollar la respuesta/);
});
test('brain excerpts are exact selected teaching, not editorial chains or demo regimes',()=>{
 const channels=require('../src/modules/annienexus/brain-teaching.json');
 for(const channel of channels){const lesson=published.find(d=>d.id===channel.sourceId);for(const text of channel.excerpts)assert.ok(lesson.body.includes(text));}
 const brain=readFileSync('src/modules/annienexus/brain.tsx','utf8');assert.doesNotMatch(brain,/DEMO_STORIES|selected\.support|selected\.contra/);
 const quadrant=readFileSync('src/modules/annienexus/quadrant.tsx','utf8');assert.match(quadrant,/point=\{null\}/);assert.match(quadrant,/demo=\{false\}/);
 const clock=readFileSync('src/modules/annienexus/quadrant-clock.tsx','utf8');assert.doesNotMatch(clock,/CURRENT_ESTIMATE/);
});
test('editorial introductions, generated diagrams, mixed reports cannot enter the course selection',()=>{
 const learning=readFileSync('src/modules/annienexus/learning.tsx','utf8');assert.doesNotMatch(learning,/const basic:|Síntesis y contraste/);
 for(const d of published)assert.doesNotMatch(d.body,/Para ANNIE Nexus|Para Aninexus|Regla provisional para|Control de calidad para Aninexus|Uso correcto en Aninexus/);
 for(const name of ['29ad2bb63b0425e9.jpg','c1973eb7e5ec587e.jpg','cb04ba08441fcbf5.md'])assert.ok(!files.some(f=>f.file===name));
});
