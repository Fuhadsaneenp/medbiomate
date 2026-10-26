import assert from 'node:assert/strict';
const base='http://127.0.0.1:3000';
const paths=['/','/jobs','/jobs?page=2','/jobs?q=Nurse','/employers','/employers?page=2','/employers?sort=az','/category/nurse-jobs','/job-location/dubai','/job-type/full-time','/job/chiropractor-13','/employer/bella-roma-specialty-hospital','/resume-library','/services/resume-maker','/services/resume-maker?editor=new','/job-categories','/job-locations','/login','/register','/profile','/saved-jobs','/applied-jobs','/followed-companies','/about','/contact','/faq','/terms','/privacy-policy','/employer-terms','/blog','/disclaimer','/not-a-real-page-medbiomate'];
const results=await Promise.all(paths.map(async path=>{
 const response=await fetch(base+path);const html=await response.text();assert.equal(response.status,path.includes('not-a-real')?404:200,path);
 assert.equal((html.match(/<title>/g)||[]).length,1,path+' has one title');assert.equal((html.match(/rel="canonical"/g)||[]).length,1,path+' has one canonical');assert.equal((html.match(/name="description"/g)||[]).length,1,path+' has one description');
 assert.ok(html.includes('/source-runtime/bootstrap.js'),path+' uses original UI runtime');assert.ok(!html.includes('https://www.trikonet.com'),path+' wrong brand canonical');
 const blocks=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];assert.equal(blocks.length,1,path+' one structured data authority');JSON.parse(blocks[0][1]);
 if(path==='/jobs?page=2')assert.ok(html.includes('https://www.medbiomate.com/jobs?page=2'));
 if(path==='/jobs?q=Nurse'||path==='/login'||path.includes('editor=new'))assert.ok(html.includes('noindex,follow'));
 return {path,status:response.status};
}));
const [old,newPage]=await Promise.all([fetch(base+'/employers-list',{redirect:'manual'}),fetch(base+'/api/wp/employer-directory?per_page=30')]);assert.equal(old.status,301);assert.equal(old.headers.get('location'),'/employers');assert.equal((await newPage.json()).rows.length,30);
const links=await fetch(base+'/api/job-category-links').then(r=>r.json());assert.ok(links.length>100);assert.ok(links.every(l=>l.href.startsWith('/category/')));
const sitemap=await fetch(base+'/page-sitemap.xml').then(r=>r.text());assert.ok(sitemap.includes('/services/resume-maker'));assert.ok(!sitemap.includes('<loc>https://www.medbiomate.com/admin'));
console.log('PASS: '+results.length+' public/account routes, server SEO, JSON-LD, legacy redirects, 30-company pagination, category links and sitemap.');
