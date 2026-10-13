import {mountHomeContent} from './trikonet-design.js';
export async function renderHome(tax,api){
 const host=document.querySelector('#apus-main-content');
 if(!host)return;
 const illustration='/assets/ef24f6c52136a96fc1d3.webp';
 mountHomeContent(host,tax,illustration);
 try{
  const rows=(await Promise.all(['NMC','American Hospital','Burjeel','Aster','Mediclinic'].map(name=>api('wp/employer?per_page=5&q='+encodeURIComponent(name))))).flat();
  const preferred=['nmc','american hospital','burjeel','aster','mediclinic'];
  const selected=preferred.map(name=>rows.find(r=>String(r.title?.rendered||r.title).toLowerCase().includes(name))).filter(Boolean);
  for(const r of rows)if(selected.length<5&&!selected.includes(r))selected.push(r);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelector('#mb-home-employers').innerHTML=selected.map(r=>{const m=r.metas||{},name=r.title?.rendered||r.title;return `<article class="mb-home-employer"><a class="mb-home-logo" href="/employer/${esc(r.slug)}">${m._employer_logo?`<img src="${esc(m._employer_logo)}" alt="${esc(name)}" loading="lazy">`:esc(name.slice(0,2))}</a><div class="mb-home-company-info"><h3>${esc(name)}</h3><p>${esc(Object.values(m._employer_location||{}).join(', ')||'Healthcare employer')}</p></div><span class="mb-home-tag">Healthcare</span><a class="mb-home-view" href="/jobs-list?employer_slug=${encodeURIComponent(r.slug)}">View jobs</a></article>`}).join('');
 }catch{document.querySelector('#mb-home-employers').innerHTML='<p>Explore healthcare employers and their opportunities in our employer directory.</p>'}
}
