import {renderJobDirectory} from './trikonet-listing.js';
import {renderEmployers} from './employer-directory.js';
import {renderSitePage} from './site-pages.js';
import {renderAccount,renderWorkspace,renderPasswordReset} from './member-pages.js';
import {renderHome} from './home-design.js';
import {initDisplayAds} from './display-ads.js';
import {showTrikonetDetail} from './detail-controller.js';
import {mountDesign,renderDesignDirectory} from './trikonet-design.js';
mountDesign();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=v=>typeof v==='object'?v?.rendered||'':v||'';
const api=async(path,options={})=>{const r=await fetch('/api/'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data};
let tax={};try{tax=await api('wp/taxonomies')}catch{}
api('auth/me').then(({user})=>{if(user){const account=document.querySelector('.mb-site-login');account.textContent='My Account';account.href='/profile'}}).catch(()=>{});
const items=value=>Array.isArray(value)?value:[];
const options=(rows,title,selected='')=>`<option value="">${title}</option>`+items(rows).map(r=>`<option value="${esc(r.name)}" ${r.name===selected?'selected':''}>${esc(r.name)}</option>`).join('');
const main=document.querySelector('#main')||document.querySelector('[role=main]')||document.querySelector('.single-listing-wrapper')||document.querySelector('#apus-main-content');
const heading=(title,subtitle='')=>`<div class="mb-heading"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>`;
const jobLocation=j=>Object.values(j.metas?._job_location||{}).join(', ');
const jobCard=j=>`<a class="mb-card" href="/job/${esc(j.slug)}">${j.metas?._job_logo?`<img src="${esc(j.metas._job_logo)}" alt="${esc(j.metas._job_employer_name)}" loading="lazy">`:''}<p>${esc(j.metas?._job_employer_name||'')}</p><h2>${esc(label(j.title))}</h2><p>⌖ ${esc(jobLocation(j))}</p><span class="mb-type">${esc(Object.values(j.metas?._job_type||{}).join(', ')||'Full Time')}</span></a>`;
function searchForm(params=new URLSearchParams()){return `<form class="mb-search" id="mb-search"><input name="q" aria-label="Job title, keywords" placeholder="Job title, keywords..." value="${esc(params.get('q'))}"><select name="location" aria-label="City or Country">${options(tax.locations,'City or Country',params.get('location'))}</select><select name="category" aria-label="All Categories">${options(tax.categories,'All Categories',params.get('category'))}</select><button class="mb-button">Find Jobs</button></form>`}
function bindSearch(){document.querySelector('#mb-search')?.addEventListener('submit',e=>{e.preventDefault();location.href='/jobs?'+new URLSearchParams(new FormData(e.target))})}
const resolvedJobUrl=JSON.parse(document.getElementById('job-url-data')?.textContent||'null');
const path=resolvedJobUrl?'/job/'+resolvedJobUrl.slug:location.pathname.replace(/\/+$/,'')||'/';
function originalCard(template,r,type){
 const node=template.cloneNode(true);const title=node.querySelector(type==='job_listing'?'.job-title a':'.employer-title a');if(title){title.textContent=label(r.title);title.href=(type==='job_listing'?'/job/':'/employer/')+r.slug}
 for(const a of node.querySelectorAll('a')){const href=a.getAttribute('href')||'';if(href.startsWith('/job/')&&type==='job_listing')a.href='/job/'+r.slug;if(href.startsWith('/employer/'))a.href=type==='employer'?'/employer/'+r.slug:(r.metas?._job_employer_url||'/employers').replace('https://www.medbiomate.com','')}
 if(type==='job_listing'){const employer=node.querySelector('.employer-title a');if(employer)employer.textContent=r.metas?._job_employer_name||'';const loc=node.querySelector('.job-location');if(loc)loc.textContent=jobLocation(r);const cats=node.querySelector('.job-category');if(cats)cats.innerHTML=Object.values(r.metas?._job_category||{}).map(name=>{const category=items(tax.categories).find(t=>t.name===name);return '<a href="/category/'+esc(category?.slug||'')+'">'+esc(name)+'</a>'}).join(', ');const t=node.querySelector('.type-job');if(t)t.textContent=Object.values(r.metas?._job_type||{}).join(', ')}
 for(const img of node.querySelectorAll('img')){const logo=type==='job_listing'?r.metas?._job_logo:r.metas?._employer_logo;if(logo){img.src=logo;img.removeAttribute('srcset');img.alt=label(r.title)}else img.remove()}
 node.querySelectorAll('.btn-add-job-shortlist,.btn-follow').forEach(el=>el.remove());node.removeAttribute('id');return node;
}
async function originalDirectory(type,p,page){if(type==='job_listing'){await renderJobDirectory(tax,api);return true}return renderDesignDirectory({type,p,page,tax,api})}
async function directory(type,params){
 const p=params||new URLSearchParams(location.search),page=Math.max(1,Number(p.get('page'))||1);if(!p.has('per_page'))p.set('per_page','12');p.set('page',String(page));
 if(await originalDirectory(type,p,page))return;
 const title=type==='job_listing'?'Jobs':type==='employer'?'Employers':'Blog';
 main.innerHTML=heading(title,type==='job_listing'?'Find the Latest Healthcare Jobs':'')+`<div class="mb-page">${type==='job_listing'?searchForm(p):''}<div id="mb-results">Loading…</div></div>`;bindSearch();
 const rows=await api('wp/'+type+'?'+p);const list=items(rows);
 document.querySelector('#mb-results').innerHTML=`<div class="mb-grid">${list.map(r=>type==='job_listing'?jobCard(r):`<a class="mb-card" href="${type==='employer'?'/employer/':'/blog/'}${esc(r.slug)}">${r.metas?._employer_logo?`<img src="${esc(r.metas._employer_logo)}" alt="" loading="lazy">`:''}<h2>${esc(label(r.title))}</h2><p>${type==='employer'?'View company and open jobs':'Read article'}</p></a>`).join('')}</div>${!list.length?'<p class="mb-empty">No results found. Try another search.</p>':''}<div class="mb-pager">${page>1?`<a class="mb-button" href="?${new URLSearchParams({...Object.fromEntries(p),page:page-1})}">Previous</a>`:''}<span>Page ${page}</span>${list.length===18?`<a class="mb-button" href="?${new URLSearchParams({...Object.fromEntries(p),page:page+1})}">Next</a>`:''}</div>`;
}
async function detail(type,slug){
 const rows=await api('wp/'+type+'?slug='+encodeURIComponent(slug));const r=items(rows)[0];if(!r){main.innerHTML=heading('Page not found');return;}
 document.title=label(r.title)+' | Medbiomate';
 const m=r.metas||{},href=m._job_apply_type==='email'&&m._job_apply_email?'mailto:'+m._job_apply_email:m._job_apply_url;
 main.innerHTML=heading(label(r.title),type==='job_listing'?m._job_employer_name:'')+`<div class="mb-page mb-details"><article class="mb-content">${label(r.content)}</article><aside class="mb-sidebar">${type==='job_listing'?`<h2>Job Overview</h2><p>⌖ ${esc(jobLocation(r))}</p><p>${esc(Object.values(m._job_type||{}).join(', '))}</p><p>${esc(m.experience||m._job_experience||'')}</p><p>${esc(m.qualification||'')}</p>${href?`<a class="mb-button" href="${esc(href)}" target="_blank" rel="noopener noreferrer">Apply Now</a>`:'<p>Application details are included in the job description.</p>'}<button class="mb-button" id="bookmark">Save Job</button><p class="mb-status" id="bookmark-status"></p>`:'<a class="mb-button" href="/jobs?employer_slug='+esc(slug)+'">View Open Jobs</a>'}</aside></div>`;
 document.querySelector('#bookmark')?.addEventListener('click',()=>{const saved=JSON.parse(localStorage.getItem('medbiomate-bookmarks')||'[]');if(!saved.some(j=>j.id===r.id))saved.push(r);localStorage.setItem('medbiomate-bookmarks',JSON.stringify(saved));document.querySelector('#bookmark-status').textContent='Job saved to My Bookmarks.'});
}
function authDialog(register=false){
 document.querySelector('#mb-auth')?.remove();const d=document.createElement('dialog');d.id='mb-auth';d.className='mb-dialog';d.innerHTML=`<button style="float:right;background:none;border:0" aria-label="Close">×</button><h2>${register?'Create a free account':'Login to Medbiomate'}</h2><form>${register?'<input name="name" aria-label="Full name" placeholder="Full name" required>':''}<input name="email" type="email" aria-label="Email" placeholder="Email" autocomplete="email" required><input name="password" type="password" aria-label="Password" placeholder="Password" minlength="8" autocomplete="${register?'new-password':'current-password'}" required><button class="mb-button">${register?'Register':'Login'}</button></form><p class="mb-status" role="status"></p><button id="mb-switch" class="btn">${register?'Already have an account? Login':'Create a free account'}</button>`;document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.querySelector('#mb-switch').onclick=()=>authDialog(!register);d.querySelector('form').onsubmit=async e=>{e.preventDefault();try{const r=await api('auth/'+(register?'register':'login'),{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});d.querySelector('.mb-status').textContent='Welcome, '+r.user.name;setTimeout(()=>{d.close();location.href='/dashboard'},700)}catch(err){d.querySelector('.mb-status').textContent=err.message}};d.showModal();
}
async function dashboard(){let user;try{user=(await api('auth/me')).user}catch{main.innerHTML=heading('Candidate Dashboard')+'<div class="mb-page"><button id="dashboard-login" class="mb-button">Login / Register</button></div>';document.querySelector('#dashboard-login').onclick=()=>authDialog();return}main.innerHTML=heading('Candidate Dashboard','Welcome, '+user.name)+`<div class="mb-page"><h2>My Bookmarks</h2><div class="mb-grid">${JSON.parse(localStorage.getItem('medbiomate-bookmarks')||'[]').map(jobCard).join('')}</div><button class="mb-button" id="logout">Logout</button></div>`;document.querySelector('#logout').onclick=async()=>{await api('auth/logout',{method:'POST'});location.href='/'}}
async function cmsPage(){const rows=await fetch('/api-content/pages').then(r=>r.json());const r=rows.find(r=>r.link.replace(/\/+$/,'')===path||r.slug===path.slice(1));main.innerHTML=r?heading(label(r.title))+`<article class="mb-page mb-content">${label(r.content)}</article>`:heading('Page not found')}
try{
 if(['/resume-library','/resume-builder','/resume-maker','/ats-resume-builder','/cv-builder','/services/resume-maker','/services/resume-builder','/services/ats-resume-builder','/services/cv-builder'].includes(path)){const {stylesheet}=await import('./ui.js');stylesheet('/cv-builder.css');main.innerHTML='<div id="cv-builder-root"></div>';const {initCVBuilder}=await import('./cvBuilder.js');initCVBuilder('#cv-builder-root');document.title='Résumé Library & CV Builder | Medbiomate'}
 else if(path==='/')await renderHome(tax,api);
 else if(path.startsWith('/job-location/')||path.startsWith('/category/')||path.startsWith('/job-type/')){const group=path.split('/')[1],slug=path.split('/')[2],rows=group==='job-location'?tax.locations:group==='category'?tax.categories:tax.types;const t=items(rows).find(r=>r.slug===slug);const p=new URLSearchParams(location.search);p.set(group==='job-location'?'location':group==='category'?'category':'job_type',t?.name||slug);await directory('job_listing',p)}
 else if(path==='/nurse-jobs-in-uae'){const p=new URLSearchParams(location.search);p.set('category','Nurse Jobs');await directory('job_listing',p)}
 else if(['/jobs'].includes(path))await directory('job_listing');
 else if(['/employers','/employers'].includes(path))await renderEmployers(api);
 else if(await renderSitePage(path,tax,api)){}
 else if(path==='/category/hospital')await directory('posts');
 else if(path==='/blog'&&!document.querySelector('.blog-content,.posts-wrapper,.blog-grid'))await directory('posts');
 else if(path.startsWith('/job/'))await showTrikonetDetail('job_listing',path.split('/').pop(),api);
 else if(path.startsWith('/employer/'))await showTrikonetDetail('employer',path.split('/').pop(),api);
 else if(path.startsWith('/blog/'))await detail('posts',path.split('/').pop());
 else if(['/dashboard','/candidate-dashboard','/my-bookmarks','/user-dashboard','/profile','/my-account','/shortlist-jobs','/my-applied','/following-employers','/saved-jobs','/applied-jobs','/followed-companies'].includes(path))await renderWorkspace(path,api);
 else if(path==='/forgot-password')await renderPasswordReset(api);
 else if(['/login','/register','/signup','/login-register','/register-candidate','/register-employer'].includes(path))await renderAccount(path,api);
 else if(path==='/logout'){await api('auth/logout',{method:'POST'});location.href='/'}
 else if(path==='/submit-job'){main.innerHTML='<main><section class="mb-inner-hero"><div class="mb-site-wrap"><span class="mb-home-eyebrow">FOR HEALTHCARE EMPLOYERS</span><h1>Find your next healthcare professional.</h1><p>Manage and publish opportunities through the Medbiomate employer admin console.</p></div></section><section class="mb-prose"><h2>Post a job on Medbiomate</h2><p>Sign in to your employer admin account to create a listing, add application details, and manage your published jobs.</p><a class="mb-site-primary" href="/admin">Open Admin Console →</a><h2>Need an employer account?</h2><p>Contact the Medbiomate team to discuss publishing your healthcare opportunities.</p><a class="mb-home-outline" href="/contact">Contact our team →</a></section></main>'}
 else if(!['/','/about','/contact','/terms','/faq','/privacy-policy','/disclaimer','/career-contact','/resignation-letter-format','/gratuity-calculator','/hospitals-in-dubai'].includes(path))await cmsPage();
}catch(err){main.innerHTML=heading('Please try again')+`<p class="mb-page">${esc(err.message)}</p>`}
// Replace plugin-powered controls with native web-app interactions.
for(const form of document.querySelectorAll('form')){
 if(form.id==='mb-search')continue;
 if(form.querySelector('[name="filter-title"]')||form.querySelector('[placeholder="Job title, keywords..."]')){
  const field=form.querySelector('[placeholder="Job title, keywords..."]');field.name='q';const selects=form.querySelectorAll('select');if(selects[0]){selects[0].name='location';selects[0].innerHTML=options(tax.locations,'City or Country')}if(selects[1]){selects[1].name='category';selects[1].innerHTML=options(tax.categories,'All Categories')}form.onsubmit=e=>{e.preventDefault();location.href='/jobs?'+new URLSearchParams(new FormData(form))};
 }
}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('apus_login')||href.includes('apus_register')){e.preventDefault();authDialog()};if(href==='#'&&/Dashboard|Job Alerts|My Bookmarks/.test(a.textContent)){e.preventDefault();location.href='/dashboard'}});
const wa=document.createElement('a');wa.className='mb-whatsapp';wa.href='https://wa.me/918606799432';wa.textContent='☏';wa.setAttribute('aria-label','Text us on WhatsApp');document.body.append(wa);

for(const counter of document.querySelectorAll('.elementor-counter-number'))counter.textContent=counter.dataset.toValue||counter.textContent;
for(const toggle of document.querySelectorAll('[data-toggle="collapse"]'))toggle.addEventListener('click',e=>{e.preventDefault();const target=document.querySelector(toggle.getAttribute('href'));if(target){target.classList.toggle('in');toggle.setAttribute('aria-expanded',target.classList.contains('in'))}});
for(const form of document.querySelectorAll('.wpcf7-form'))form.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));let status=form.querySelector('.mb-status');if(!status){status=document.createElement('p');status.className='mb-status';status.setAttribute('role','status');form.append(status)}try{await api('contact',{method:'POST',body:JSON.stringify(data)});status.textContent='Your message has been saved for the Medbiomate team.';form.reset()}catch(err){status.textContent=err.message}});

for(const img of document.querySelectorAll('img[data-src]')){img.src=img.dataset.src;img.classList.remove('unveil-image')}
if(path==='/'){
 const cards=[...document.querySelectorAll('article.job-grid')];if(cards.length){try{const rows=items(await api('wp/job_listing?per_page='+cards.length));cards.forEach((card,i)=>{if(rows[i])card.replaceWith(originalCard(card,rows[i],'job_listing'));else card.remove()})}catch{}}
 const carousel=document.querySelector('.widget-jobs .slick-carousel');if(carousel){carousel.setAttribute('aria-label','Latest jobs');const controls=document.createElement('div');controls.className='mb-carousel-controls';controls.innerHTML='<button aria-label="Previous jobs">‹</button><button aria-label="Next jobs">›</button>';carousel.after(controls);controls.children[0].onclick=()=>carousel.scrollBy({left:-carousel.clientWidth,behavior:'smooth'});controls.children[1].onclick=()=>carousel.scrollBy({left:carousel.clientWidth,behavior:'smooth'})}
}
document.querySelector('#back-to-top')?.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});

initDisplayAds();
