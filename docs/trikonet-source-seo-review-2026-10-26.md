# TriKonet source migration and SEO review — 26 October 2026

## Result and scope

Medbiomate now serves the supplied TriKonet public application rather than the previous collection of custom replacement screens. `public/source-runtime/` contains 49 adapted UI modules/styles, their shell and supporting visual assets. `source-site.mjs` provides route metadata, crawlable initial content and record data; `server.mjs` continues to proxy the existing Medbiomate backend and authenticated admin console.

This is a source implementation migration, not a claim that every live state has passed a pixel comparison. The supplied checkout is dated 13 October. The live site currently identifies its app as `20261022-work-credit-16`; its ad module is `20261021-pagination`. Those live files were inspected on 26 October. The live directory still uses the same overall industry-strip/search/sidebar/two-column-card pattern. Browser access was disabled during the review, before tablet and remaining visual states could be completed.

## Page families

| Pages | Implementation |
| --- | --- |
| Homepage | Source hero, search/autocomplete, popular terms, category grid, employer carousel and how-it-works section. The articles section remains removed per the user's preceding instruction. |
| Header/footer | Original menu components, dropdowns, mobile navigation, account links, guide links and footer structure. Medbiomate logo/blue palette and domain replace TriKonet identity. |
| Jobs, category/location/type archives | Source search, filters, cards, sidebar resume promotion, sharing and pagination, backed by Medbiomate records. |
| Employer directory | Source industry carousel, filter sidebar, search, sort and cards; complete-catalogue sorting/filtering occurs before pagination. Thirty cards per page match the reference. |
| Employer profiles | Source overview/jobs/reviews/claim screens and existing backend integration. Missing founded date/company size displays “Not specified” instead of invented defaults. |
| Job details | Source detail components, employer details, application links, saved jobs, reporting, related jobs and share controls. |
| Resume tools | Original library/editor implementation and existing plugin templates. Local browser check reached the template chooser. No personal resume was uploaded or sent during testing. |
| Account pages | Source sign-in, registration, profile workspace and saved/applied/followed collections, using the existing authentication APIs. |
| About/contact/FAQ/legal/blog | Source templates and interactions, Medbiomate content where present. Contact enquiries persist through the existing contact API. |
| Admin | Existing source-derived standalone console is retained, including the previously verified form-control/Edit fix and cookie authentication. |

## Current live ad behaviour

The supplied ad module differed from the live version. The importer now applies the live placement changes: listing ads follow cards 5 and 10; on job details the two extra company/feed insertion calls are removed. Description, bottom, blog and employer-jobs placements otherwise retain the source logic. The homepage excludes these display slots. Account/resume pages exclude the loader. Medbiomate's existing publisher/slot IDs are retained; TriKonet's IDs and analytics account are not copied. Ad fill, approval and auto-ad behaviour remain controlled by the publisher's ad account, so identical third-party creatives cannot be guaranteed.

## SEO findings and implemented corrections

1. **Server metadata:** public routes receive one title, description, canonical, robots directive, social tags and a single JSON-LD block. The old generic “Candidate Dashboard” server fallback no longer labels unrelated pages. JavaScript preserves the server's canonical and indexing policy.
2. **Crawlable content:** record descriptions and directory links are present in initial HTML. Category and location directories expose real archive links. The no-JavaScript fallback is visible rather than trapped behind the preloader.
3. **Canonicalization:** legacy paths redirect permanently to the source URL conventions. Public paginated directories retain `?page=N` in their canonicals. Sort/filter/search variants are excluded from indexing; account and editor states are excluded as well. Resume aliases share the main builder canonical.
4. **Sitemaps:** taxonomy links use `/category/:slug`; public resume routes are included. Account/admin paths are excluded and homepage duplicates are removed. The legacy hospital blog category redirects to the blog directory.
5. **Job structured data:** JobPosting is emitted only for a real record with a valid date, employer, description and supported location. Explicit database country/locality fields take precedence; recognized imported country/city labels map to their own countries, rather than assigning all GCC jobs to the UAE. Expired or filled records do not emit a current JobPosting. No salary is invented.
6. **Identity/content:** seeded TriKonet jobs/articles, author identities, mock hiring companies and hard-coded directory counts are not used as Medbiomate records. The footer no longer asserts TriKonet's Dubai registration for Medbiomate.
7. **Interactions:** the source's fake job-alert success popup now calls the real preference API. Local preferences persist without requiring MySQL; sending mail still requires the configured delivery service. Contact/service forms report success only after the local API accepts their content.

These changes follow [Google's canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), and [JobPosting requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

## Verification and limits

- Desktop browser: homepage, job directory/detail, employer directory, resume library and template chooser inspected.
- Mobile: employer directory checked at 375 × 812; 30 records rendered and no horizontal document overflow was observed. A heading contrast issue was then corrected in the source CSS.
- Browser access subsequently became disabled in Work settings. Tablet checks, full visual regression, every menu/modal state, and production Core Web Vitals have not been verified.
- Automated checks cover source imports/page families/ad placement, routes, canonical/noindex policy, structured-data conditions, catalogue privacy, original descriptions, directory sorting/counts and admin editing.
- HTTP smoke covers 32 route variants plus redirects, category links, pagination and sitemaps. Separate fixtures verify admin session/publish/edit/delete and candidate alert preference persistence; fixture accounts/jobs are removed afterward.
- This run does not deploy or change the live TriKonet or Medbiomate sites. Search Console, production indexing, Rich Results Test and ad-account delivery still require the deployed site and the owner's service configuration.

## Medbiomate content correction

The reference layout now uses Medbiomate’s original healthcare illustration and homepage tagline. About/FAQ/contact content describes Medbiomate’s GCC healthcare focus; the inherited founders/platform-history story has been removed. Popular searches, menu categories and footer guides now focus on healthcare specialties. Static corporate employer taglines and the Bateel sample fallback are disabled; real employer names/descriptions remain sourced from the Medbiomate catalogue. The source course-enrolment promotion is replaced with medical coding career links and Medbiomate’s own contact details. `scripts/medbiomate-content.py` reapplies these corrections when the UI source is imported again.
