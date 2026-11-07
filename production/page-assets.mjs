// Preserve shared navigation/mobile styles; omit only page-scoped styles when
// their components cannot appear on the requested route.
export function pageStyles(html,path){
 const detail=/^\/(?:jobs?|employer)\/[^/]+\/?$/.test(path);
 const account=/^\/(?:login|signin|sign-in|login-register|register|signup|sign-up|profile|dashboard|saved-jobs|applied-jobs|followed-companies)(?:\/|$)/.test(path);
 const omit=new Set();
 if(!detail){omit.add('job-actions.css');omit.add('detail.css');omit.add('detail-exact.css');omit.add('description-typography.css');}
 if(!account)omit.add('profile-design.css');
 return html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g,tag=>{
 const file=tag.match(/href="\/source-runtime\/([^?"/]+)(?:\?[^" ]*)?"/)?.[1];return omit.has(file)?'':tag;
 });
}
