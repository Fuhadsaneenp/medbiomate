Latest implementation and verification: [26 October source migration review](trikonet-source-seo-review-2026-10-26.md). The notes below describe the superseded October 19 replacement UI.

# Medbiomate page review — 19 October 2026

Reference: supplied TriKonet frontend in the neighbouring `Trikonet/frontend` checkout, plus the live TriKonet homepage. The live `/employers` route returned its plain server-rendered fallback during review, so its supplied full frontend implementation was used for the directory design.

## Page coverage

| Medbiomate route | TriKonet reference and implementation |
| --- | --- |
| `/` | Hero, rounded search, popular terms, specialty grid, top employers, how it works, recent articles |
| `/jobs-list`, category and location archives | Shared search, filter sidebar, job cards, removable selected filters and pagination |
| `/employers-list` | Industry carousel, company search, company type/location/vacancy filters, global sorting, two-column company cards and pagination |
| `/job/:slug` | Existing supplied detail template, company information, related jobs, bookmarks, report controls; career profile link and application-open tracking |
| `/employer/:slug` | Existing supplied profile template, overview/jobs/reviews, following state and linked company filters |
| `/job-categories`, `/job-locations` | Searchable complete category/location directories linked to the job archives |
| `/login`, `/register` | Full account entry page with brand panel, form labels, password visibility and existing authentication API |
| `/forgot-password` | Three-step email/code/password flow using the existing recovery API |
| `/dashboard`, `/profile`, `/saved-jobs`, `/applied-jobs`, `/followed-companies` | Shared career workspace navigation, real browser lists, profile API integration, signed-out states |
| `/blog`, `/blog/:slug` | Article cards, search, and readable article layout using Medbiomate's imported posts |
| `/about`, `/contact`, `/faq` | Shared headings and typography, Medbiomate introduction, contact form and native FAQ accordions |
| `/terms`, `/privacy-policy`, `/disclaimer` | Shared readable policy layout; imported legal wording retained |
| `/submit-job` | Employer entry page linking to the actual admin console and team contact |

Header dropdowns, mobile navigation, skip link and the footer are shared across these public routes. Blue is retained as the Medbiomate accent. No invented jobs, ratings, company counts, articles or user statistics were added. Existing utility-page content remains available rather than replacing tools with decorative mockups.

## Data and behavior

The company directory API computes public counts after merging imported and local records. Search, sorting, vacancy filters and pagination run across the whole company catalogue. Draft employers and jobs are excluded. API responses expose only directory summary fields.

Saved jobs, followed companies and opened applications use the existing Medbiomate browser storage. They are not a cross-device application system. Selecting an external application link is tracked as opened to apply, not a confirmed application submission. Profile editing requires sign-in. Password recovery requires the existing email configuration. Contact messages retain the existing local file-backed behavior.

## Validation

- Six dedicated directory tests cover sorting/filtering before pagination, real facets, draft edits, employer matching, page bounds and public response fields.
- Existing six migration tests pass.
- JavaScript syntax checks cover the new modules and existing application entry points.
- Browser checks cover employer search, company profile, mobile filters/menu, job search/detail/bookmarks and the saved-job workspace.
- Main account, contact, about, FAQ, blog, category and policy layouts checked at 390px; desktop employer and account layouts also inspected.

## Route and source parity correction

The canonical public directories now follow TriKonet: `/jobs`, `/employers`, and `/category/:slug`. Legacy Medbiomate directory and category links redirect permanently while preserving search parameters. Existing imported jobs retain `/job/:slug`; newly published jobs use their stored `/jobs/:slug` URL. The server resolves both through `/api/job-url`, redirects aliases to the published URL, and provides the resolved slug to the detail controller.

The original TriKonet job-listing function and listing styles are now used, with Medbiomate data and blue accents. The previous separate admin-login interpretation was replaced with the original TriKonet `adminLoginPage` template. Authentication remains server-side. The full original admin workspace already matches the supplied source after brand normalisation: 33 navigation views, including job/company editors, taxonomies, claims/reports, candidates, media, posts, pages, SEO and user management. The base stylesheet required by the standalone admin shell was restored. Named logo assets now resolve to Medbiomate.

Company profile job rows now receive their employer identity and canonical public URL, fixing empty Jobs tabs and links to newly published jobs. The original résumé library/CV builder engine, stylesheet and plugin assets are included, with the same résumé routes and Medbiomate API integration.

Validation: 20 automated tests; localhost admin login/session/logout, catalogue pagination, temporary job publishing/deletion, both job URL forms and redirect checks. Temporary records are removed afterward. Source rendering confirms the company Jobs tab and full admin workspace render. **Browser access was disabled in Work settings during this correction, so the latest source-derived layouts have not received a fresh visual sign-off.** This is not a claim of pixel-perfect verification of every screen or of configured production email, résumé export and external services. See `trikonet-parity-audit.json` for the source comparison.
