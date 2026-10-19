import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
test('admin editor uses explicit named controls and job-specific edit routes',async()=>{
 const source=await readFile(new URL('../backend/public/admin.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/jobForm(?:\?\.)?\.title\b/);
 assert.ok(source.includes("jobForm.elements.namedItem('title').addEventListener"));
 assert.ok(source.includes('href="#job-editor/${encodeURIComponent(j.slug)}"'));
});
