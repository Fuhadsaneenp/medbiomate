// Only anonymous server-rendering reads are shared; account/admin responses never enter this cache.
export function cachePublicFetch(fetcher,{ttl=10000,maxEntries=128,now=Date.now}={}){
 const entries=new Map();
 return async function(url){
  const parsed=new URL(url,'http://localhost');
  const eligible=/^\/api\/(?:wp\/(?:taxonomies|job_listing|employer|employer-directory)|job-category-links)$/.test(parsed.pathname)&&!['admin','preview','draft'].some(key=>parsed.searchParams.has(key));
  if(!eligible)return fetcher(url);
  const key=parsed.pathname+parsed.search;let entry=entries.get(key);
  if(!entry||entry.expires<=now()){
   entry={expires:now()+ttl};
   entry.promise=(async()=>{const response=await fetcher(url);if(!response.ok||!response.headers.get('content-type')?.includes('application/json')){if(entries.get(key)===entry)entries.delete(key);return response;}const bytes=await response.arrayBuffer();return new Response(bytes,{status:response.status,headers:response.headers});})().catch(error=>{if(entries.get(key)===entry)entries.delete(key);throw error;});
   entries.delete(key);entries.set(key,entry);if(entries.size>maxEntries)entries.delete(entries.keys().next().value);
  }
  return (await entry.promise).clone();
 };
}
