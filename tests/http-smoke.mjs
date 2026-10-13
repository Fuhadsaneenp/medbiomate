// Run only against the isolated local preview; fixture data is removed afterward.
import crypto from 'node:crypto';import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:3000',file=new URL('../backend/data/local-db.json',import.meta.url),id=crypto.randomUUID(),slug='migration-smoke-'+Date.now(),email=slug+'@example.test',password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex');let cookie;
const request=async(path,options={})=>{const res=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(cookie?{cookie}:{}),...options.headers}});return [res,await res.json()]};
try{
 const [,filteredCount]=await request('/api/wp/count?type=job_listing&location=Dubai');assert.ok(filteredCount.total>1000,'Filtered counts must include all pages');
 const [denied]=await request('/api/local/jobs/'+slug,{method:'DELETE'});assert.equal(denied.status,401);
 const db=JSON.parse(await readFile(file,'utf8'));db.users.push({id,name:'Migration fixture',email,role:'Administrator',status:'active',passwordSalt:salt,passwordHash:crypto.scryptSync(password,salt,64).toString('hex')});await writeFile(file,JSON.stringify(db),{mode:0o600});
 const [login]=await request('/api/admin/login',{method:'POST',body:JSON.stringify({identity:email,password})});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
 const [me]=await request('/api/admin/me');assert.equal(me.status,200);
 const [catalogue,list]=await request('/api/admin/jobs?per_page=5');assert.equal(catalogue.status,200);assert.ok(list.total>13000);assert.equal(list.jobs.length,5);
 const [created,job]=await request('/api/local/jobs',{method:'POST',body:JSON.stringify({title:'Migration fixture',slug,status:'publish',description:'Verification only',company:'Fixture Hospital',locations:['Dubai'],categories:['Nurse Jobs'],types:['Full Time'],applyUrl:'https://example.test/apply',applyType:'external'})});assert.equal(created.status,200,JSON.stringify(job));
 const [visible,rows]=await request('/api/wp/job_listing?slug='+job.slug);assert.equal(visible.status,200);assert.equal(rows[0].title.rendered,'Migration fixture');assert.equal(rows[0].metas._job_apply_url,'https://example.test/apply');
 const [removed]=await request('/api/local/jobs/'+job.slug,{method:'DELETE'});assert.equal(removed.status,200);
 const [logout]=await request('/api/admin/logout',{method:'POST'});assert.equal(logout.status,200);const [expired]=await request('/api/admin/me');assert.equal(expired.status,401);
 console.log('PASS: unauthenticated writes blocked, admin login/session/logout, 13k catalogue pagination, publish/public visibility/delete.');
}finally{const db=JSON.parse(await readFile(file,'utf8'));db.users=db.users.filter(u=>u.id!==id);db.jobs=db.jobs.filter(j=>!j.slug.startsWith(slug));await writeFile(file,JSON.stringify(db),{mode:0o600})}
