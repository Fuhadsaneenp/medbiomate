import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const ORIGIN='https://www.medbiomate.com';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=v=>typeof v==='object'?v?.rendered||'':v||'';
const plain=v=>text(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const json=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const values=v=>Array.isArray(v)?v:Object.values(v||{});
const resume=/^\/(?:resume-library|resume-builder|resume-maker|ats-resume-builder|cv-builder|services\/(?:resume-maker|resume-builder|ats-resume-builder|cv-builder))$/;
const privatePath=/^\/(?:admin[^/]*|login|register|profile|dashboard|saved-jobs|applied-jobs|followed-companies|forgot-password|email-campaigns|submit-job)(?:\/|$)/;
export function jobLocations(record){
 const m=record.metas||{},explicitCountry=record.addressCountry||m._job_address_country||m.addressCountry;
 const city=record.addressLocality||m._job_address_locality||m.addressLocality,region=record.addressRegion||m._job_address_region||m.addressRegion;
 if(explicitCountry)return [{'@type':'Place',address:{'@type':'PostalAddress',addressCountry:explicitCountry,addressLocality:city||undefined,addressRegion:region||undefined,streetAddress:record.streetAddress||m._job_street_address||undefined}}];
 const countries={'united arab emirates':'AE',uae:'AE','saudi arabia':'SA',qatar:'QA',bahrain:'BH',oman:'OM',kuwait:'KW',egypt:'EG'};
 const cities={dubai:'AE','abu dhabi':'AE',sharjah:'AE',ajman:'AE','al ain':'AE',fujairah:'AE','ras al khaimah':'AE','umm al quwain':'AE',riyadh:'SA',jeddah:'SA',dammam:'SA',makkah:'SA',tabuk:'SA',doha:'QA',cairo:'EG'};
 const locations=values(m._job_location||record.locations).map(v=>String(v).trim());
 const places=locations.flatMap(name=>{const key=name.toLowerCase(),country=countries[key]||cities[key];return country?[{'@type':'Place',address:{'@type':'PostalAddress',addressCountry:country,...(cities[key]?{addressLocality:name}:{})}}]:[]});
 return places.filter(place=>place.address.addressLocality||!places.some(other=>other.address.addressCountry===place.address.addressCountry&&other.address.addressLocality));
}
export function pageSeo({path,query=new URLSearchParams(),title,description,record,type}){
 const page=Math.max(1,Number(query.get('page'))||1);
 const filtered=['q','category','location','job_type','category_slug','location_slug','min_jobs','sort','per_page','preview','draft','editor','resume'].some(k=>query.has(k));
 const canonicalPath=resume.test(path)&&path!=='/resume-library'?'/services/resume-maker':path;
 const canonical=ORIGIN+canonicalPath+(page>1&&!filtered?'?page='+page:'');
 const noindex=privatePath.test(path)||filtered||type==='404';
 const label=title+' | Medbiomate';
 const schemas=[{'@context':'https://schema.org','@type':'Organization',name:'Medbiomate',url:ORIGIN,logo:ORIGIN+'/source-runtime/assets/logo-black.png'}];
 if(path==='/')schemas.push({'@context':'https://schema.org','@type':'WebSite',name:'Medbiomate',url:ORIGIN,potentialAction:{'@type':'SearchAction',target:ORIGIN+'/jobs?q={search_term_string}','query-input':'required name=search_term_string'}});
 if(record&&type==='job'){
  const m=record.metas||{},locations=jobLocations(record);
  // Only emit a JobPosting when the database supplies Google's required fields.
  const posted=record.datePosted||record.date,company=m._job_employer_name||record.company;
  if(posted&&Number.isFinite(Date.parse(posted))&&company&&locations.length&&!record.filled&&plain(record.content||record.description)&&!(Date.parse(m._job_expiry_date||record.expiryDate||record.deadline||'')<Date.now()))schemas.push({'@context':'https://schema.org','@type':'JobPosting',title:text(record.title),description:text(record.content)||record.description,datePosted:posted,validThrough:m._job_expiry_date||record.expiryDate||record.deadline||undefined,employmentType:record.employmentType||undefined,hiringOrganization:{'@type':'Organization',name:company},jobLocation:locations.length===1?locations[0]:locations,url:canonical});
 }
 if(record&&type==='employer')schemas.push({'@context':'https://schema.org','@type':'Organization',name:text(record.title),url:canonical,description:plain(record.content).slice(0,300),logo:record.metas?._employer_logo||undefined});
 if(path!=='/')schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:ORIGIN},{'@type':'ListItem',position:2,name:title,item:canonical}]});
 return {canonical,noindex,head:`<title>${esc(label)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${noindex?'noindex,follow':'index,follow'}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="${type==='post'?'article':'website'}"><meta property="og:site_name" content="Medbiomate"><meta property="og:title" content="${esc(label)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${ORIGIN}/source-runtime/assets/logo-black.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(label)}"><meta name="twitter:description" content="${esc(description)}"><script type="application/ld+json">${json(schemas)}</script>`};
}
export async function sourcePage(root,url,backendPort){
 const path=url.pathname;if(/\.[a-z0-9]+$/i.test(path)||path.startsWith('/api')||path.startsWith('/admin'))return null;
 const api=async p=>{const r=await fetch(`http://127.0.0.1:${backendPort}/api/${p}`);return r.ok?r.json():null};
 let title,description,record,type='page',status=200,embedded='',body='';
 const known={'/':['Healthcare Jobs Across the UAE & GCC','Find healthcare jobs, explore hiring employers and create your resume with Medbiomate. Search opportunities across the UAE and GCC.'],'/jobs':['Healthcare Jobs in the UAE & GCC','Browse current healthcare vacancies by specialty, employer and location. Find nursing, medical and allied health opportunities on Medbiomate.'],'/employers':['Healthcare Employers & Companies','Explore healthcare companies and their open jobs across the UAE and GCC. Compare employers and find your next career opportunity on Medbiomate.'],'/job-categories':['Browse Healthcare Job Categories','Explore healthcare jobs by specialty, from nursing and pharmacy to medical coding and allied health.'],'/about':['About Medbiomate','Learn about Medbiomate and our mission to connect healthcare professionals with employers across the GCC.'],'/contact':['Contact Medbiomate','Contact Medbiomate for support with healthcare jobs, employer listings and your account.'],'/faq':['Frequently Asked Questions','Answers to common questions about jobs, applications and accounts on Medbiomate.'],'/blog':['Career Articles & Insights','Healthcare career advice and insights from Medbiomate.'],'/terms':['Terms of Service','Read the terms governing your use of Medbiomate.'],'/privacy-policy':['Privacy Policy','Learn how Medbiomate handles personal information and account data.'],'/employer-terms':['Employer Terms','Read the terms for employers publishing opportunities on Medbiomate.'],'/login':['Sign In','Sign in to your Medbiomate account.'],'/register':['Create an Account','Create your Medbiomate account to manage your healthcare career.'],'/profile':['Your Profile','Manage your Medbiomate profile.'],'/dashboard':['Your Account','Manage your Medbiomate account.'],'/saved-jobs':['Saved Jobs','Manage your saved healthcare opportunities.'],'/applied-jobs':['Applied Jobs','Review your healthcare job applications.'],'/followed-companies':['Followed Companies','Manage employers you follow on Medbiomate.'],'/submit-job':['Post a Job','Publish healthcare opportunities with Medbiomate.'],'/forgot-password':['Reset Your Password','Recover access to your Medbiomate account.'],'/nurse-jobs-in-uae':['Nurse Jobs in UAE','Find nursing jobs and employers hiring nurses across the UAE.']};
 if(/^\/(?:job|jobs)\/[^/]+$/.test(path)){
  const result=await api('job-url?path='+encodeURIComponent(path));
  if(result){if(result.publicPath!==path)return {redirect:result.publicPath+url.search};record=result.job;type='job';title=text(record.title);description=`${title} at ${record.metas?._job_employer_name||record.company||'a healthcare employer'} in ${values(record.metas?._job_location||record.locations).join(', ')}. View job details and application information on Medbiomate.`;embedded+=`<script id="job-url-data" type="application/json">${json({slug:result.slug,publicPath:result.publicPath})}</script>`;}
 }else if(path.startsWith('/employer/')){record=(await api('wp/employer?slug='+encodeURIComponent(path.split('/').pop())))?.[0];if(record){type='employer';title=text(record.title);description=`Explore ${title}, company information and current healthcare job opportunities on Medbiomate.`;}}
 else if(/^\/(?:category|job-location|job-type)\/[^/]+$/.test(path)){
  const group=path.split('/')[1],slug=path.split('/')[2],tax=await api('wp/taxonomies'),term=tax?.[group==='category'?'categories':group==='job-location'?'locations':'types']?.find(r=>r.slug===slug);
  if(term){title=group==='job-location'?`Healthcare Jobs in ${term.name}`:`${term.name} Opportunities`;description=`Browse ${title.toLowerCase()} on Medbiomate. Explore vacancies, hiring employers and application details.`;}
 }else if(resume.test(path)){title='Resume Library & CV Builder';description='Create, edit and export a professional resume with the Medbiomate resume builder and template library.';}
 else if(['/medical-coder-class','/services/medical-coder-class'].includes(path)){title='Medical Coding Training';description='Explore medical coding training and career information on Medbiomate.';}
 else if(path==='/job-locations'){title='Healthcare Jobs by Location';description='Browse healthcare jobs by city and country across the UAE and GCC.';const tax=await api('wp/taxonomies');record={title:{rendered:title},content:{rendered:'<ul>'+(tax?.locations||[]).filter(t=>t.count>0).map(t=>`<li><a href="/job-location/${esc(t.slug)}">${esc(t.name)}</a></li>`).join('')+'</ul>'}};type='cms';embedded+=`<script id="public-page-data" type="application/json">${json(record)}</script>`;}
 else if(known[path]) [title,description]=known[path];
 else {
  const posts=JSON.parse(await readFile(resolve(root,'backend/data/posts.json'),'utf8'));const pages=JSON.parse(await readFile(resolve(root,'backend/data/pages.json'),'utf8'));record=posts.find(r=>r.slug===path.split('/').pop());if(!record){record=pages.find(r=>r.slug===path.slice(1));if(record){type='cms';embedded+=`<script id="public-page-data" type="application/json">${json(record)}</script>`;}}
  if(record){if(type!=='cms')type='post';title=text(record.title);description=plain(record.excerpt||record.content).slice(0,160);}
 }
 if(!title){status=404;type='404';title='Page Not Found';description='The requested Medbiomate page could not be found.';}
 if(record){embedded+=`<script id="public-content-data" type="application/json">${json(record)}</script>`;body=`<article class="wrap"><h1>${esc(title)}</h1>${text(record.content)||esc(record.description||'')}</article>`;}
 else body=`<main class="wrap"><h1>${esc(title)}</h1><p>${esc(description)}</p><a href="/jobs">Browse jobs</a> · <a href="/employers">Explore employers</a></main>`;
 if(['/jobs','/employers'].includes(path)){const rows=await api(path==='/jobs'?'wp/job_listing?per_page=10&'+url.searchParams:'wp/employer-directory?per_page=30&'+url.searchParams);const records=Array.isArray(rows)?rows:rows?.rows||[];const page=Math.max(1,Number(url.searchParams.get('page'))||1);body=body.replace('</main>','<ul>'+records.map(r=>`<li><a href="${esc(path==='/jobs'?(r.publicPath||'/job/'+r.slug):'/employer/'+r.slug)}">${esc(text(r.title))}</a></li>`).join('')+'</ul><nav aria-label="Pagination">'+(page>1?`<a href="${path}?page=${page-1}">Previous</a> `:'')+(records.length?`<a href="${path}?page=${page+1}">Next</a>`:'')+'</nav></main>');}
 if(path==='/job-categories'){const tax=await api('wp/taxonomies');const links=(tax?.categories||[]).filter(t=>t.count>0);embedded+=`<script id="category-directory-data" type="application/json">${json(links.map(t=>({slug:t.slug,href:'/category/'+t.slug,title:t.name,category:t.name,pageType:'main_category',activeJobCount:t.count})))}</script>`;body=body.replace('</main>','<ul>'+links.map(t=>`<li><a href="/category/${esc(t.slug)}">${esc(t.name)}</a></li>`).join('')+'</ul></main>');}
 const seo=pageSeo({path,query:url.searchParams,title,description,record,type});
 let html=await readFile(resolve(root,'public/source-runtime/shell.html'),'utf8');
 html=html.replace(/<title>.*?<\/title>/gs,'').replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*>/g,'').replace(/<link[^>]+rel=["']canonical["'][^>]*>/g,'');
 html=html.replace('</head>',seo.head+embedded+'</head>').replace('<div id="app"></div>',`<div id="app" data-server-rendered>${body}</div>`);
 return {status,html,noindex:seo.noindex};
}
