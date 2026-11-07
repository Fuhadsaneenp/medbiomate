process.env.NODE_ENV ||= 'production';
process.env.HOST ||= '0.0.0.0';
process.env.MEDBIOMATE_API_ORIGIN ||= 'https://api.medbiomate.com';
process.env.MEDBIOMATE_REMOTE_BACKEND='1';
process.env.MEDBIOMATE_STAGING ||= '1';
await import('./server.mjs');
