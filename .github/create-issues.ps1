# Creates all backlog PBIs as GitHub Issues via the gh CLI.
# Prerequisites: install gh CLI (https://cli.github.com/) and run `gh auth login` first.
#
# Usage: .\create-issues.ps1

$repo = "Pedro-Oriques/Tabela-Aporte"

function New-Issue($title, $body, $labels) {
    $labelArg = $labels -join ","
    Write-Host "Creating: $title"
    gh issue create --repo $repo --title $title --body $body --label $labelArg
}

# ---------------------------------------------------------------------------
# FRONTEND — UX & Performance
# ---------------------------------------------------------------------------

New-Issue `
    "[FE] Add error state UI for API failures" `
    "## Problem`nAll API calls in ``lib/api.ts`` fail silently — the user sees an empty table with no explanation when the backend is unreachable or a fetch fails.`n`n## Acceptance Criteria`n- [ ] A toast notification or inline error banner appears when any fetch returns null/empty due to an error`n- [ ] Error message is human-readable and actionable`n- [ ] Auto-dismisses after a few seconds (toast) or can be dismissed manually`n`n## Notes`nConsider a lightweight toast library or a simple React context-based notification system." `
    @("frontend","ux","priority: high")

New-Issue `
    "[FE] Batch watchlist fetches to avoid unbounded Promise.all" `
    "## Problem`n``Promise.all(tickers.map(fetchValuation))`` in ``app/dashboard/page.tsx`` fires one concurrent request per ticker. With a large watchlist this hammers the backend simultaneously.`n`n## Acceptance Criteria`n- [ ] Requests are chunked (e.g. 5 at a time) or sequenced`n- [ ] Loading state reflects partial progress`n- [ ] Alternatively, a backend batch endpoint ``GET /stocks/valuation?tickers=X,Y,Z`` is added`n`n## Notes`nChunked Promise.all is the quick fix; a batch endpoint is the proper solution." `
    @("frontend","backend","performance","priority: high")

New-Issue `
    "[FE] Remove unused Recharts dependency" `
    "## Problem`nRecharts is listed in ``frontend/package.json`` but is not imported anywhere in the codebase. It adds ~300 KB to the production bundle for nothing.`n`n## Acceptance Criteria`n- [ ] Recharts removed from ``package.json``"" and ``yarn.lock``/``package-lock.json``""`n- [ ] Build succeeds and bundle size is smaller`n`n## Notes`nIf price history charts are planned (see separate PBI), re-add Recharts at that point." `
    @("frontend","performance","priority: high")

New-Issue `
    "[FE] Add empty state / onboarding hint for empty watchlist" `
    "## Problem`nWhen the watchlist is empty, the dashboard renders a blank table. A first-time user has no idea what to do next.`n`n## Acceptance Criteria`n- [ ] Empty dashboard shows a friendly prompt: e.g. ''Add stocks from the catalog to start tracking valuations'"`n- [ ] Includes a CTA link or button pointing to the /stocks page`n- [ ] Matches existing design system (dark theme, typography)" `
    @("frontend","ux","priority: high")

New-Issue `
    "[FE] Add debounce to /stocks page search input" `
    "## Problem`nThe text filter on ``/stocks`` re-renders the full stock list on every keystroke with no debounce, unlike ``SearchBar`` which has a 300 ms delay.`n`n## Acceptance Criteria`n- [ ] Search input debounced by ~300 ms before filtering the list`n- [ ] No visible UX regression" `
    @("frontend","performance","priority: medium")

New-Issue `
    "[FE] Add focus trap to DetailDrawer" `
    "## Problem`nWhen the DetailDrawer opens, keyboard focus remains in the background content. Keyboard-only users cannot navigate the drawer and the Escape key does not reliably close it.`n`n## Acceptance Criteria`n- [ ] Focus is moved into the drawer when it opens`n- [ ] Tab cycles only within the drawer while it is open`n- [ ] Escape closes the drawer`n- [ ] Focus returns to the trigger element when drawer closes`n`n## Notes`nConsider ``focus-trap-react`` or a native ``<dialog>`` element." `
    @("frontend","accessibility","priority: medium")

New-Issue `
    "[FE] Add ARIA labels to all interactive elements" `
    "## Problem`nButtons for removing a stock, sorting columns, and toggling the theme lack ``aria-label`` attributes. Screen readers announce them as unlabelled buttons.`n`n## Acceptance Criteria`n- [ ] All icon-only buttons have a descriptive ``aria-label``""`n- [ ] Sort buttons describe the column and current sort direction`n- [ ] Tested with a screen reader (NVDA / VoiceOver)" `
    @("frontend","accessibility","priority: medium")

New-Issue `
    "[FE] Add non-color indicators for metric values (colorblind accessibility)" `
    "## Problem`nGood/bad metric values are communicated through green/red text only. This fails WCAG 1.4.1 for users with color vision deficiency.`n`n## Acceptance Criteria`n- [ ] A small icon (e.g. ▲/▼ or checkmark/X) accompanies color-coded values in ValuationTable and PlanilhaApoioTable`n- [ ] Existing color styling is preserved alongside the icon`n- [ ] Icons are hidden from screen readers (``aria-hidden``)" `
    @("frontend","accessibility","priority: medium")

New-Issue `
    "[FE] Memoize ValuationTable and PlanilhaApoioTable rows" `
    "## Problem`nTable rows rerender on every state change (sort order, hover, tab switch) even when their own data has not changed. This becomes expensive as the watchlist grows.`n`n## Acceptance Criteria`n- [ ] Row sub-components wrapped in ``React.memo`` with stable prop references`n- [ ] ``useMemo`` used for derived row data where appropriate`n- [ ] No visible behaviour changes" `
    @("frontend","performance","priority: medium")

New-Issue `
    "[FE] Split DetailDrawer into sub-components" `
    "## Problem`n``components/dashboard/DetailDrawer.tsx`` is ~445 lines, containing the PriceBar, SafetyBar, data rows, and overlay logic all in one file. This makes it hard to maintain and test.`n`n## Acceptance Criteria`n- [ ] PriceBar extracted to its own component`n- [ ] SafetyBar extracted to its own component`n- [ ] Overlay/backdrop logic in a shared utility`n- [ ] No behaviour changes" `
    @("frontend","dx","priority: medium")

New-Issue `
    "[FE] Split PlanilhaApoioTable into sub-components" `
    "## Problem`n``components/dashboard/PlanilhaApoioTable.tsx`` is ~635 lines. The comparables logic, sector pills, indicator rows, and legend are all tangled together.`n`n## Acceptance Criteria`n- [ ] ComparableRow extracted`n- [ ] SectorPills extracted`n- [ ] IndicatorLegend extracted`n- [ ] Core table logic remains in PlanilhaApoioTable`n- [ ] No behaviour changes" `
    @("frontend","dx","priority: medium")

New-Issue `
    "[FE] Implement Recharts price history chart in DetailDrawer" `
    "## Problem`nRecharts is already a dependency (or was) and there is no visual representation of price history, making it hard to judge valuation trends over time.`n`n## Acceptance Criteria`n- [ ] DetailDrawer includes a line/area chart of historical closing prices`n- [ ] Chart uses the existing theme's color tokens`n- [ ] Backend exposes a ``GET /stocks/history/:ticker`` endpoint returning OHLC or close price series`n- [ ] Chart renders within the existing 380 px drawer width" `
    @("frontend","backend","ux","priority: low")

New-Issue `
    "[FE] Add CSV export for valuation table data" `
    "## Problem`nUsers doing value investing analysis routinely want to export data to a spreadsheet. There is currently no way to do this.`n`n## Acceptance Criteria`n- [ ] An export button in the dashboard downloads a CSV of the current ValuationTable rows`n- [ ] CSV includes all columns: Ticker, Current Price, Dividend, LPA, VPA, DY, Ceiling, Graham, Margin, Upside`n- [ ] File is named ``investche-export-YYYY-MM-DD.csv``" `
    @("frontend","ux","priority: low")

New-Issue `
    "[FE] Add Cmd+K / Ctrl+K keyboard shortcut for global search" `
    "## Problem`nThere is no keyboard shortcut to open the stock search. This is a standard UX pattern in analytics dashboards.`n`n## Acceptance Criteria`n- [ ] Pressing Ctrl+K (Windows/Linux) or Cmd+K (Mac) focuses the SearchBar from anywhere in the app`n- [ ] Escape closes the dropdown as before`n- [ ] Shortcut does not conflict with browser or OS defaults" `
    @("frontend","ux","priority: low")

New-Issue `
    "[FE] Fix inaccurate cookie consent copy" `
    "## Problem`nThe ``CookieConsent`` component states that cookies are ''necessary'' but the UI allows the user to decline them, which contradicts the GDPR definition of ''necessary''.`n`n## Acceptance Criteria`n- [ ] Copy updated to accurately describe what is stored (watchlist in cookies, 30-day expiry)`n- [ ] Accept/Decline buttons remain functional`n- [ ] No legal claims about ''necessity'' unless the cookies genuinely are technically required" `
    @("frontend","ux","priority: low")

# ---------------------------------------------------------------------------
# SECURITY
# ---------------------------------------------------------------------------

New-Issue `
    "[BE] Add helmet for HTTP security headers" `
    "## Problem`n``backend/src/main.ts`` has no security headers. The app is vulnerable to clickjacking, MIME sniffing, and other header-based attacks.`n`n## Acceptance Criteria`n- [ ] ``helmet`` package installed and applied via ``app.use(helmet())`` in ``main.ts``""`n- [ ] Headers verified: ``X-Frame-Options``, ``X-Content-Type-Options``, ``Strict-Transport-Security``, ``Content-Security-Policy``" `
    @("backend","security","priority: high")

New-Issue `
    "[BE] Configure CORS with an origin allowlist" `
    "## Problem`n``app.enableCors()`` is called with no arguments, which allows any origin. This is overly permissive for a production app.`n`n## Acceptance Criteria`n- [ ] ``ALLOWED_ORIGINS`` environment variable is read (comma-separated list)`n- [ ] CORS configured to allow only those origins`n- [ ] Default falls back to ``http://localhost:3001`` in development`n- [ ] Preflight requests handled correctly" `
    @("backend","security","priority: high")

New-Issue `
    "[BE] Add rate limiting with @nestjs/throttler" `
    "## Problem`nThe API has no rate limiting. A client (or attacker) can fire unlimited requests, hammering both the NestJS backend and the upstream Yahoo Finance / BRAPI APIs.`n`n## Acceptance Criteria`n- [ ] ``@nestjs/throttler`` installed and configured globally (e.g. 100 req / 60 s)`n- [ ] ``ThrottlerGuard`` applied as a global guard`n- [ ] ``/metrics`` endpoint excluded from throttling via ``@SkipThrottle()``""`n- [ ] 429 response returned when limit is exceeded" `
    @("backend","security","priority: high")

New-Issue `
    "[BE] Protect admin endpoints with an API key guard" `
    "## Problem`n``DELETE /stocks/cache`` and ``POST /stocks/cache/refresh`` are destructive/triggering operations with no authentication. Anyone who knows the URL can wipe the cache or force a costly re-fetch cycle.`n`n## Acceptance Criteria`n- [ ] ``AdminApiKeyGuard`` reads ``ADMIN_API_KEY`` from env`n- [ ] Guard applied to ``DELETE /cache`` and ``POST /cache/refresh``""`n- [ ] Requests without the correct ``x-api-key`` header receive 401`n- [ ] Guard is a no-op (pass-through) when ``ADMIN_API_KEY`` is not set (dev mode)" `
    @("backend","security","priority: high")

New-Issue `
    "[BE] Remove BRAPI_TOKEN from committed .env file" `
    "## Problem`n``backend/.env`` contains the live BRAPI API token (``BRAPI_TOKEN=d1ThbW3kzeWgn78mLfr2MT``) committed to the repository. This secret is now in git history.`n`n## Acceptance Criteria`n- [ ] ``backend/.env`` removed from tracking (``git rm --cached backend/.env``)`n- [ ] ``.gitignore`` updated to exclude ``backend/.env`` explicitly`n- [ ] BRAPI token rotated in the BRAPI dashboard (the old token is compromised)`n- [ ] ``backend/.env.example`` created with placeholder values`n- [ ] New token stored as a GitHub Secret (``BRAPI_TOKEN``)" `
    @("backend","security","priority: high")

New-Issue `
    "[BE] Add input validation with class-validator DTOs" `
    "## Problem`nThe controller accepts raw ``@Query()`` and ``@Param()`` values with minimal sanitisation. Malformed inputs are silently ignored or cause unexpected behaviour downstream.`n`n## Acceptance Criteria`n- [ ] ``class-validator`` and ``class-transformer`` installed`n- [ ] ``ValidationPipe`` applied globally in ``main.ts``""`n- [ ] Ticker param validated: uppercase letters/numbers, 4–6 chars (Brazilian ticker format)`n- [ ] ``limit`` query param validated: integer 1–20`n- [ ] Invalid inputs return 400 with a descriptive message" `
    @("backend","security","priority: medium")

# ---------------------------------------------------------------------------
# GITHUB / DEVOPS
# ---------------------------------------------------------------------------

New-Issue `
    "[CI] Create GitHub Actions CI workflow" `
    "## Problem`nThere is no automated CI pipeline. Broken builds and lint errors can be merged to main undetected.`n`n## Acceptance Criteria`n- [ ] Workflow triggers on push and pull_request to ``main``""`n- [ ] Backend job: install deps → lint → build → test`n- [ ] Frontend job: install deps → lint → build`n- [ ] Jobs run in parallel`n- [ ] ``BRAPI_TOKEN`` injected from GitHub Secret for backend tests`n- [ ] Workflow file at ``.github/workflows/ci.yml``" `
    @("devops","priority: high")

New-Issue `
    "[CI] Configure GitHub Secrets for all sensitive environment variables" `
    "## Problem`nEnvironment variables are currently stored in ``.env`` files committed to the repo, or hardcoded. GitHub Secrets should be the single source of truth for production values.`n`n## Acceptance Criteria`n- [ ] The following secrets created in the repo settings:`n  - ``BRAPI_TOKEN``""`n  - ``ADMIN_API_KEY``""`n  - ``ALLOWED_ORIGINS`` (production frontend URL)`n  - ``GRAFANA_ADMIN_PASSWORD``""`n- [ ] Secrets referenced in CI workflow and docker-compose via environment substitution`n- [ ] README documents which secrets are required and what they do" `
    @("devops","security","priority: high")

New-Issue `
    "[CI] Create .env.example files for backend and frontend" `
    "## Problem`nThere are no ``.env.example`` files. New developers have no way to know which environment variables are required without reading source code.`n`n## Acceptance Criteria`n- [ ] ``backend/.env.example`` lists all required vars with placeholder values`n- [ ] ``frontend/.env.local.example`` lists ``NEXT_PUBLIC_API_URL``""`n- [ ] README references these files in the setup section" `
    @("devops","dx","priority: high")

New-Issue `
    "[CI] Create Dockerfiles for backend and frontend" `
    "## Problem`nNeither the backend nor frontend has a Dockerfile. Containerisation is required for consistent deployments and for running Prometheus/Grafana alongside the app.`n`n## Acceptance Criteria`n- [ ] ``backend/Dockerfile``: multi-stage build (builder + runner), non-root user, health check`n- [ ] ``frontend/Dockerfile``: Next.js production build`n- [ ] Both images build successfully with ``docker build``""`n- [ ] Images run correctly with environment variables injected" `
    @("devops","priority: medium")

New-Issue `
    "[CI] Create docker-compose.yml for local development and observability stack" `
    "## Problem`nThere is no docker-compose setup. Developers must manually start backend, frontend, Prometheus, and Grafana as separate processes.`n`n## Acceptance Criteria`n- [ ] ``docker-compose.yml`` at repo root starts: backend, frontend, prometheus, grafana`n- [ ] Services communicate over a shared Docker network`n- [ ] Volumes defined for Grafana and Prometheus data persistence`n- [ ] Environment variables sourced from a ``.env`` file at repo root`n- [ ] ``docker compose up`` starts the full stack" `
    @("devops","priority: medium")

# ---------------------------------------------------------------------------
# OBSERVABILITY
# ---------------------------------------------------------------------------

New-Issue `
    "[OBS] Add Prometheus metrics endpoint to backend" `
    "## Problem`nThe backend has no metrics exposition. There is no way to observe request rates, latency, error rates, or resource usage in production.`n`n## Acceptance Criteria`n- [ ] ``prom-client`` installed`n- [ ] ``GET /metrics`` endpoint returns Prometheus text format`n- [ ] Default Node.js metrics collected (CPU, memory, GC, event loop lag)`n- [ ] Endpoint excluded from rate limiting" `
    @("backend","observability","priority: high")

New-Issue `
    "[OBS] Instrument HTTP requests with duration and count metrics" `
    "## Problem`nThere are no application-level metrics. SLIs (request rate, error rate, latency) cannot be calculated or alerted on.`n`n## Acceptance Criteria`n- [ ] ``HttpMetricsInterceptor`` records ``http_request_duration_seconds`` histogram per route/method/status`n- [ ] ``http_requests_total`` counter incremented per request`n- [ ] Labels: ``method``, ``route`` (pattern, not parameterised URL), ``status_code``""`n- [ ] Interceptor registered globally in ``AppModule``" `
    @("backend","observability","priority: high")

New-Issue `
    "[OBS] Set up Prometheus scraping backend metrics" `
    "## Problem`nEven with a /metrics endpoint, Prometheus needs to be configured to scrape it on a schedule.`n`n## Acceptance Criteria`n- [ ] ``prometheus/prometheus.yml`` scrape config targets ``backend:3000/metrics``""`n- [ ] Scrape interval: 15 s`n- [ ] Prometheus service in docker-compose`n- [ ] Prometheus UI accessible at ``localhost:9090``" `
    @("devops","observability","priority: high")

New-Issue `
    "[OBS] Create Grafana dashboard for backend metrics" `
    "## Problem`nPrometheus data is not visualised. An on-call engineer has no dashboard to assess system health.`n`n## Acceptance Criteria`n- [ ] Grafana service in docker-compose (port 3003)`n- [ ] Prometheus datasource auto-provisioned`n- [ ] Dashboard provisioned with panels for:`n  - HTTP request rate (req/s by route)`n  - HTTP duration p50 / p95 / p99`n  - HTTP error rate (5xx %)`n  - Node.js heap usage`n- [ ] Dashboard accessible at ``localhost:3003`` without manual import" `
    @("devops","observability","priority: high")

New-Issue `
    "[OBS] Replace NestJS Logger with structured logging (Pino)" `
    "## Problem`nAll logs are unstructured console output. They cannot be queried, parsed, or shipped to a log aggregator (e.g. Grafana Loki) efficiently.`n`n## Acceptance Criteria`n- [ ] ``nestjs-pino`` and ``pino-http`` installed`n- [ ] Logs emitted as JSON in production, pretty-printed in development`n- [ ] Request logs include: method, route, status, duration`n- [ ] Existing ``this.logger.*`` calls preserved in behaviour" `
    @("backend","observability","priority: low")

Write-Host "`nAll issues created. Visit https://github.com/$repo/issues to review them."
