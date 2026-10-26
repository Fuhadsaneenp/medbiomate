# TriKonet job-entry features ported — 26 October 2026

References fetched into isolated temporary checkouts:
- `medbiomate/trikonet` at `4210a60`: latest job import controls, matching, description cleanup, company-address reuse and calendar-year defaults.
- `medbiomate/trikonet_backend` at `b04acde`: authenticated link/text importer and address helpers.

Medbiomate's existing admin shell, data, identities and fast background-loading fixes remain in place. The changes are selectively ported, not a wholesale backend replacement.

## Available under Admin → Jobs → Add New Job

- Import details from a single HTTPS job URL.
- Paste a job announcement when a source site blocks fetching.
- Parse JSON-LD, LinkedIn public job/post content, Oracle and SuccessFactors job markup where supported by the upstream parser.
- Match the imported company against existing Medbiomate employers; ambiguous/unmatched names require selection.
- Suggest the closest existing job category; publishing requires a selected category.
- Preserve safe paragraphs, bullets and emphasis, without source scripts or event handlers.
- Default new application deadline and expiry to one calendar year ahead, including leap-day clamping; existing jobs retain their dates.
- Reuse a saved company address or its previous local job address, without overwriting manually entered fields.

Imported details remain a draft for review. Salary, employer, category, dates and application destination should be checked before publishing. Private/local network targets are blocked by the upstream fetcher. Sites requiring authentication or blocking automated access may need pasted text.

Validation: 21 upstream parser/date/matching/description tests passed; existing admin regression tests passed; DOM check opens both creation views while requests remain pending; authenticated HTTP fixture imported pasted text and passed existing publish/edit/delete/session checks. Browser access remained disabled, so the new importer controls have not received a live visual check.
