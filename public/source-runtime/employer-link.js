export function employerProfileHref(job) {
  try {
    const url = new URL(job.employerUrl || '', 'https://www.medbiomate.com');
    if (/^\/employer\/[^/]+\/?$/.test(url.pathname)) return url.pathname;
  } catch {}
  const slug = job.employerSlug || String(job.company || job.employerName || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug ? `/employer/${encodeURIComponent(slug)}` : '/employers';
}
