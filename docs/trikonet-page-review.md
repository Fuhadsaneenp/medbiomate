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
