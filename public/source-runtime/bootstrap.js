// A failed module or stalled request must never leave the full-page loader open.
export function showLoadingRecovery(error) {
  console.warn('Medbiomate page initialization interrupted:', error);
  const app = document.getElementById('app');
  const serverJob = app?.hasAttribute('data-server-rendered');
  if (!serverJob && app) {
    const main = document.createElement('main');
    main.style.cssText = 'max-width:720px;margin:80px auto;padding:24px;font-family:system-ui,sans-serif';
    const title = document.createElement('h1');
    title.textContent = 'This page is taking longer than expected';
    const message = document.createElement('p');
    message.textContent = 'Please retry to load the latest jobs. Your saved jobs and account have not been changed.';
    const retry = document.createElement('button');
    retry.type = 'button';retry.textContent = 'Retry';retry.addEventListener('click', () => location.reload());
    const home = document.createElement('a');
    home.href = '/';home.textContent = 'Return to Medbiomate';home.style.marginLeft = '20px';
    home.setAttribute('data-google-vignette','false');
    main.append(title,message,retry,home);app.replaceChildren(main);
  }
  app?.removeAttribute('inert');app?.removeAttribute('aria-busy');app?.removeAttribute('data-seo-pending');
  document.documentElement.classList.remove('page-loading');
  document.getElementById('page-preloader')?.remove();document.getElementById('seo-loading')?.remove();
}
const timeout = setTimeout(() => {
  if (document.documentElement.classList.contains('page-loading')) showLoadingRecovery(new Error('Page loading timed out'));
}, 12000);
import('./app.js?v=20261026-medbiomate-parity').catch(showLoadingRecovery).finally(() => clearTimeout(timeout));
