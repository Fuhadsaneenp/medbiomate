// The main www domain is indexable; temporary preview deployments remain noindex.
process.env.MEDBIOMATE_STAGING='0';
await import('./start-frontend.mjs');
