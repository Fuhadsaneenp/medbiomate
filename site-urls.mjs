import {canonicalRoute} from './route-parity.mjs';
const base='https://www.medbiomate.com';
export const xmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function sitePath(value){try{return new URL(value,base).pathname.replace(/\/+$/,'')||'/'}catch{return '/'}}
export function canonical(value){return base+canonicalRoute(sitePath(value))}
export function sitemapGroups({jobs,employers,pages,posts,tax,original={}}){
 const known=new Set(['/',...jobs.map(r=>sitePath(r.publicPath||r.link||'/job/'+r.slug)),...employers.map(r=>sitePath(r.link||'/employer/'+r.slug)),...pages.map(r=>sitePath(r.link)),...posts.map(r=>sitePath(r.link))]);
 const groups={post:['/blog',...posts.map(r=>sitePath(r.link))],page:(original.page||pages.map(r=>r.link)).map(sitePath).filter(p=>known.has(p)),job_listing:['/jobs',...jobs.map(r=>sitePath(r.publicPath||r.link||'/job/'+r.slug))],employer:['/employers',...employers.map(r=>sitePath(r.link||'/employer/'+r.slug))]};
 for(const [group,key,prefix] of [['job_listing_type','types','job-type'],['job_listing_category','categories','job-category'],['job_listing_location','locations','job-location']])groups[group]=(tax[key]||[]).filter(t=>t.count>0).map(t=>'/'+prefix+'/'+t.slug);
 if(original.category?.length)groups.category=original.category.map(sitePath);
 return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,[...new Set(v)]]));
}
export function sitemapXml(paths){return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>'+xmlEscape(canonical(p))+'</loc></url>').join('')+'</urlset>'}
export function sitemapIndex(groups){return '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Object.keys(groups).map(k=>'<sitemap><loc>'+base+'/'+k+'-sitemap.xml</loc></sitemap>').join('')+'</sitemapindex>'}
