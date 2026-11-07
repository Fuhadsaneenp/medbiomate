export function isCatalogueListing(path){return ['/jobs','/job-list','/job-openings','/nurse-jobs-in-uae','/employers'].includes(path)||path.startsWith('/category/')||path.startsWith('/job-location/');}
export function applyListingTotal(counts,path,total){
 if(!Number.isFinite(total)||total<0)return counts;
 const next={...counts,[path==='/employers'?'employer':'job_listing']:total};
 if(path.startsWith('/category/'))next.category=total;
 if(path==='/nurse-jobs-in-uae')next.nurse=total;
 return next;
}
