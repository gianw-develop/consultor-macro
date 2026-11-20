/* eslint-disable @typescript-eslint/no-require-imports -- tests execute the CommonJS contract build */
const {test}=require('node:test'); const assert=require('node:assert/strict');
const {readNotebookBackup,mergeNotebookBackup}=require('../.foundation-test-build/shared/notebook-backup.js');
const note={id:'one',text:'Dato por contrastar',topic:'NFP',at:'2026-09-30T12:00:00Z'};
test('backup round trip and idempotent merge preserve notes',()=>{const parsed=readNotebookBackup(JSON.stringify({version:1,notes:[note]}));assert.deepEqual(parsed,[note]);assert.deepEqual(mergeNotebookBackup([note],parsed),[note]);});
test('invalid content cannot replace existing notes',()=>{for(const notes of [[{...note,text:5}],[{...note,at:'invalid'}],[note,note],[{...note,text:'a'.repeat(5001)}]])assert.throws(()=>readNotebookBackup(JSON.stringify({version:1,notes})));});
test('conflicting IDs are rejected without discarding either version',()=>assert.throws(()=>mergeNotebookBackup([note],[{...note,text:'Another version'}])));
test('merged capacity rejects the whole import',()=>assert.throws(()=>mergeNotebookBackup(Array.from({length:50},(_,i)=>({...note,id:String(i)})),[note])));
