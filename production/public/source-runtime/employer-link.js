export function employerProfileHref(job) {
  if (job.employerSlug) return `/employer/${encodeURIComponent(job.employerSlug)}`;
  try {
    const url = new URL(job.employerUrl || '', 'https://www.medbiomate.com');
    if (/^\/employer\/[^/]+\/?$/.test(url.pathname)) return url.pathname;
  } catch {}
  return '/employers';
}
