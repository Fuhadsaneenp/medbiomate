// Keep browsing jobs and applying free of full-screen ad interruptions.
export function protectJobNavigation(root = document) {
  for (const link of root.querySelectorAll('a[href]')) {
    let url;
    try { url = new URL(link.getAttribute('href'), location.origin); } catch { continue; }
    if (link.classList.contains('apply') || (url.origin === location.origin &&
      /^\/(?:jobs?|employers?|category|job-location|nurse-jobs-in-uae)(?:\/|$)/.test(url.pathname))) {
      link.setAttribute('data-google-vignette', 'false');
    }
  }
}
