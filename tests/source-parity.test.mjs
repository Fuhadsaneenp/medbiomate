import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {pageSeo} from '../source-site.mjs';
const file=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('public source runtime includes full page families, original resume integration and ad positions',async()=>{
 const app=await file('public/source-runtime/app.js');for(const name of ['homeHero','homeCategories','homeTopCompanies','homeHowItWorks','categoryPage','employers','accountPage','memberWorkspacePage','renderEmployerDetail','renderJobDetail','initCVBuilder'])assert.ok(app.includes(name),name);
 const ads=await file('public/source-runtime/display-ads.js');for(const name of ['initBlogAds','initJobListingAds','initJobDetailAd','initAdditionalFeedAd','initOtherJobsAd','initJobBottomAd','initEmployerJobsAds'])assert.ok(ads.includes(name),name);
 assert.ok(ads.includes('[4, 9].entries()'));assert.ok(!ads.includes('  initAdditionalFeedAd();'));assert.ok(!ads.includes('  initOtherJobsAd();'));assert.ok(ads.includes('ca-pub-4613840941360196'));assert.ok(!ads.includes('4310822705633659'));
 const shell=await file('public/source-runtime/shell.html');assert.ok(shell.includes('/source-runtime/bootstrap.js'));assert.ok(shell.includes('/source-runtime/medbiomate-brand.css'));
 assert.ok(!app.includes('slug:\'job-loss-insurance-uae-iloe-guide\''));
});
test('local source imports resolve without missing module files',async()=>{
 for(const name of await readdir(new URL('../public/source-runtime/',import.meta.url))){if(!name.endsWith('.js'))continue;const source=await file('public/source-runtime/'+name);for(const match of source.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\/([^'"?]+)(?:\?[^'"]*)?['"]/g))await file('public/source-runtime/'+match[1]);}
});
test('SEO keeps pagination canonical and excludes account, search and editor pages',()=>{
 const seo=query=>pageSeo({path:'/jobs',query:new URLSearchParams(query),title:'Healthcare Jobs',description:'Real vacancies'});
 assert.equal(seo('page=2').canonical,'https://www.medbiomate.com/jobs?page=2');assert.equal(seo('page=2').noindex,false);assert.equal(seo('q=Nurse').noindex,true);
 for(const path of ['/login','/register','/profile','/saved-jobs'])assert.equal(pageSeo({path,title:'Account',description:''}).noindex,true);
 assert.equal(pageSeo({path:'/services/resume-maker',query:new URLSearchParams('editor=new'),title:'Resume',description:''}).noindex,true);
 assert.equal(pageSeo({path:'/resume-builder',title:'Resume',description:''}).canonical,'https://www.medbiomate.com/services/resume-maker');
});
test('job schema never invents location fields for incomplete imported records',()=>{
 const record={title:{rendered:'Nurse'},date:'2026-10-26',content:{rendered:'<p>Responsibilities</p>'},metas:{_job_employer_name:'Test Hospital'}};
 const seo=record=>pageSeo({path:'/job/nurse',title:'Nurse',description:'Test',record,type:'job'}).head;
 assert.ok(!seo(record).includes('"@type":"JobPosting"'));
 const imported={...record,metas:{...record.metas,_job_location:{0:'Saudi Arabia',1:'Riyadh'}}};assert.ok(seo(imported).includes('\"addressCountry\":\"SA\"'));assert.ok(!seo(imported).includes('\"addressCountry\":\"AE\"'));
 const complete={...record,addressCountry:'SA',addressLocality:'Riyadh'};assert.ok(seo(complete).includes('"addressCountry":"SA"'));assert.ok(seo(complete).includes('"@type":"JobPosting"'));
});
