import test from 'node:test';import assert from 'node:assert/strict';
import {renderJobDirectory} from '../public/trikonet-listing.js';
test('source job-directory template renders real records and canonical job links',async()=>{
 const nodes=new Map(),make=()=>({value:'',textContent:'',innerHTML:'',classList:{toggle(){}},setAttribute(){},getAttribute(){return'false'},querySelector(){return make()}});
 const root={innerHTML:'',querySelector(selector){if(!nodes.has(selector))nodes.set(selector,make());return nodes.get(selector)},querySelectorAll(){return[]}};
 globalThis.document={head:{append(){}},querySelector:s=>s==='#apus-main-content'?root:null,createElement:()=>{const n=make();Object.defineProperty(n,'textContent',{get(){return n.innerHTML.replace(/<[^>]+>/g,'')}});return n}};
 globalThis.location={pathname:'/jobs',search:''};
 const job={id:123,slug:'nurse-dubai',publicPath:'/jobs/nurse-dubai',title:{rendered:'Registered Nurse'},content:{rendered:'<p>Work in the nursing team.</p>'},metas:{_job_employer_name:'Test Hospital',_job_location:{0:'Dubai'},_job_category:{0:'Nurse Jobs'},_job_type:{0:'Full Time'},_job_employer_url:'/employer/test-hospital'}};
 const tax={categories:[{name:'Nurse Jobs',slug:'nurse-jobs',count:1}],locations:[{name:'Dubai',slug:'dubai',count:1}],types:[{name:'Full Time',slug:'full-time',count:1}]};
 await renderJobDirectory(tax,async path=>path.startsWith('wp/job_listing')?[job]:path.startsWith('wp/count')?{total:1}:[]);
 assert.ok(root.innerHTML.includes('nurse-results-layout'));assert.ok(root.innerHTML.includes('Registered Nurse'));assert.ok(root.innerHTML.includes('href="/jobs/nurse-dubai"'));assert.ok(!root.innerHTML.includes('Subscribed to job alerts!'));
 delete globalThis.document;delete globalThis.location;
});
