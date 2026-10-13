"""Read-only public WordPress import; never imports users or credentials."""
import sys
import urllib.request, urllib.parse, json, pathlib, re, html, concurrent.futures, hashlib, time
ROOT=pathlib.Path(__file__).resolve().parents[1]; BASE='https://www.medbiomate.com'
def get(url):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'MedbiomateMigration/1.0'}),timeout=60) as r:return r.read(),dict(r.headers)
  except Exception:
   if attempt==2:raise
   time.sleep(1)
def collection(name):
 raw,h=get(BASE+'/wp-json/wp/v2/'+name+'?per_page=100&page=1'); rows=json.loads(raw); pages=int(h.get('X-WP-TotalPages','1'))
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for batch in pool.map(lambda p:json.loads(get(BASE+'/wp-json/wp/v2/'+name+'?per_page=100&page='+str(p))[0]),range(2,pages+1)):rows+=batch
 print(name,len(rows),flush=True);return rows
names={'jobs':'job_listing','employers':'employer','posts':'posts','pages':'pages'}
if '--pages-only' not in sys.argv:
 for key,name in names.items():
  rows=collection(name)
  for r in rows:
   r['title']['rendered']=html.unescape(r['title']['rendered']);r['terms']={};r['link']=r['link'].replace(BASE,'')
   for group in ['type','category','location','tag']:
    values=r.get('metas',{}).get('_job_'+group,{})
    if isinstance(values,dict):r['terms']['job_listing_'+group]=[{'id':int(i),'name':n} for i,n in values.items()]
  (ROOT/'backend/data'/f'{key}.json').write_text(json.dumps(rows,ensure_ascii=False))
 tax={}
 for group in ['type','category','location','tag']:
  tax[{'type':'types','category':'categories','location':'locations','tag':'tags'}[group]]=collection('job_listing_'+group)
 (ROOT/'backend/data/taxonomies.json').write_text(json.dumps(tax,ensure_ascii=False))
# Cache exact public page markup and every stylesheet, image, and font it uses.
assets=json.loads((ROOT/'data/asset-manifest.json').read_text()) if (ROOT/'data/asset-manifest.json').exists() else {}; failures=[]
def asset(url):
 url=html.unescape(urllib.parse.urljoin(BASE,url))
 if not url.startswith(('http://','https://')):return url
 if url in assets:return assets[url]
 path=urllib.parse.urlparse(url).path; ext=pathlib.Path(path).suffix or '.bin'; target='/assets/'+hashlib.sha256(url.encode()).hexdigest()[:20]+ext;assets[url]=target
 try:
  raw,_=get(url)
  if ext=='.css':
   text=raw.decode();text=re.sub(r'url\(\s*[\'"]?([^\)\'"\s]+)[\'"]?\s*\)',lambda m:'url("'+asset(urllib.parse.urljoin(url,m[1]))+'")' if not m[1].startswith('data:') else m[0],text);raw=text.encode()
  (ROOT/'public'/target.lstrip('/')).write_bytes(raw)
 except Exception as e:failures.append({'url':url,'error':str(e)});return url
 return target
paths=sys.argv[2:] if '--pages-only' in sys.argv else ['/','/about/','/contact/','/terms/','/faq/']
report=json.loads((ROOT/'data/routes.json').read_text()) if (ROOT/'data/routes.json').exists() else {}
for path in paths:
 s=get(BASE+path)[0].decode()
 s=re.sub(r'<script\b[^>]*>.*?</script\s*>','',s,flags=re.S|re.I)
 s=re.sub(r'<link\b[^>]*>',lambda m: re.sub(r'''href=([\'"])(.*?)\1''',lambda x:'href="'+asset(x[2])+'"',m[0]) if 'stylesheet' in m[0] else m[0],s)
 s=re.sub(r'(src|poster)=([\'"])(.*?)\2',lambda m:m[1]+'="'+asset(m[3])+'"' if any(e in m[3] for e in ['.png','.jpg','.jpeg','.webp','.gif','.svg']) else m[0],s)
 s=re.sub(r'\s+srcset=([\'"]).*?\1','',s)
 s=s.replace(BASE,'').replace('https://medbiomate.com','')
 s=re.sub(r'<link[^>]+(?:api.w.org|EditURI|wlwmanifest)[^>]*>','',s)
 s=s.replace('</head>','<link rel="stylesheet" href="/app.css"></head>').replace('</body>','<script type="module" src="/app.js"></script></body>')
 name='index' if path=='/' else path.strip('/').replace('/','-')
 (ROOT/'public'/f'{name}.html').write_text(s);report[path]=f'{name}.html';print('page',path,flush=True)
(ROOT/'data/routes.json').write_text(json.dumps(report));(ROOT/'data/asset-manifest.json').write_text(json.dumps(assets,indent=2));(ROOT/'data/import-report.json').write_text(json.dumps({'importedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'records':{k:len(json.loads((ROOT/'backend/data'/f'{k}.json').read_text())) for k in names},'assets':len(assets),'assetFailures':failures},indent=2))
