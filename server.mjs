import {canonicalRoute,isJobDetail} from './route-parity.mjs';
import {sitePath,canonical,sitemapGroups,sitemapXml,sitemapIndex,xmlEscape} from './site-urls.mjs';
import {replaceElement} from './render-job.mjs';
import {renderJob,renderEmployer} from './render-job.mjs';
import http from 'node:http';
import {readFile,stat,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000), backendPort=Number(process.env.BACKEND_PORT||4173);
const backend=spawn(process.execPath,['backend/server.mjs'],{cwd:root,env:{...process.env,PORT:String(backendPort),HOST:'127.0.0.1',MEDBIOMATE_LOCAL_MODE:process.env.MEDBIOMATE_LOCAL_MODE||(process.env.NODE_ENV==='production'?'0':'1')},stdio:'inherit'});
backend.on('error',console.error);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.gif':'image/gif','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const route=canonicalRoute(url.pathname);if(['GET','HEAD'].includes(req.method)&&route!==url.pathname){const target=new URL(route,'http://localhost');for(const [key,value]of url.searchParams)target.searchParams.append(key,value);res.writeHead(301,{Location:target.pathname+target.search});res.end();return;}
 if(url.pathname==='/api/job-reports'&&req.method==='POST'){
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>6000){res.writeHead(413);res.end();return}}
  try{const input=JSON.parse(raw);if(!['broken_link','expired','incorrect','duplicate','suspicious','other'].includes(input.reason)||!/^[-a-zA-Z0-9_]+$/.test(input.jobSlug||''))throw Error('Choose a report reason.');const file=resolve(root,'data/job-reports.json');let rows=[];try{rows=JSON.parse(await readFile(file,'utf8'))}catch{}rows.push({jobSlug:input.jobSlug,jobTitle:String(input.jobTitle||'').slice(0,250),reason:input.reason,details:String(input.details||'').slice(0,1000),createdAt:new Date().toISOString()});await writeFile(file,JSON.stringify(rows),{mode:0o600});res.writeHead(201,{'Content-Type':'application/json'});res.end('{"saved":true}')}catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}))}return;
 }
 if(url.pathname==='/api/contact'&&req.method==='POST'){
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>20000){res.writeHead(413);res.end();return}}
  try{const data=JSON.parse(raw);if(!Object.values(data).some(v=>typeof v==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)))throw Error('A valid email is required');const file=resolve(root,'data/contact-messages.json');let rows=[];try{rows=JSON.parse(await readFile(file,'utf8'))}catch{}rows.push({createdAt:new Date().toISOString(),fields:data});await writeFile(file,JSON.stringify(rows),{mode:0o600});res.writeHead(201,{'Content-Type':'application/json'});res.end('{"saved":true}')}catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}))}return;
 }
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin')){
  const proxy=http.request({hostname:'127.0.0.1',port:backendPort,path:url.pathname.startsWith('/admin-assets/')?req.url.replace('/admin-assets/','/'):req.url,method:req.method,headers:{...req.headers,host:`127.0.0.1:${backendPort}`}},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res)});
  proxy.on('error',()=>{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Backend is starting. Please retry.'}))});req.pipe(proxy);return;
 }
 try{
  if(url.pathname==='/sitemap.xml'||url.pathname==='/sitemap_index.xml'||/^\/(post|page|job_listing|employer|job_listing_type|job_listing_category|job_listing_location|category)-sitemap\.xml$/.test(url.pathname)){
   const values=await Promise.all(['jobs','employers','pages','posts','taxonomies'].map(async k=>JSON.parse(await readFile(resolve(root,'backend/data',k+'.json'),'utf8'))));
   let local={};try{local=JSON.parse(await readFile(resolve(root,'backend/data/local-db.json'),'utf8'))}catch{}
   const {mergeCatalogue}=await import('./backend/catalogue.mjs');
   const original=JSON.parse(await readFile(resolve(root,'data/original-sitemap-audit.json'),'utf8'));
   const groups=sitemapGroups({jobs:mergeCatalogue(values[0],local.jobs||[],'job_listing'),employers:mergeCatalogue(values[1],local.employers||[],'employer'),pages:values[2],posts:values[3],tax:values[4],original});
   res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8'});
   res.end(url.pathname==='/sitemap_index.xml'?sitemapIndex(groups):sitemapXml(url.pathname==='/sitemap.xml'?[...new Set(Object.values(groups).flat())]:groups[url.pathname.slice(1,-12)]||[]));return;
  }
  if(url.pathname==='/robots.txt'){res.setHeader('Content-Type','text/plain');res.end('User-agent: *\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/\nSitemap: https://www.medbiomate.com/sitemap_index.xml\n');return;}
  if(url.pathname==='/api-content/pages'){res.setHeader('Content-Type','application/json');res.end(await readFile(resolve(root,'backend/data/pages.json')));return;}
  const routes=JSON.parse(await readFile(resolve(root,'data/routes.json'),'utf8'));
  if(url.pathname.startsWith('/employer/')){const slug=url.pathname.split('/').filter(Boolean).pop();const response=await fetch(`http://127.0.0.1:${backendPort}/api/wp/employer?slug=${encodeURIComponent(slug)}`);const employers=await response.json();if(employers[0]){const jobs=await fetch(`http://127.0.0.1:${backendPort}/api/wp/job_listing?employer_slug=${encodeURIComponent(slug)}&per_page=6`).then(r=>r.json());const template=await readFile(resolve(root,'public/employer-burjeel-hospital.html'),'utf8');res.setHeader('Content-Type','text/html; charset=utf-8');res.end(renderEmployer(template,employers[0],jobs));return;}}
  if(isJobDetail(url.pathname)){
   const response=await fetch(`http://127.0.0.1:${backendPort}/api/job-url?path=${encodeURIComponent(url.pathname)}`);
   if(response.ok){const resolved=await response.json();if(resolved.publicPath!==url.pathname){res.writeHead(301,{Location:resolved.publicPath+url.search});res.end();return}let template=await readFile(resolve(root,'public/job-insurance-coordinator-76.html'),'utf8');let html=renderJob(template,resolved.job);html=html.replace('</head>','<script id="job-url-data" type="application/json">'+JSON.stringify({slug:resolved.slug,publicPath:resolved.publicPath}).replaceAll('<','\\u003c')+'</script></head>');res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
   res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<h1>Job not found</h1><a href="/jobs">Browse jobs</a>');return;
  }
  const path=sitePath(url.pathname);
  let file=resolve(root,'public','.'+decodeURIComponent(url.pathname));
  if(file!==resolve(root,'public')&&!file.startsWith(resolve(root,'public')+'/')){res.writeHead(404);res.end('Page not found');return;}
  try{if(!(await stat(file)).isFile())throw Error();}catch{
   if(extname(url.pathname)){res.writeHead(404);res.end('Asset not found');return;}
   const mapped=routes[path==='/'?'/':path+'/']||(['/jobs','/jobs-list'].includes(path)?'jobs-list.html':['/employers','/employers-list'].includes(path)?'employers-list.html':/^\/(?:category|job-(?:location|type))\/[^/]+$/.test(path)?'jobs-list.html':path==='/category/hospital'?'blog.html':null);
   if(mapped){file=resolve(root,'public',mapped)}else{
    const pages=JSON.parse(await readFile(resolve(root,'backend/data/pages.json'),'utf8'));const posts=JSON.parse(await readFile(resolve(root,'backend/data/posts.json'),'utf8'));
    const record=[...pages,...posts].find(r=>sitePath(r.link)===path||(path.startsWith('/blog/')&&r.slug===path.split('/').pop()));
    const appPaths=['/dashboard','/candidate-dashboard','/my-bookmarks','/login','/register','/signup','/forgot-password','/login-register','/register-candidate','/register-employer','/profile','/my-account','/saved-jobs','/applied-jobs','/followed-companies','/following-employers','/my-applied','/shortlist-jobs','/job-categories','/job-locations','/submit-job','/nurse-jobs-in-uae','/resume-library','/resume-builder','/resume-maker','/ats-resume-builder','/cv-builder','/services/resume-maker','/services/resume-builder','/services/ats-resume-builder','/services/cv-builder'];
    let template=await readFile(resolve(root,'public/about.html'),'utf8');
    const marker='mb-server-page';template=template.replace('id="apus-main-content"','id="apus-main-content" class="'+marker+'"');
    const title=record?.title?.rendered||(appPaths.includes(path)?'Candidate Dashboard':'Page not found');
    template=replaceElement(template,marker,'<div class="mb-heading"><h1>'+title+'</h1></div><article class="mb-page mb-content">'+(record?.content?.rendered||(appPaths.includes(path)?'':'<p>This page could not be found.</p><a href="/jobs-list">Browse healthcare jobs</a>'))+'</article>');
    template=template.replace(/<title>.*?<\/title>/s,'<title>'+title+' | Medbiomate</title>').replace(/<link[^>]+rel=["']canonical["'][^>]*>/g,'<link rel="canonical" href="'+canonical(path)+'">');
    res.writeHead(record||appPaths.includes(path)?200:404,{'Content-Type':'text/html; charset=utf-8'});res.end(template);return;
   }
  }
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');let body=await readFile(file);if(extname(file)==='.html'){body=body.toString().replace(/<link[^>]+rel=["']canonical["'][^>]*>/g,'<link rel="canonical" href="'+canonical(path)+'">')}res.end(body);
 }catch{res.writeHead(404);res.end('Page not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Medbiomate web app: http://127.0.0.1:${port}\nAdmin: http://127.0.0.1:${port}/admin`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>{backend.kill(sig);server.close(()=>process.exit())});
