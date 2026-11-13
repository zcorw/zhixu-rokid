import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const app=JSON.parse(readFileSync('aiui/app.json'));assert.deepEqual(app.permissions,[]);
for(const w of app.widgets){const ink=readFileSync(`aiui/${w.path}.ink`,'utf8');assert.ok(ink.includes('<widget>'));assert.ok(!ink.includes('wx:')); const def=JSON.parse(ink.match(/<script def>([\s\S]*?)<\/script>/)[1]);assert.equal(def.widget.family,w.family);assert.equal(w.placement,'persistent');}
for(const p of app.pages)assert.ok(existsSync(`aiui/${p}.ink`));
console.log('Manifest and entry consistency passed (not an AIUI compiler/device test).');
