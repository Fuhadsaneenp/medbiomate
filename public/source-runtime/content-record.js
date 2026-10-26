// Retry transient API failures while preserving real 404 responses.
export async function fetchContentResponse(fetcher, url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(url, {signal:AbortSignal.timeout(30000)});
      if (response.status >= 500 && attempt === 0) continue;
      return response;
    } catch (error) { if (attempt === 1) throw error; }
  }
}
// Check both sources concurrently; a transient local failure must not hide an imported record.
export async function loadContentRecord(fetcher, base, type, slug) {
  const encoded = encodeURIComponent(slug);
  const remote = () => fetchContentResponse(fetcher, `${base}/api/wp/${type}?slug=${encoded}`).then(async r => {
    if (!r.ok) throw new Error('Imported content unavailable');
    return (await r.json())[0] || null;
  });
  if (type === 'posts') return remote();
  const local = fetchContentResponse(fetcher, `${base}/api/local/${type === 'employer' ? 'employers' : 'jobs'}/${encoded}`).then(async r => {
    if (r.ok) return r.json();
    if (r.status === 404) return null;
    throw new Error('Saved content unavailable');
  });
  // Start both reads, but a saved override is authoritative: do not wait for
  // a slow imported source after the saved record has already arrived.
  const importedReady = remote().then(value => ({status:'fulfilled',value}), reason => ({status:'rejected',reason}));
  const saved = await local.then(value => ({status:'fulfilled',value}), reason => ({status:'rejected',reason}));
  if (saved.status === 'fulfilled' && saved.value) return saved.value;
  const imported = await importedReady;
  if (saved.status === 'fulfilled' && saved.value) return saved.value;
  if (imported.status === 'fulfilled' && imported.value) return imported.value;
  if (saved.status === 'fulfilled' && imported.status === 'fulfilled') return null;
  throw new Error('Content temporarily unavailable');
}
