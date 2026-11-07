export function isPrivatePage(path, params = new URLSearchParams()) {
  return /^\/(?:admin[^/]*|medbiomate-admin-access|login|signin|sign-in|sign-up|login-register|register|signup|logout|profile|dashboard|account|saved-jobs|applied-jobs|followed-companies|email-campaigns|submit-job)(?:\/|$)/i.test(path)
    || params.has('preview') || params.has('draft');
}
export function isPublishedRecord(record) {
  return !!record && !record.autosaved && !String(record.slug || '').startsWith('autosave-') && ['publish','published','active',''].includes(String(record.status || '').toLowerCase());
}
