import {locationNames} from './location-tree.mjs';
import {mergeCatalogue} from './catalogue.mjs';
const title=r=>typeof r.title==='string'?r.title:r.title?.rendered||'';
const searchKey=v=>String(v||'').normalize('NFKD').replace(/&#(?:0*39|x0*27);|&apos;|&rsquo;|&#8217;/gi,'').replace(/['’‘ʼ`]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const key=v=>String(v||'').trim().toLowerCase();
export function employerDirectory(employers,jobs,local={},params=new URLSearchParams(),taxonomies={}){
 const companies=mergeCatalogue(employers,local.employers||[],'employer');
 const listings=mergeCatalogue(jobs,local.jobs||[],'job_listing');
 const ids=new Map(companies.map(r=>[String(r.id),r.slug]));
 const names=new Map(companies.map(r=>[key(title(r)),r.slug]));
 const counts=new Map();
 for(const j of listings){const m=j.metas||{};const slug=ids.get(String(m._job_employer_posted_by))||String(m._job_employer_url||'').match(/\/employer\/([^/?#]+)/)?.[1]||names.get(key(m._job_employer_name));if(slug)counts.set(slug,(counts.get(slug)||0)+1)}
 const rows=companies.map(r=>({id:r.id,slug:r.slug,title:title(r),createdAt:r.createdAt||r.date||r.post_date||'',logo:r.metas?._employer_logo||'',categories:Object.values(r.metas?._employer_category||{}),locations:Object.values(r.metas?._employer_location||{}),openJobs:counts.get(r.slug)||0}));
 const group=field=>{const map=new Map();for(const r of rows)for(const name of new Set(r[field]))map.set(name,(map.get(name)||0)+1);return [...map].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))};
 const categories=group('categories'),locations=group('locations');
 const slugify=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 for(const [slugKey,nameKey,terms]of [['category_slug','category',categories],['location_slug','location',locations]])if(params.get(slugKey)&&!params.get(nameKey)){const term=terms.find(r=>slugify(r.name)===params.get(slugKey));if(term)params.set(nameKey,term.name);else params.set(nameKey,'__not_found__')}
 const allowedLocations=locationNames(taxonomies.employerLocations||taxonomies.locations||[],params.get('location')).map(key);
 const q=searchKey(params.get('q')),cat=key(params.get('category')),loc=key(params.get('location')),min=Math.max(0,Number(params.get('min_jobs'))||0);
 let filtered=rows.filter(r=>(!q||searchKey([r.title,...r.categories,...r.locations].join(' ')).includes(q))&&(!cat||r.categories.some(v=>key(v)===cat))&&(!loc||r.locations.some(v=>allowedLocations.includes(key(v))))&&r.openJobs>=min);
 const newest=(a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)||Number(b.id||0)-Number(a.id||0)||a.title.localeCompare(b.title);
 const sort=params.get('sort');filtered.sort(sort==='az'?(a,b)=>a.title.localeCompare(b.title):sort==='za'?(a,b)=>b.title.localeCompare(a.title):sort==='recent'?newest:(a,b)=>b.openJobs-a.openJobs||a.title.localeCompare(b.title));
 const perPage=[12,24,30,48].includes(Number(params.get('per_page')))?Number(params.get('per_page')):12;
 const total=filtered.length,page=Math.min(Math.max(1,Number(params.get('page'))||1),Math.max(1,Math.ceil(total/perPage)));
 return {rows:filtered.slice((page-1)*perPage,page*perPage),total,page,perPage,categories,locations};
}
