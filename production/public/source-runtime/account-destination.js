const authPaths=new Set(['/login','/signin','/sign-in','/login-register','/register','/signup','/sign-up']);
export function accountDestination(requested,origin){
 try{const url=new URL(requested||'/profile',origin);if(url.origin!==origin||authPaths.has(url.pathname.replace(/\/$/,'')))return '/profile';return url.pathname+url.search+url.hash;}catch{return '/profile'}
}
export function isAccountEntry(path){return authPaths.has(path.replace(/\/$/,''));}
