"""Audit every imported page/archive path and sitemap coverage against local preview."""
import json,urllib.request,urllib.parse,concurrent.futures,xml.etree.ElementTree as E,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1];base='http://127.0.0.1:3000';original=json.loads((root/'data/original-sitemap-audit.json').read_text());ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
def get(path):
 try:
  with urllib.request.urlopen(base+path,timeout=30) as r:return r.status,r.read().decode(errors='replace')
 except urllib.error.HTTPError as e:return e.code,e.read().decode()
paths={urllib.parse.urlparse(u).path for k,urls in original.items() for u in urls if k not in ['job_listing','employer']}
for k in ['pages','posts']:paths.update(r['link'] for r in json.loads((root/'backend/data'/f'{k}.json').read_text()))
paths.update(['/jobs','/employers','/job/insurance-coordinator-76','/job/specialist-anesthesia-18','/employer/burjeel-hospital','/employer/hukma-al-khair-medical-co','/sitemap.xml','/sitemap_index.xml','/page-sitemap.xml','/job_listing-sitemap.xml','/employer-sitemap.xml','/job_listing_category-sitemap.xml'])
def audit(path):
 status,body=get(path);return {'path':path,'status':status,'canonicalCorrect':f'https://www.medbiomate.com{path.rstrip("/")}' in body if path!='/' and not path.endswith('.xml') else True,'rawShortcodes':sorted(set(re.findall(r'\[(?:wp_job_board[^\]]*|woocommerce[^\]]*)\]',body)))}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(audit,sorted(paths)))
_,xml=get('/sitemap.xml');local={e.text for e in E.fromstring(xml).findall('.//s:loc',ns)};missing={k:[u for u in urls if u.rstrip('/') not in {v.rstrip('/') for v in local}] for k,urls in original.items()};missing={k:v for k,v in missing.items() if v}
status,body=get('/this-page-does-not-exist');report={'checkedRoutes':len(rows),'failures':[r for r in rows if r['status']!=200 or not r['canonicalCorrect']],'missingOriginalSitemapPaths':missing,'unknownRouteStatus':status,'sitemapUrls':len(local),'routes':rows};(root/'data/route-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='routes'},indent=2))
