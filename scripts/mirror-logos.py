import concurrent.futures,urllib.request,pathlib,json,hashlib
root=pathlib.Path(__file__).resolve().parents[1];manifest=json.loads((root/'data/asset-manifest.json').read_text());datasets={k:json.loads((root/'backend/data'/f'{k}.json').read_text()) for k in ['jobs','employers']};urls=set()
for rows in datasets.values():
 for row in rows:
  for key,value in row.get('metas',{}).items():
   if key.endswith('_logo') and isinstance(value,str) and value.startswith('https://www.medbiomate.com/'):urls.add(value)
def download(url):
 if url in manifest and (root/'public'/manifest[url].lstrip('/')).exists():return url,manifest[url]
 path='/assets/'+hashlib.sha256(url.encode()).hexdigest()[:20]+pathlib.Path(url.split('?')[0]).suffix
 try:
  with urllib.request.urlopen(url,timeout=20) as r:raw=r.read()
  (root/'public'/path.lstrip('/')).write_bytes(raw);return url,path
 except:return url,None
success=0;failed=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 for i,(url,path) in enumerate(pool.map(download,urls)):
  if path:manifest[url]=path;success+=1
  else:failed.append(url)
  if i%200==0:print('Mirrored',i,'/',len(urls),flush=True)
for k,rows in datasets.items():
 for row in rows:
  for key,value in row.get('metas',{}).items():
   if key.endswith('_logo') and isinstance(value,str) and value in manifest:row['metas'][key]=manifest[value]
 (root/'backend/data'/f'{k}.json').write_text(json.dumps(rows,ensure_ascii=False))
(root/'data/asset-manifest.json').write_text(json.dumps(manifest,indent=2));(root/'data/logo-mirror-report.json').write_text(json.dumps({'mirrored':success,'failed':failed},indent=2));print('Finished',success,'failed',len(failed),flush=True)
