import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/wishes.js';
const url = 'https://wedding.example/api/wishes';
function database() {
  const calls = [];
  return { calls, prepare(sql) { calls.push(sql); return { all: async () => ({ results: [{ name: 'Guest', message: 'Best wishes!' }] }), bind(...args) { calls.push(args); return { run: async () => ({ success: true }) }; } }; } };
}
function post(body, method = 'POST', origin = 'https://wedding.example') { return new Request(url, { method, headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) }); }
test('public reads select approved records only and are bounded', async () => { const DB=database(); const r=await onRequest({request:new Request(url),env:{DB}}); assert.equal(r.status,200); assert.match(DB.calls[0],/WHERE approved = 1/); assert.match(DB.calls[0],/LIMIT 100/); });
test('submission ignores client approval, inserts trimmed data with bound parameters', async () => { const DB=database(); const r=await onRequest({request:post({name:' Guest ',message:' Love you! ',approved:1}),env:{DB}}); assert.equal(r.status,201); assert.equal(DB.calls[0],'INSERT INTO wishes (id, name, message) VALUES (?, ?, ?)'); assert.deepEqual(DB.calls[1].slice(1),['Guest','Love you!']); });
test('guests cannot edit or delete', async () => { for(const method of ['DELETE','PUT','PATCH']) { const DB=database(); assert.equal((await onRequest({request:post({},method),env:{DB}})).status,405); assert.equal(DB.calls.length,0); } });
test('invalid, oversized, bot and cross-origin requests do not write', async () => { for(const body of [null,{}, {name:' ',message:'abc'},{name:'a',message:'hi'},{name:'a',message:'a'.repeat(1001)},{name:'a',message:'hello',website:'spam'}]) { const DB=database(); assert.equal((await onRequest({request:post(body),env:{DB}})).status,400); assert.equal(DB.calls.length,0); } const DB=database(); assert.equal((await onRequest({request:post({name:'a',message:'hi!'},'POST','https://other.example'),env:{DB}})).status,403); assert.equal((await onRequest({request:post({message:'a'.repeat(17000)}),env:{DB}})).status,413); });
test('missing or failing DB does not claim success or expose details', async () => { assert.equal((await onRequest({request:new Request(url),env:{}})).status,503); const r=await onRequest({request:new Request(url),env:{DB:{prepare(){throw Error('private');}}}}); assert.equal(r.status,503); assert.doesNotMatch(await r.text(),/private/); });
