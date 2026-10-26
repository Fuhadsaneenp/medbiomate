import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
test('admin editor uses explicit named controls and job-specific edit routes',async()=>{
 const source=await readFile(new URL('../backend/public/admin.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/jobForm(?:\?\.)?\.title\b/);
 assert.ok(source.includes("jobForm.elements.namedItem('title').addEventListener"));
 assert.ok(source.includes('href="#job-editor/${encodeURIComponent(j.slug)}"'));
});
test('creation screens do not wait for catalogue and do not reset after background loading',async()=>{
 const source=await readFile(new URL('../backend/public/admin.js',import.meta.url),'utf8');
 assert.ok(source.includes('void loadData().then(async () => {'));
 assert.ok(source.includes("fetch('/api/admin/employer-options'"));
 assert.ok(!source.includes('page <= 100'));
 const tail=source.slice(source.indexOf('  // Initial routing and data loading'));
 assert.equal((tail.match(/handleRoute\(\)/g)||[]).length,1,'background completion must not reset a typed form');
});
