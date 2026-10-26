"""Import the supplied UI without importing its database, accounts or ad identity."""
from pathlib import Path
import re, shutil, sys, json, colorsys
source=Path(sys.argv[1] if len(sys.argv)>1 else '/Users/fuhadsaneenpk/My Works/Trikonet/frontend')
root=Path(__file__).resolve().parents[1]
out=root/'public/source-runtime';out.mkdir(exist_ok=True)
# Keep the source's spacing, typography, components and interactions. Change brand tokens only.
colours={'#b00008':'#0066ff','#B00008':'#0066ff','#c4000a':'#0058df','#d00000':'#0066ff','#d10000':'#0066ff','#c9000b':'#0058df','#cc0000':'#0066ff','#b91c1c':'#0058df','#991b1b':'#004ac2','#fff5f5':'#f3f7ff','#fff1f2':'#eff6ff','#fff0f1':'#eff6ff','#fef2f2':'#eff6ff','#fee2e2':'#dbeafe','#fecaca':'#bfdbfe','#fecdd3':'#bfdbfe'}
def adapt(text):
 text=text.replace('https://api.trikonet.com','').replace('https://www.trikonet.com','https://www.medbiomate.com').replace('https://trikonet.com','https://www.medbiomate.com')
 text=text.replace('ca-pub-4310822705633659','ca-pub-4613840941360196')
 text=text.replace('TRIKONET','MEDBIOMATE').replace('Trikonet','Medbiomate').replace('TriKonet','Medbiomate').replace('trikonet','medbiomate')
 text=text.replace('/assets/','/source-runtime/assets/')
 for a,b in colours.items():text=text.replace(a,b)
 def brand_colour(match):
  colour=match.group(0);rgb=[int(colour[i:i+2],16)/255 for i in (1,3,5)];h,l,sat=colorsys.rgb_to_hls(*rgb)
  if (h<.045 or h>.94) and sat>.12:
   return '#'+''.join(f'{round(v*255):02x}' for v in colorsys.hls_to_rgb(.6,l,sat))
  return colour
 text=re.sub(r'#[0-9a-fA-F]{6}\b',brand_colour,text)
 text=re.sub(r'(?i)rgba?\(\s*176\s*,\s*0\s*,\s*8\s*([,)])',r'rgba(0,102,255\1',text)
 return text
files=[]
for file in source.iterdir():
 if file.suffix not in ['.js','.css'] or '.test.' in file.name or file.name in ['server.js','dev-server.mjs','admin.js','admin.css']:continue
 (out/file.name).write_text(adapt(file.read_text()));files.append(file.name)
for directory in ['assets']:
 shutil.copytree(source/directory,out/directory,dirs_exist_ok=True)
if (out/'uploads').exists():shutil.rmtree(out/'uploads')
# Existing Medbiomate logo, favicon and working CV builder/plugin remain authoritative.
shutil.copy2(root/'backend/public/assets/favicon-192.png',out/'assets/favicon-192.png')
for name in ['logo-black.png','logo-white.png','logo.png','medbiomate-logo.png']:
 shutil.copy2(root/'public/assets/71c45c0362a2e90b1af7.png',out/'assets'/name)
# Point webp logo variants at the actual PNG so no extension/content mismatch is introduced.
for file in out.glob('*.js'):
 text=file.read_text()
 for name in ['logo-black','logo-white','medbiomate-logo']:text=text.replace(name+'.webp',name+'.png')
 file.write_text(text)
shutil.copy2(root/'public/cvBuilder.js',out/'cvBuilder.js')
# Reuse the verified server-admin shell, never run the original frontend admin/auth fallback.
app=out/'app.js';text=app.read_text();text='const serverRouteTitle=document.title;\n'+text
text=text.replace("['hero','categories','top-companies','how-it-works','articles'].map", "['hero','categories','top-companies','how-it-works'].map")
text=text.replace("['hero','categories','top-companies','how-it-works','articles'].includes(item.type)","['hero','categories','top-companies','how-it-works'].includes(item.type)")
# Do not publish seed articles or their third-party author/reviewer identities.
a=text.index('  jobs:[');b=text.index('  employers:',a);text=text[:a]+'  jobs:[],\n'+text[b:]
a=text.index('  posts:[');b=text.index('\n  pages:',a);text=text[:a]+'  posts:[], '+text[b:]
text=text.replace("/source-runtime/assets/athira-susan-james.png","/source-runtime/assets/logo-black.png").replace("/source-runtime/assets/mayur-kacholiya.png","/source-runtime/assets/logo-black.png")
text=text.replace("||'Athira Susan James'","||'Medbiomate Team'").replace("reviewer:post.reviewer_name||'Mayur Kacholiya'","reviewer:post.reviewer_name||''")
# Align legacy category/location aliases before loading the original screen.
text=text.replace("const SITE_ORIGIN=", "if(path==='/dashboard')path='/profile';\nif(path.startsWith('/job-type/')){const typeSlug=path.split('/').pop();path='/jobs';const q=new URLSearchParams(location.search);q.set('job_type',typeSlug.replaceAll('-',' '));history.replaceState(null,'','/jobs?'+q);}\nconst SITE_ORIGIN=")
app.write_text(text)
# Use the reliable complete-catalogue employer endpoint rather than source's page-local sorting.
a=text.index('async function loadLocalEmployers(){');b=text.index('\nasync function loadTopEmployers',a)
text=text[:a]+'''async function loadLocalEmployers(){
 try{
  const filters=new URLSearchParams(queryParams);filters.set('per_page',String(pageSize));filters.set('page',String(currentPage));
  const response=await fetch('/api/wp/employer-directory?'+filters);if(!response.ok)throw Error('Companies unavailable');
  const result=await response.json();data.employers=result.rows;data.employerResultTotal=result.total;data.counts={...data.counts,employer:result.total};
 }catch{data.employers=[];data.employerResultTotal=0;}
}'''+text[b:]
text=text.replace("base.replace(/\\.png$/, '.webp')", "base")
text=text.replace("data.counts={...data.counts,employer:result.total};", "data.counts={...data.counts,employer:result.total};data.employerFacets={categories:result.categories,locations:result.locations};")
a=text.index('  const topStripCategories = [',text.index('function employers()'))
b=text.index('\n\n  const buildFilterUrl',a)
text=text[:a]+"  const topStripCategories = (data.employerFacets?.categories||[]).slice(0,9).map(c=>({title:c.name,subtitle:c.count.toLocaleString()+' Companies',qParam:c.name}));"+text[b:]
a=text.index('  const sidebarCategories = sidebarCategoryKeys.map')
b=text.index('\n\n  const vacancyFilters',a)
text=text[:a]+"  const sidebarCategories=(data.employerFacets?.categories||[]).map(c=>({name:c.name,count:c.count.toLocaleString()}));\n  const sidebarLocations=(data.employerFacets?.locations||[]).map(c=>({name:c.name,count:c.count.toLocaleString()}));"+text[b:]
a=text.index('const TOP_HIRING_COMPANIES_FALLBACK = [');b=text.index('];',a)+2;text=text[:a]+'const TOP_HIRING_COMPANIES_FALLBACK = [];'+text[b:]
text=text.replace("else if(path==='/')homeContentReady=Promise.allSettled([loadTopEmployers(),loadConnectedContent()]);","else if(path==='/'){initialLoads.push(loadDirectoryTaxonomies());homeContentReady=Promise.allSettled([loadTopEmployers(),loadConnectedContent()]);}")
# Keep the source screen implementation, with database-backed content and one SEO authority.
a=text.index('async function loadTopEmployers(){');b=text.index('\n',a)
text=text[:a]+"async function loadTopEmployers(){try{const response=await fetch('/api/wp/employer-directory?per_page=30&sort=jobs');const result=await response.json();data.topEmployers=result.rows||[];}catch{data.topEmployers=[]}}"+text[b:]
text=text.replace("employers = [...TOP_HIRING_COMPANIES_FALLBACK];", "employers = [];")
text=text.replace("Number(e.openJobs) || 20", "Number(e.openJobs) || 0")
text=text.replace("applySavedSeoMeta();", "/* Route SEO is rendered by the server; preserve canonical pagination and noindex. */")
text=text.replace("addStructuredData();", "/* Structured data is rendered once by the server from verified fields. */")
# The same source form routes remain supported under legacy Medbiomate aliases.
text=text.replace("if(path==='/dashboard')path='/profile';", "if(path==='/dashboard')path='/profile';\nif(path==='/forgot-password')path='/login';\nif(/^\\/services\\/(?:resume-builder|ats-resume-builder|cv-builder)$/.test(path))path='/resume-builder';")
# A CMS-backed page should retain its real title and body instead of the generic 404.
needle="  else {\n    const pathParts = path.split('/').filter(Boolean);"
replacement="  else if(document.getElementById('public-page-data')){const page=JSON.parse(document.getElementById('public-page-data').textContent);body='<main class=\"wrap\"><article class=\"wordpress-content\"><h1>'+escapeAttr(page.title?.rendered||page.title)+'</h1>'+(page.content?.rendered||'')+'</article></main>';}\n"+needle
text=text.replace(needle,replacement)
text=text.replace('<h2>Top companies hiring now</h2>','<h1>Top companies hiring now</h1>')
# Resolve cross-industry links to real Medbiomate taxonomy archives or working searches.
text=text.replace("function header(){ return renderSiteHeader(", "function header(){ return brandMenu(renderSiteHeader(")
text=text.replace("headerLogo: resolveLogo(siteChrome.headerLogo, '/source-runtime/assets/logo-black.png') } }); }", "headerLogo: resolveLogo(siteChrome.headerLogo, '/source-runtime/assets/logo-black.png') } })); }")
text+="""
function brandMenu(html){
 const doc=new DOMParser().parseFromString(html,'text/html');
 const clean=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
 for(const link of doc.querySelectorAll('a[href^="/category/"]')){
  const slug=link.getAttribute('href').slice('/category/'.length),term=(data.taxonomies?.categories||[]).find(t=>t.slug===slug||clean(t.name)===clean(slug));
  if(term){link.href='/category/'+term.slug;const badge=link.querySelector('small');if(badge)badge.textContent=Number(term.count||0).toLocaleString()+' Open Jobs';}
  else{link.href='/jobs?q='+encodeURIComponent(link.querySelector('strong')?.textContent||link.textContent.trim());const badge=link.querySelector('small');if(badge&&/\\d/.test(badge.textContent))badge.textContent='Explore jobs';}
 }
 for(const link of doc.querySelectorAll('a[href^="/employers?"]')){
  const params=new URL(link.getAttribute('href'),'https://www.medbiomate.com').searchParams,category=params.get('category');
  if(category){const term=(data.taxonomies?.employerCategories||[]).find(t=>clean(t.name)===clean(category));const badge=link.querySelector('small');if(badge)badge.textContent=term?Number(term.count||0).toLocaleString()+' Companies':'Explore companies';}
 }
 for(const badge of doc.querySelectorAll('.mega-badge')){if(/LISTINGS/i.test(badge.textContent))badge.textContent=data.counts?.job_listing?data.counts.job_listing.toLocaleString()+'+ LISTINGS':'CURRENT LISTINGS';else if(/COMPANIES/i.test(badge.textContent))badge.textContent=data.counts?.employer?data.counts.employer.toLocaleString()+'+ COMPANIES':'HIRING COMPANIES';}
 for(const link of doc.querySelectorAll('.mega-view-all'))if(link.getAttribute('href')==='/employers')link.textContent=data.counts?.employer?'All Companies ('+data.counts.employer.toLocaleString()+') →':'All Companies →';
 return doc.body.innerHTML;
}
"""
text=text.replace("return renderSiteFooter({ ...siteChrome, footerLogo: resolveLogo(siteChrome.footerLogo, '/source-runtime/assets/logo-white.png') });","return brandMenu(renderSiteFooter({ ...siteChrome, footerLogo: resolveLogo(siteChrome.footerLogo, '/source-runtime/assets/logo-white.png') }));")
text=text.replace('onsubmit="event.preventDefault(); alert(\'Subscribed to job alerts!\');"','')
text+="""
for(const form of document.querySelectorAll('.nurse-side-alert-form'))form.addEventListener('submit',async event=>{
 event.preventDefault();let status=form.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');form.append(status);}
 if(!currentUser){location.href='/login?redirect='+encodeURIComponent(location.pathname+location.search);return;}
 const email=form.querySelector('input[type=email]')?.value.trim();if(email&&email.toLowerCase()!==String(currentUser.email||'').toLowerCase()){status.textContent='Use the email address on your Medbiomate account.';return;}
 const button=form.querySelector('button');button.disabled=true;
 try{const response=await fetch('/api/candidate/job-alerts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:true})});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to save alerts.');status.textContent='Job email alerts enabled for your account.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
"""
text+='\ndocument.title=serverRouteTitle;\n'


text=text.replace("document.querySelector('#contact')?.addEventListener('submit',e=>{e.preventDefault();toast('Thanks — your message is saved in this local demo.')});", "document.querySelector('#contact')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,fields=form.querySelectorAll('input,textarea');let status=form.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');form.append(status);}const button=form.querySelector('button');button.disabled=true;try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fields[0].value,email:fields[1].value,message:fields[2].value})});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not save message.');status.textContent='Your message has been saved for the Medbiomate team.';form.reset();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});")
text=text.replace("onsubmit=\"event.preventDefault(); alert('Thank you for registering! An admissions advisor will contact you with syllabus details and batch schedule.');\"",'')
text+="""
for(const form of document.querySelectorAll('.service-form'))form.addEventListener('submit',async event=>{
 event.preventDefault();let status=form.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');form.append(status);}
 const fields=Object.fromEntries(Array.from(form.querySelectorAll('input,select,textarea')).map((field,index)=>[field.name||field.placeholder||'field'+index,field.value]));
 const button=form.querySelector('button[type=submit],button');if(button)button.disabled=true;
 try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:location.pathname,...fields})});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to save your enquiry.');status.textContent='Your enquiry has been saved for the Medbiomate team.';form.reset();}catch(error){status.textContent=error.message;}finally{if(button)button.disabled=false;}
});
"""
text=text.replace('restoreArticleImages();','/* Medbiomate media already has its own paths. */')
text=text.replace("import('./admin.js?","import('/admin-assets/admin.js?")
text=text.replace('20261012-job-recovery3','20261026-medbiomate-parity')
app.write_text(text)
bootstrap=out/'bootstrap.js';bootstrap.write_text(bootstrap.read_text().replace('20261012-job-recovery3','20261026-medbiomate-parity'))
detail=out/'detail-pages.js';detail.write_text(detail.read_text().replace("m._employer_founded_date || '2012'","m._employer_founded_date || 'Not specified'").replace("m._employer_company_size || '501-1,000'","m._employer_company_size || 'Not specified'"))
footer=out/'site-footer.js';footer.write_text(footer.read_text().replace('Medbiomate Recruitment Services | Registered in Dubai, United Arab Emirates. Connecting certified professionals with leading healthcare providers, schools, corporate firms, and technology groups across the UAE & GCC.','Medbiomate connects healthcare professionals with employers and career opportunities across the UAE & GCC.'))
# Source index is a universal shell; the server adds route-specific SEO and crawlable content.
html=adapt((source/'index.html').read_text())
html=html.replace('logo-black.webp','logo-black.png')
html=html.replace('<noscript><style>#page-preloader{display:none!important}</style></noscript>','<noscript><style>#page-preloader{display:none!important}html.page-loading{overflow:auto}.page-loading #app{visibility:visible!important}</style></noscript>')
html=html.replace("if (!['/', '/index.html'].includes(location.pathname.replace(/\\/+$/, '') || '/')) {","if (!['/', '/index.html'].includes(location.pathname.replace(/\\/+$/, '') || '/') && !/^\\/(?:admin|login|register|profile|dashboard|saved-jobs|applied-jobs|followed-companies|submit-job|resume-library|resume-builder|services\\/resume-maker)(?:\\/|$)/.test(location.pathname)) {")
html=re.sub(r'<link rel="preconnect" href="" crossorigin>','',html)
for name in files:
 html=html.replace('href="/'+name,'href="/source-runtime/'+name).replace('src="/'+name,'src="/source-runtime/'+name)
html=html.replace('/admin.css?', '/admin-assets/admin.css?')
html=html.replace('data-ad-slot="9017818388"','data-ad-slot="6468852807"')
for favicon in ['favicon-32x32.png','favicon-16x16.png','favicon.ico']:
 html=html.replace('/'+favicon,'/source-runtime/assets/favicon-192.png')
# Avoid showing the other brand's animated logo while loading.
html=re.sub(r'<video class="loading-scene-video".*?</video>','',html,flags=re.S)
html=html.replace('.preloader-static-logo { display: none;', '.preloader-static-logo { display: block;')
html=html.replace('20261012-job-recovery3','20261026-medbiomate-parity')
html=html.replace('</head>','<link rel="stylesheet" href="/source-runtime/medbiomate-brand.css?v=20261026"></head>')
(out/'shell.html').write_text(html)
ads=out/'display-ads.js';adtext=ads.read_text().replace('9017818388','6468852807')
# Verified against the live 20261021-pagination release on 26 October 2026.
adtext=adtext.replace('  initAdditionalFeedAd();\n  initOtherJobsAd();','  // Current live layout keeps company actions together without extra inserted ads.')
adtext=adtext.replace('for (let spot = 0; spot < 3; spot++) {','for (const [spot, cardIndex] of [4, 9].entries()) {\n    if (!cards[cardIndex]) continue;')
adtext=adtext.replace("if (spot === 2) feed.after(placement);\n    else if (spot === 0) cards[0].after(placement);\n    else cards[Math.max(0, Math.ceil(cards.length * (spot + 1) / 3) - 1)].after(placement);","const pagination = feed.parentElement.querySelector('.data-pagination');\n    if (cardIndex === cards.length - 1 && pagination) pagination.after(placement);\n    else cards[cardIndex].after(placement);")
ads.write_text(adtext)
(out/'medbiomate-brand.css').write_text('''/* Brand-only overrides; source page geometry and components are retained. */
:root{--primary:#0066ff;--brand:#0066ff;--accent:#0066ff;--primary-color:#0066ff;--brand-red:#0066ff}
.brand img,.footer-logo img,.footer-brand-logo{object-fit:contain}
.preloader-static-logo{display:block!important}\n.emp-top-hiring-head h1{font-size:22px;line-height:1.3;margin:8px 0 0;font-weight:700;color:#fff}
''')
for generated in out.iterdir():
 if generated.suffix in ['.js','.css','.html']:generated.write_text('\n'.join(line.rstrip() for line in generated.read_text().splitlines())+'\n')
(root/'docs/source-import.json').write_text(json.dumps({'source':str(source),'files':files,'liveReference':{'checked':'2026-10-26','appVersion':'20261022-work-credit-16','adsVersion':'20261021-pagination','listingAdsAfter':[5,10],'jobDetailExtraSlotsRemoved':True},'brand':'Medbiomate','primary':'#0066ff','preservedException':'Homepage articles removed at user request','data':'Existing Medbiomate catalogue and account backend; no source accounts imported'},indent=2)+'\n')
print('Imported',len(files),'UI modules/styles into',out)
