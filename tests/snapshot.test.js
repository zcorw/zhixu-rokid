import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeHubSnapshot, createSnapshotSource} from '../aiui/lib/snapshot.js';
import {buildReport, createController} from '../aiui/lib/report.js';
const receivedAt = '2026-11-13T02:15:00Z';
const fixture = () => ({entities: [
  {kind:'project', id:'p', name:'Synthetic project', repository:'not forwarded'},
  {kind:'task', id:'t', projectId:'p', title:'Run', status:'in_progress', updatedAt:receivedAt},
  {kind:'feature', id:'f', projectId:'p', title:'Blocked', status:'blocked', description:'Synthetic blocker'},
  {kind:'issue', id:'i', projectId:'unknown', status:'blocked'},
  {kind:'release', id:'r', privateNote:'not forwarded'}
], history:[{privateNote:'not forwarded'}], requests:[{privateNote:'not forwarded'}], actions:[]});
test('normalizes the actual flat Hub snapshot shape and composes with report',()=>{
  const result=normalizeHubSnapshot(fixture(), {receivedAt}); const report=buildReport(result);
  assert.equal(report.running,1); assert.equal(report.blocked,1); assert.equal(report.rows[0].reason,'Synthetic blocker');
  assert.equal(result.updatedAt,'2026-11-13T02:15:00.000Z'); assert.equal(JSON.stringify(result).includes('not forwarded'),false);
});
test('rejects partial, oversized, malformed and duplicate snapshots instead of showing empty success',()=>{
  for(const input of [{}, {entities:null}, {...fixture(),partial:true}, {...fixture(),nextOffset:0}, {entities:[null]}, {entities:[{kind:'task',id:'t'}]}]) assert.throws(()=>normalizeHubSnapshot(input));
  assert.throws(()=>normalizeHubSnapshot(fixture(),{maxEntities:1}));
  const value=fixture(); value.entities.push(value.entities[1]); assert.throws(()=>normalizeHubSnapshot(value));
});
test('empty complete snapshot works; unknown kinds and prototype keys cannot select collections',()=>{
  assert.equal(buildReport(normalizeHubSnapshot({entities:[]})).rows.length,0);
  assert.equal(normalizeHubSnapshot({entities:[{kind:'__proto__'}, {kind:'constructor'}]}).tasks.length,0);
});
test('reader failures are not converted to empty reports and separate calls read fresh',async()=>{
  assert.throws(()=>createSnapshotSource({})); let calls=0;
  const source=createSnapshotSource({readAuthorizedSnapshot:async()=>{calls++;return fixture();}, now:()=>receivedAt});
  await source();await source();assert.equal(calls,2);
  await assert.rejects(createSnapshotSource({readAuthorizedSnapshot:async()=>{throw Error('denied');}})());
});
test('authorized reader adapter works with visible controller and retains stale report on malformed update',async()=>{
  let data=fixture(); const states=[];
  const source=createSnapshotSource({readAuthorizedSnapshot:async()=>data,now:()=>receivedAt});
  const c=createController({source,publish:s=>states.push(s),schedule:()=>1,cancel:()=>{}});
  c.attach();await c.refresh();assert.equal(states.at(-1).report.running,1);
  data={entities:null};await c.refresh();assert.equal(states.at(-1).stale,true);assert.equal(states.at(-1).report.running,1);c.detach();
});
