import {readFile,stat} from 'node:fs/promises';import {join} from 'node:path';import {createHash} from 'node:crypto';
// A bounded cache of public code/styles only. Changed source always invalidates it.
export function createStaticAssetReader(root,{maxBytes=8*1024*1024}={}){
 const entries=new Map();let total=0;
 return async function(key){
  const path=join(root,'public',key),info=await stat(path),version=info.mtimeMs+':'+info.size;
  let entry=entries.get(key);if(entry?.version===version)return entry.bytes;
  const source=await readFile(path);let bytes=source;
  try{const manifest=JSON.parse(await readFile(join(root,'.optimized-assets/manifest.json'),'utf8'));if(manifest[key]?.sourceHash===createHash('sha256').update(source).digest('hex'))bytes=await readFile(join(root,'.optimized-assets',key));}catch{}
  entry=entries.get(key);
  if(entry){total-=entry.bytes.length;entries.delete(key)}
  if(bytes.length<=maxBytes){while(total+bytes.length>maxBytes&&entries.size){const oldest=entries.keys().next().value;total-=entries.get(oldest).bytes.length;entries.delete(oldest)}entries.set(key,{version,bytes});total+=bytes.length;}
  return bytes;
 };
}
