# Medbiomate WordPress → Node web app

Local migration built from the public Medbiomate website and the supplied Trikonet backend source. The original Trikonet checkout is unchanged.

## Run

Requires Node 24+ and Python 3 for content imports. On this computer, `./start-local.sh` also finds the bundled Node runtime automatically.

```sh
git clone --recurse-submodules https://github.com/Fuhadsaneenp/medbiomate.git
cd medbiomate
npm install --prefix backend
npm run dev
```

Website: http://127.0.0.1:3000
Admin console: http://127.0.0.1:3000/admin
API is proxied through the website to port 4173.

The `backend/` directory is a Git submodule pointing to https://github.com/Fuhadsaneenp/medbiomate_backend. For an existing clone, run `git submodule update --init --recursive`, then `npm install --prefix backend`. Dependencies and private runtime data are excluded from both repositories.

## Included

- Original homepage, about, contact, terms, FAQ, job directory, employer directory, and job-detail theme markup, styles, logos, illustration, and fonts, cached locally.
- 13,113 public jobs, 2,134 employers, 46 public CMS pages, 1 post, and job taxonomies imported on October 13, 2026. Original descriptions, slugs, categories, locations, and application destinations retained.
- Job search, location/category filtering, pagination, employer browsing, server-rendered job details, outbound applications, local-browser bookmarks, candidate sign-in/register, and dashboard.
- Trikonet's Node/MySQL backend and admin console source, configured for a separate Medbiomate database. No Trikonet credentials, user records, candidate files, or production environment files copied.
- Local preview sessions persist hashed tokens in private files; production uses the original MySQL session stores.
- Contact messages are stored in `data/contact-messages.json`; email delivery needs an integration before launch.
- Sitemap generated from imported public slugs.

## Administrator setup

No default administrator/password is shipped. To create a local preview administrator, provide the password through stdin to `node scripts/create-local-admin.mjs EMAIL NAME`; it must be at least 12 characters. The script is intentionally local-only. Do not place credentials in shell history or commit runtime data.

## Production preparation

1. Provision a **dedicated** MySQL database and user. Set the `MEDBIOMATE_DB_*` variables from `backend/.env.example`. Do not use the original Trikonet database.
2. Set `NODE_ENV=production` and `MEDBIOMATE_LOCAL_MODE=0`. The backend will require MySQL at startup; candidate/admin state, sessions, uploads and optional services retain the supplied backend's database requirements.
3. Configure Medbiomate's storage, email, Google OAuth, alerts and any EMS integration using its own credentials and domains. Review the copied integration modules before enabling them. No production integration is activated by this migration.
4. Bootstrap an administrator in the dedicated application state through your deployment account workflow, and verify publishing/editing, auth, candidate data and file uploads against MySQL.
5. Import existing private WordPress accounts/applications separately from an authorized export. The public API cannot export passwords or private records.
6. Complete route-by-route visual and behavior review, deploy to Node hosting, and only then switch DNS from WordPress. This project has not been deployed and the live site has not been changed.

## Verification and known limits

`npm run check` checks syntax; `npm test` checks imported job/application content, public-data credential isolation, session persistence/logout and job-template substitution.

Desktop and mobile homepage, mobile navigation, directory, job details, employer profiles and admin sign-in browser previews were checked. Search was verified against keyword and location filters. `node tests/http-smoke.mjs` verified admin authentication, catalogue pagination, test job publishing/public visibility/deletion and logout using temporary local fixtures. This is a working local migration, **not yet a verified ditto production replacement**. Some inherited WordPress plugin controls and less-used CMS page layouts still need conversion; Employer details use the original employer template; uncached CMS pages use the shared web-app layout. Candidate directory/private profiles, password recovery delivery, alert delivery, mobile APIs, full admin publishing, and third-party integrations require dedicated MySQL and service verification. Blog has one public post; private/unpublished content is not imported. Contact delivery is file-backed only. Some calculator/quiz and other plugin interactions are preserved visually but still need replacement JavaScript. Three optional Leaflet map icons return 404 on the source site. 2,109 employer logos were mirrored locally; four unavailable source logos are listed in `data/logo-mirror-report.json`. Content images outside cached pages may still reference original media and should be reviewed before retiring WordPress hosting.

Refresh public data: `npm run import:wordpress`. The importer is read-only against WordPress but replaces local imported snapshots; back up local changes first. It never imports private users or passwords.

### Trikonet-inspired design
The public app uses shared navigation, footer, typography, and card styles inspired by the supplied Trikonet frontend, with Medbiomate branding and blue accents. Jobs and employers have responsive search, listing cards, page sizes, and pagination. Job filters and bookmarks remain functional. Filtered result counts include every matching record rather than the first API page. The source healthcare content and application destinations are retained.

Ad placements now use the supplied Trikonet display-ads module adapted to Medbiomate's existing publisher `ca-pub-4613840941360196` and responsive slot `6468852807`. Job detail, listing, and employer feed positions follow Trikonet. The loader runs once only on medbiomate.com; localhost reserves preview spaces without making live ad requests. Real ad fill must be verified after deployment. The copied report modal saves reports to private local `data/job-reports.json` through `/api/job-reports`.

### Public page consistency update
The main public pages now share the supplied TriKonet layout patterns with Medbiomate branding, including the company directory, account pages, career workspace, article pages, contact/FAQ and policy layouts. See [the detailed page review](docs/trikonet-page-review.md) for route coverage, behavior and validation limits. The employer directory uses actual company/job counts with filtering and sorting before pagination. `npm test` includes the dedicated directory tests.
