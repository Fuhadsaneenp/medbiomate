import {mountHomeContent} from './trikonet-design.js';
import {esc,icon} from './ui.js';
export async function renderHome(tax,api){
 const host=document.querySelector('#apus-main-content');if(!host)return;
 mountHomeContent(host,tax,'/assets/ef24f6c52136a96fc1d3.webp');
 const jobsSection=`<section class="mb-home-how mb-site-wrap"><h2>How It Works?</h2><p>Your next healthcare opportunity, one step at a time.</p><div>${[['user','01','Create your free account','Build your career workspace and keep your details in one place.','/register'],['search','02','Explore healthcare jobs','Search by specialty, employer, and location across the GCC.','/jobs'],['building','03','Take the next step','Find the right role and apply using the employer’s instructions.','/employers']].map(([i,n,t,d,h])=>`<a href="${h}"><span class="mb-how-number">${n}</span><span class="mb-how-icon">${icon(i)}</span><h3>${t}</h3><p>${d}</p></a>`).join('')}</div></section>`;
 host.querySelector('main').insertAdjacentHTML('beforeend',jobsSection);
 const results=await Promise.allSettled([api('wp/employer-directory?per_page=12')]);
 const companies=host.querySelector('#mb-home-employers');
 if(results[0].status==='fulfilled')companies.innerHTML=results[0].value.rows.slice(0,5).map(r=>`<article class="mb-home-employer"><a class="mb-home-logo" href="/employer/${esc(r.slug)}">${r.logo?`<img src="${esc(r.logo)}" alt="${esc(r.title)}" loading="lazy">`:esc(r.title.slice(0,2))}</a><div class="mb-home-company-info"><h3>${esc(r.title)}</h3><p><strong>${r.openJobs.toLocaleString()}</strong> open jobs · ${esc(r.locations[0]||'GCC')}</p></div><span class="mb-home-tag">${esc(r.categories[0]||'Healthcare')}</span><a class="mb-home-view" href="/employer/${esc(r.slug)}?tab=jobs">View jobs</a></article>`).join('');
 else companies.innerHTML='<p>Explore healthcare employers and their opportunities in our employer directory.</p>';
}
