import {isPublicRecord} from './public-record.mjs';
const values=v=>Object.fromEntries((Array.isArray(v)?v:v?[v]:[]).map((name,i)=>[i,String(name)]));
export function publicShape(record,type){
 if(typeof record.title!=='string')return record;
 const r={...record,title:{rendered:record.title},content:{rendered:record.description||record.content||''},excerpt:{rendered:record.excerpt||''},date:record.postedDate||record.createdAt||record.date,metas:{...record.metas}};
 if(type==='job_listing')Object.assign(r.metas,{_job_employer_name:record.company||'',_job_employer_url:record.employerUrl||`/employer/${record.employerSlug||''}`,_job_logo:record.logo||'',_job_location:values(record.locations),_job_category:values(record.categories),_job_type:values(record.types),_job_apply_url:record.applyUrl||'',_job_apply_email:record.applyEmail||'',_job_apply_type:/email/i.test(record.applyType||'')?'email':'external',_job_expiry_date:record.expiryDate||record.deadline,experience:record.experience,qualification:record.qualification});
 if(type==='employer')Object.assign(r.metas,{_employer_logo:record.logo||'',_employer_location:values(record.locations),_employer_category:values(record.categories),_employer_website:record.website,_employer_email:record.email,_employer_phone:record.phone,_employer_company_size:record.companySize,_employer_founded_date:record.foundedDate});return r;
}
export function mergeCatalogue(imported,local,type){
 const records=new Map(imported.map(r=>[String(r.id||r.slug),r]));
 for(const r of local){for(const [key,previous]of records)if(previous.slug===r.slug||String(previous.id)===String(r.id))records.delete(key);records.set(String(r.id||r.slug),publicShape(r,type))}
 return [...records.values()].filter(isPublicRecord);
}
