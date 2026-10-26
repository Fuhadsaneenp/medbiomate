// TriKonet route conventions, with permanent compatibility for imported Medbiomate links.
export function canonicalRoute(path){
 const clean=path.replace(/\/+$/,'')||'/';
 const aliases={'/category/hospital':'/blog','/jobs-list':'/jobs','/job-list':'/jobs','/job-openings':'/jobs','/employers-list':'/employers','/signin':'/login','/sign-in':'/login','/login-register':'/login','/signup':'/register','/sign-up':'/register','/register-candidate':'/register','/candidate-dashboard':'/dashboard','/user-dashboard':'/dashboard','/my-account':'/profile','/my-bookmarks':'/saved-jobs','/shortlist-jobs':'/saved-jobs','/my-applied':'/applied-jobs','/following-employers':'/followed-companies','/admin-portal':'/admin-login','/trikonet-admin-access':'/admin-login'};
 if(aliases[clean])return aliases[clean];
 if(clean.startsWith('/job-category/'))return clean.replace('/job-category/','/category/');
 if(clean.startsWith('/employer-category/'))return '/employers?category_slug='+encodeURIComponent(clean.slice('/employer-category/'.length));
 if(clean.startsWith('/employer-location/'))return '/employers?location_slug='+encodeURIComponent(clean.slice('/employer-location/'.length));
 return clean;
}
export const isJobDetail=path=>/^\/(?:job|jobs)\/[^/]+\/?$/.test(path);
