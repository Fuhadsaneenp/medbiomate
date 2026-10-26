const escapeAttr = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const footerGuideRows = [{"id": "job-categories", "defaultOpen": true, "columns": [{"title": "Nursing Jobs", "links": [{"label": "Nurse Jobs", "url": "/category/nurse-jobs"}, {"label": "Registered Nurse Jobs", "url": "/category/registered-nurse-jobs"}, {"label": "Staff Nurse", "url": "/category/staff-nurse"}, {"label": "School Nurse Jobs", "url": "/category/school-nurse-jobs"}, {"label": "Home Nurse Jobs", "url": "/category/home-nurse-jobs"}]}, {"title": "Doctors & Specialists", "links": [{"label": "Specialist Doctor Jobs", "url": "/category/specialist-doctor-jobs"}, {"label": "Consultant Doctor Jobs", "url": "/category/consultant-doctor-jobs"}, {"label": "General Practitioner Jobs", "url": "/category/general-practitioner-jobs"}, {"label": "Dentist Jobs", "url": "/category/dentist-jobs"}, {"label": "Radiologist Jobs", "url": "/category/radiologist-jobs"}]}, {"title": "Pharmacy & Allied Health", "links": [{"label": "Pharmacy Jobs", "url": "/category/pharmacy-jobs"}, {"label": "Pharmacist Jobs", "url": "/category/pharmacist-jobs"}, {"label": "Physiotherapist Jobs", "url": "/category/physiotherapist-jobs"}, {"label": "Medical Laboratory Jobs", "url": "/category/medical-laboratory-jobs"}, {"label": "Biomedical Jobs", "url": "/category/biomedical-jobs"}]}, {"title": "Healthcare Support", "links": [{"label": "Medical Coder Jobs", "url": "/category/medical-coder-jobs"}, {"label": "Insurance Coordinator Jobs", "url": "/category/insurance-coordinator-jobs"}, {"label": "Medical Insurance Jobs", "url": "/category/medical-insurance-jobs"}, {"label": "Administration Jobs", "url": "/category/administration-jobs"}, {"label": "Healthcare Assistant Jobs", "url": "/category/healthcare-assistant-jobs"}]}]}];

function footerCategoriesAccordion() {
  const rowsHtml = footerGuideRows.map(row => {
    const cols = row.columns;
    const headerColsHtml = cols.map((col, idx) => {
      const isLast = idx === cols.length - 1;
      return `<div class="footer-acc-header-col${isLast ? ' footer-acc-header-col-last' : ''}">
        <span class="footer-acc-header-title">${escapeAttr(col.title)}</span>
        ${isLast ? `
        <span class="footer-acc-arrow-indicator" aria-hidden="true">
          <svg class="footer-acc-chevron-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>` : ''}
      </div>`;
    }).join('');

    const bodyColsHtml = cols.map(col => `
      <div class="footer-acc-col">
        <h4 class="footer-acc-col-mobile-title">${escapeAttr(col.title)}</h4>
        <ul class="footer-acc-links">
          ${col.links.map(l => `<li><a href="${escapeAttr(l.url)}">${escapeAttr(l.label)}</a></li>`).join('')}
        </ul>
      </div>
    `).join('');

    return `
      <div class="footer-acc-row${row.defaultOpen ? ' open' : ''}" data-acc-row="${escapeAttr(row.id)}">
        <button type="button" class="footer-acc-header" aria-expanded="${row.defaultOpen ? 'true' : 'false'}">
          <div class="footer-acc-header-grid">
            ${headerColsHtml}
          </div>
        </button>
        <div class="footer-acc-drawer">
          <div class="footer-acc-drawer-inner">
            <div class="footer-acc-body-grid">
              ${bodyColsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="wrap footer-categories-container">
    <div class="footer-acc-wrapper">
      ${rowsHtml}
    </div>
  </div>`;
}

function footerQuickBar() {
  return `<div class="footer-quick-bar">
    <div class="wrap footer-quick-container">
      <div class="footer-quick-links">
        <a href="/jobs">Browse All Jobs</a>
        <span class="footer-quick-sep">|</span>
        <a href="/employers">Top Employers</a>
        <span class="footer-quick-sep">|</span>
        <a href="/about">About Us</a>
        <span class="footer-quick-sep">|</span>
        <a href="/contact">Contact</a>
        <span class="footer-quick-sep">|</span>
        <a href="/privacy-policy">Privacy Policy</a>
        <span class="footer-quick-sep">|</span>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
  </div>`;
}

export function renderSiteFooter(siteChrome = {}){
  return `<footer class="footer site-footer-columns site-footer-standard" style="background:#202124;color:#ffffff">
    <div class="wrap footer-grid">
      <div>
        <img src="${escapeAttr(siteChrome.footerLogo || '/source-runtime/assets/logo-white.png')}" class="medbiomate-footer-logo" alt="Medbiomate">
        <p>${escapeAttr(siteChrome.footerEmail||'info@medbiomate.com')}</p>
      </div>
      <div class="footer-intro-cta">
        <p class="footer-intro-kicker">CAREERS ACROSS THE UAE &amp; GCC</p>
        <h2>Connect with the right opportunity.</h2>
        <p>Discover healthcare roles or connect with qualified professionals for your healthcare team.</p>
        <div class="footer-intro-actions">
          <a href="/jobs">Browse Jobs</a>
          <a href="/submit-job">Post a Job</a>
        </div>
      </div>
    </div>
    ${footerCategoriesAccordion()}
    ${footerQuickBar()}
    <div class="wrap footer-bottom">
      <div class="footer-bottom-info">
        <p class="footer-legal-note">${escapeAttr(siteChrome.footerLegalNote||'Medbiomate connects healthcare professionals with employers and career opportunities across the UAE & GCC.')}</p>
        <p class="footer-copy-text">${escapeAttr(siteChrome.footerCopyright||'© 2026 Medbiomate. All Right Reserved.')}</p>
      </div>
    </div>
  </footer>`;
}
