# Kibo — AI Steering Developer Log

> **Purpose**: This log demonstrates how a developer steered an AI coding assistant
> (Claude Sonnet 4.6 via Claude Code) through the full lifecycle of a production
> feature — from constitution to deployed application. Each entry records:
>
> 1. **AI Strategy** — how context (schemas, rules, contracts) was fed to the AI
>    to constrain and guide its decisions.
> 2. **Human Audit** — specific instances where the developer caught and corrected
>    AI output before it reached production.
> 3. **Verification** — how the developer used AI to generate edge-case tests,
>    and which of those tests exposed real bugs.
>
> **Governance**: Entries are append-only. Reviewed each sprint retrospective.

---

## AI Steering Overview

This section summarises the steering architecture used across the entire
`001-shopping-cart-app` feature. Individual sessions below contain the full
detail.

### How Context Was Provided to the AI

- **`constitution.md`** — 10 non-negotiable principles covering TDD, WCAG 2.1 AA,
  Core Web Vitals budgets, security rules, and cyclomatic complexity ≤ 10. The AI
  checked every design decision against these gates and flagged deviations
  explicitly rather than silently proceeding.

- **`CLAUDE.md` (agent file at repo root)** — Tech stack, project structure, key
  constraints (`MAX_QUANTITY=50`, `API_TIMEOUT=10000`), commands, and code style.
  Persisted across sessions so the AI never re-litigated settled decisions.

- **`ProductSchema` + `ProductArraySchema` (Zod)** — Structural contract for
  external API data; invalid items silently discarded via per-item `safeParse`.
  The AI used the schema as the single source of truth for data shape.

- **`contracts/` directory** — API contract, Redux store contract, and component
  interfaces generated during planning. The AI referenced these during task
  generation to detect interface mismatches before any code was written.

- **`speckit` workflow (specify → clarify → plan → tasks → analyze → implement)** —
  Each stage produced a locked artifact that constrained the next stage,
  reducing hallucination of new requirements mid-implementation.

- **Explicit boundary values in `src/constants/index.js`** — `MAX_QUANTITY=50`,
  `API_TIMEOUT=10000`, `OUT_OF_STOCK_IDS`. The AI never invented limits; all
  magic numbers were sourced from this file.

### Human Audit — Most Impactful Corrections Across All Sessions

- **Security**: AI stored auth tokens in `localStorage` by default in the
  constitution example — corrected to `httpOnly` cookies; `localStorage` for
  tokens explicitly forbidden.
- **Security**: AI omitted CSRF protection for state-mutating API operations —
  explicit CSRF rule added to Principle IX.
- **Performance**: AI set the JS bundle cap at 300 KB gzipped — tightened to
  200 KB to enforce lean dependency choices from day one.
- **Logic**: `ProductArraySchema` used `z.array(ProductSchema)` which threw a
  `ZodError` on empty `image` URL before the filter could run — switched to
  `z.array(z.unknown())` + per-item `safeParse`.
- **Logic**: `fireEvent.click` on a disabled OOS button still fired `onClick` —
  React Testing Library's `fireEvent` bypasses the browser `disabled` attribute;
  `if (oos) return` guard added to the handler.
- **Tooling**: Babel/Jest config files created as `.js` in an ESM project —
  renamed all to `.cjs` because `"type": "module"` makes `.js` files ESM.
- **Architecture**: Integration tests each created their own `setupServer()` —
  when the global MSW server was added, two servers ran per test, causing handler
  conflicts; single shared server pattern enforced.
- **Accessibility**: QuantitySelector `+`/`−`/input had no `focus-visible:ring`
  classes — keyboard focus was invisible; `focus-visible:ring-2` added to all
  three controls.

### Verification — AI-Generated Tests That Caught Real Bugs

- **T022** (empty `image` URL in API response) — **Real bug**: Zod threw instead
  of filtering; required a full schema architecture change to `z.unknown()` +
  `safeParse`.
- **T032** (`useFilteredProducts` async data seeding) — **Real bug**: `upsertQueryData`
  was overridden by a live MSW fetch; the hook always returned empty data.
- **T065** (click disabled Add to Cart button) — **Real bug**: `fireEvent` bypassed
  `disabled`; dispatch fired without the `if (oos) return` guard.
- **T076** (cart rehydration from `sessionStorage`) — **Real bug**: redux-persist
  v6 double-serialises; single `JSON.stringify` produced unparseable state.
- **CartMax ×2** (ProductCard at MAX_QUANTITY) — **Real bug**: `onAddToCart` was
  called silently and quantity reset to 1 with no user feedback.
- **CartMax ×3** (ProductDetailModal at MAX_QUANTITY) — **Real bug**: Add to Cart
  dispatched and closed the modal with no feedback.
- **QtyBlur** (error message persists after blur) — **Real bug**: boundary error
  message never cleared; `onBlur` handler was missing entirely.

---

## Entry Format

```markdown
## [YYYY-MM-DD] — [Feature / Task Name]

### AI Strategy
- What was delegated to the AI and what context was provided to constrain it.

### Human Audit
Specific corrections and refinements applied to AI output:
- **[category]**: [what AI wrote] → [what was wrong] → [what replaced it]

### Verification
AI-generated test specifications for complex edge cases:
- **[Test ID]** — [edge case]: [what the test checks] — Bug found? [Yes/No + details]

### Outcome
- Final state, deferred items.
```

---

## 2026-02-23 — Project Constitution (v1.0.0)

### AI Strategy

The first steering decision was to establish a governance document before any
code was written. The developer invoked `/speckit.constitution` and provided
five seed principles covering: code quality, TDD, component architecture, design
system, 3-breakpoint responsiveness, WCAG 2.1 AA, Core Web Vitals, state
management, API/error handling, and frontend security.

- Model: Claude Sonnet 4.6 via `/speckit.constitution`.
- AI expanded the five seeds into 10 numbered principles with numeric budgets
  (LCP ≤ 2.5 s, CLS ≤ 0.1, FID ≤ 100 ms), coverage thresholds per layer, and
  a Sync Impact Report documenting which downstream templates needed updating.
- The resulting `constitution.md` became the primary steering artifact for all
  subsequent sessions — AI checked every design decision against it and flagged
  deviations rather than silently proceeding.

### Human Audit

Six corrections were applied before the constitution was ratified:

- **Security**: AI stored auth tokens in `localStorage` as the default example in
  Principle IX. `localStorage` tokens are accessible via XSS and violate OWASP A02.
  Corrected to `httpOnly` cookies; explicit rule added forbidding `localStorage`
  and `sessionStorage` for token storage.

- **Performance**: AI set the initial JS bundle cap at 300 KB gzipped. 300 KB is
  too permissive and would allow heavyweight libraries without budget pressure.
  Tightened to 200 KB to enforce lean dependency choices from day one.

- **Security**: AI omitted CSRF protection in Principle IX. State-mutating API
  operations without CSRF tokens are vulnerable even with `httpOnly` cookies.
  Added explicit rule: "CSRF protection MUST be verified for all state-mutating
  API operations."

- **Code quality**: AI set cyclomatic complexity threshold at 15. CC > 15 allows
  deeply nested conditionals that are hard to test; TDD requires testable functions.
  Lowered to > 10 to enforce earlier decomposition.

- **Accessibility**: AI did not include `aria-live` region guidance in Principle IV.
  Dynamic content updates (toasts, validation messages) are missed by screen
  readers without live regions. Added explicit rule for `aria-live` and
  `aria-atomic` on dynamic content.

- **Process**: The developer-log.md Human Audit section was drafted as a checkbox
  list of future tasks. Audit sections should record corrections already made, not
  pending to-dos. Restructured to a correction list capturing the AI error, the
  fix, and the category.

### Verification

AI was prompted to generate test specifications for constitution-level edge cases,
establishing the regression baseline before any component was built:

- **T-01** — XSS via unsanitised content in `dangerouslySetInnerHTML`: Test renders
  a component with a `<script>alert(1)</script>` prop value and asserts no script
  executes and content is escaped. No bug yet — baseline for Principle IX.

- **T-02** — Color contrast below 4.5:1 after a dark-mode token override: Test uses
  jest-axe to audit a component tree with dark-mode tokens applied and asserts zero
  color-contrast violations. No bug yet — CI gate for Principle IV.

- **T-03** — API call hangs indefinitely: Test mocks a fetch that never resolves and
  asserts the error state renders within the defined timeout window. Bug category
  identified: raw `useEffect` fetch patterns lack timeouts — caught before any code
  was written.

- **T-04** — CLS spike when skeleton dimensions don't match loaded content: Visual
  regression compares skeleton layout dimensions against populated content at all
  three breakpoints. No bug yet — guards Principle VI CLS ≤ 0.1.

- **T-05** — State slice mutation via direct object reference: Test mutates a returned
  state reference outside the store and asserts no re-render occurs. No bug yet —
  establishes immutability contract for Principle VII.

### Outcome

- Constitution v1.0.0 ratified and written to `.specify/memory/constitution.md`.
- `developer-log.md` created with corrected format.
- 6 human corrections applied; 5 edge-case test specifications generated.
- Deferred to `plan.md`: tech stack, state manager, test runner, design token paths.

---

## 2026-02-23 — Feature Spec: Modern Shopping Cart Web Application (001)

### AI Strategy

With the constitution ratified, the developer ran `/speckit.specify` and provided
a plain-English feature description: product listing (live API), product detail
view, add-to-cart with quantity control, and cart management.

- Model: Claude Sonnet 4.6 via `/speckit.specify`.
- Constitution governed all quality gates — AI checked the spec against all 10
  principles before presenting it.
- AI structured 4 prioritised user stories (P1–P4), 32 functional requirements,
  9 success criteria, and an edge case catalogue.
- AI also ran the spec quality checklist and self-validated all items as passing.

### Human Audit

- **Logic / UX**: Initial spec had no product detail view — opening a product only
  navigated within the listing. Users expect individual product pages with full
  information and multi-quantity add; this is a distinct UX surface. Added User
  Story 2 (Product Detail View, P2) with FR-007–FR-010 covering full detail
  display, quantity selector, and modal close behaviour.

- **Logic / UX**: Add-to-cart on product cards added exactly 1 item per click with
  no quantity selector. Decisive shoppers need to add multiple units without opening
  a modal — this removes unnecessary friction. Added User Story 3 (Add with
  Quantity, P3) with listing-card quantity selector (FR-011), FR-014 validation
  guard, and cumulative add behaviour FR-013.

### Verification

- **T-06** — Quantity selector set to 0 before clicking Add to Cart on listing card:
  Asserts the action is blocked, an inline validation message appears, and the cart
  badge count does not change. No bug yet — prevents invalid cart state; guards
  FR-014.

- **T-07** — Same product added from listing card (qty 3) then from detail modal (qty 2):
  Verifies cart contains exactly one line item for the product with cumulative
  quantity 5, not two separate entries. No bug yet — validates FR-013 cumulative
  add rule.

- **T-08** — Product detail modal opened while cart drawer is also open: Asserts both
  surfaces coexist without z-index conflicts, focus-trap is correctly scoped to the
  active modal, and keyboard navigation does not bleed between layers. No bug yet —
  identifies a likely implementation trap.

- **T-09** — User refreshes page after adding 5 products across different quantities:
  Asserts all 5 products and their exact quantities are restored from session storage
  with no data loss or corruption. No bug yet — validates FR-024 session persistence.

- **T-10** — Product name is 120 characters (exceeds 80-char threshold): Asserts the
  card renders with truncated name + ellipsis, the detail modal shows the full name,
  and no layout overflow occurs at any breakpoint. No bug yet — guards the long-name
  edge case.

### Outcome

- Spec v1 written to `specs/001-shopping-cart-app/spec.md`.
- 2 major human corrections: product detail view and quantity-on-card both added
  after AI omission — significant UX scope additions.
- 5 edge-case tests generated covering quantity validation, cumulative add, modal
  layering, session persistence, and long names.
- Deferred to `plan.md`: stack, quantity maximum (assumed 99), currency, API endpoint.

---

## 2026-02-23 — Spec Clarification: Shopping Cart Web Application (001)

### AI Strategy

The developer ran `/speckit.clarify` to resolve ambiguities in the spec before
planning began.

- Model: Claude Sonnet 4.6 via `/speckit.clarify`.
- AI scanned 10 taxonomy categories, identified 6 Partial/Missing areas, and
  generated a prioritised queue of 5 questions covering: out-of-stock handling,
  discovery controls scope, privacy/cookie consent, quantity maximum, and API
  timeout.
- AI recommended an option for each question with explicit rationale (industry
  standard, risk reduction, or spec alignment).
- A costly rewrite cycle occurred on Q2: the developer initially selected "full
  suite including text search" and the AI immediately wrote the full text-search
  version of the discovery section into the spec. The developer then changed their
  answer, triggering a complete rewrite — demonstrating that AI executes selections
  literally and lock-in can happen within a single turn.

### Human Audit

- **Scope / UX**: Q2 — developer selected "full suite including text search"; AI
  fully integrated text-search FRs into the spec. Developer changed answer to
  "category + sort only" after seeing the integrated version — text search was
  judged out of scope. Triggered a full spec rewrite of the discovery section.
  Reverted to category filter + sort; text search bar, FR-010, and search-related
  edge case and security FR all removed.

- **Logic**: Q4 — AI suggested 99 as the quantity maximum ("de facto e-commerce
  standard"). 99 units is too high for this application's use case. Overridden to
  50 units; FR-019 updated; both boundary edge cases (≤0 and ≥51) given explicit
  test targets.

- **Process**: Prior developer-log entry from the spec session stated "quantity
  selector maximum (assumed 99)" as deferred. That assumption is now resolved and
  was incorrect. New entry records the confirmed value of 50; the stale reference
  is superseded.

### Verification

- **T-11** — Category filter selects a category with zero matching products: Asserts
  the empty-state message and "Clear Filters" button appear; clicking reset restores
  the full product grid and clears both category and sort controls. No bug yet —
  guards FR-011 empty discovery state.

- **T-12** — Quantity selector at exactly 50 (upper boundary, inclusive): Asserts Add
  to Cart succeeds with qty 50, badge increments by 50, and no validation error
  appears. No bug yet — validates inclusive upper boundary of FR-019.

- **T-13** — Quantity selector at exactly 51 (one above the boundary): Asserts the
  action is blocked, inline message "Maximum quantity is 50" appears, and the badge
  does not change. No bug yet — validates exclusive upper boundary.

- **T-14** — API call takes exactly 10 000 ms to respond: Mocks a delayed response at
  10 000 ms and asserts the error state renders immediately; also tests 9 999 ms to
  confirm the loading skeleton is still shown (not yet timed out). No bug yet —
  validates FR-036 timeout boundary precisely.

- **T-15** — Category "Electronics" and sort "Price: low to high" applied simultaneously:
  Asserts only Electronics products appear in ascending price order; changing either
  control independently re-evaluates both constraints together. No bug yet —
  validates combined filter + sort behaviour.

### Outcome

- 5 clarification questions resolved; spec updated incrementally after each answer.
- New User Story 2 (Filter & Sort) inserted; 37 FRs total (up from 32).
- 2 human corrections: Q2 answer changed D→B (text search removed); quantity max
  corrected from AI default 99 to human-specified 50.
- 5 new edge-case tests (T-11–T-15) generated.
- Deferred to `plan.md`: currency locale, specific live API endpoint, Vercel
  deployment constraint.

---

## 2026-02-23 — Implementation Plan: Shopping Cart Web Application (001)

### AI Strategy

The developer ran `/speckit.plan` and provided explicit constraints: React,
Tailwind CSS, Redux for state management, Jest + React Testing Library, responsive
UI, frontend-only, no database, FakeStore API (`https://fakestoreapi.com/products`).

- Model: Claude Sonnet 4.6 via `/speckit.plan`.
- Completed, clarified spec was the primary input; constitution governed all
  architectural choices.
- AI resolved all 6 items deferred from clarification: currency (USD/en-US),
  API endpoint (FakeStore), out-of-stock handling (`OUT_OF_STOCK_IDS` constant),
  Vercel deployment config, state manager (RTK Query + Redux Toolkit), and scaffold
  choice (Vite 5 over Create React App).
- AI selected RTK Query specifically to satisfy Constitution VII's "no raw `useEffect`
  fetch" rule while keeping the user's Redux preference intact — RTK Query ships
  inside the Redux Toolkit package.
- AI noted a Constitution X deviation: TypeScript strict mode is required by
  Principle X but the user had chosen JavaScript. Documented in Complexity Tracking
  with ESLint + Zod + JSDoc mitigations rather than silently ignoring it.
- Artifacts generated: `plan.md`, `research.md`, `data-model.md`, `contracts/api.md`,
  `contracts/redux-store.md`, `contracts/component-interfaces.md`, `quickstart.md`,
  `CLAUDE.md`.

### Human Audit

- **Tooling**: AI defaulted to TypeScript for the initial plan draft (consistent with
  Constitution X). The user explicitly prefers JavaScript; TypeScript was not in the
  stated requirements. All file extensions corrected (`.ts`/`.tsx` → `.js`/`.jsx`);
  `tsconfig.json` removed; `z.infer<>` type inference replaced with JSDoc `@typedef`;
  Constitution Check Principle X updated to ⚠️ DEVIATION with documented mitigations.

- **Process**: AI attempted a `WebFetch` call against the live FakeStore API during
  the research phase to confirm the response shape. The tool call was denied — FakeStore
  response shape is publicly documented and well-known; no live call is needed at
  planning stage. AI used its prior knowledge of FakeStore's API structure instead
  and defined `ProductSchema` without a live fetch.

### Verification

- **T-16** — `OUT_OF_STOCK_IDS` contains an ID but `addToCart` reducer receives that
  ID directly (bypassing UI guards): Dispatches `addToCart` directly against the Redux
  store and asserts the item IS added — confirms the OOS guard is a UI concern only,
  not enforced at reducer level. No bug yet — establishes the architectural contract.

- **T-17** — redux-persist rehydrates cart while RTK Query is still loading products:
  Mounts app with pre-populated `sessionStorage` cart and a pending API mock; asserts
  cart badge shows persisted count immediately and no race condition corrupts cart state
  during rehydration. No bug yet — guards `PersistGate` + RTK Query async interaction.

- **T-18** — `ProductArraySchema.parse()` receives a product where `image` is an empty
  string: Calls `ProductArraySchema.parse([{ ...validProduct, image: '' }])` and asserts
  the malformed product is filtered, no error is thrown, and valid products in the same
  array are preserved. No bug yet — validates the `.transform()` filter.

- **T-19** — Cart total with floating-point prices (e.g., 3 × $0.10 = $0.30000000000000004):
  Builds a cart with known precision-prone prices; asserts `selectCartTotal` equals the
  mathematically correct value rounded to 2 decimal places. No bug yet — guards SC-003
  arithmetic correctness.

- **T-20** — `ProductDetailModal` opened for a product no longer in the RTK Query cache:
  Renders modal with `productId` returning `undefined` from `data?.find()` and asserts a
  graceful fallback (loading state or "Product not found"), not a crash. No bug yet —
  guards the modal's dependency on cached data.

### Outcome

- `plan.md` finalised; 10 resolved decisions documented in `research.md`.
- Data model, API contract, Redux store contract, component interfaces, and quickstart
  all generated.
- `CLAUDE.md` created at repo root as the persistent agent context file.
- 2 human corrections: TypeScript → JavaScript; WebFetch denied.
- 5 edge-case tests generated (T-16–T-20).
- Constitution X deviation documented with mitigations.
- Next step: `/speckit.tasks`.

---

## 2026-02-23 — Task Generation: Shopping Cart Web Application (001)

### AI Strategy

The developer ran `/speckit.tasks` with all design documents as context.

- Model: Claude Sonnet 4.6 via `/speckit.tasks`.
- `plan.md`, `spec.md`, `data-model.md`, `contracts/`, `research.md`, and
  `quickstart.md` were all read before task generation.
- Constitution V (TDD) is non-negotiable — AI included a failing test task before
  every implementation task without being explicitly prompted to do so.
- AI organised 88 tasks across 8 phases grouped by user story (US1–US5), established
  Phase 2 (Foundational) as a strict prerequisite gate, and included E2E Playwright
  tasks (T086/T087), a CI pipeline task (T088), and CSP headers in `vercel.json` (T012)
  — all derived from constitution principles III, IV, V, and IX without explicit instruction.

### Human Audit

- **Process**: No corrections were recorded inline during task generation. Tasks were
  reviewed via `/speckit.analyze` in the following session rather than inline during
  generation. See the Analysis & Remediation entry below for all corrections applied
  after generation.

### Verification

Key edge-case test tasks generated by AI in `tasks.md` that guard previously identified
spec risks:

- **T017** — Floating-point price formatting (SC-003): `formatPrice(3 * 0.1) → '$0.30'`
  guards IEEE 754 imprecision. Risk mitigated: cart total arithmetic errors.

- **T021** — Malformed API product: `ProductArraySchema.parse` filters a product with
  empty `image` string. Risk mitigated: page crash on bad API data.

- **T025** — Rapid quantity dispatch: 10× sequential `addToCart` dispatches assert final
  qty = 10. Risk mitigated: Redux reducer race condition.

- **T027** — Floating-point cart total: `selectCartTotal` with precision-prone prices
  asserts `Math.round` rounding. Risk mitigated: displayed total drift.

- **T057** — QuantitySelector boundary: `value < min` and `value > max` both show
  `role="alert"` error. Risk mitigated: invalid cart state via UI.

- **T058** — Uncached product in modal (from T-20 in plan): `productId` returning
  `undefined` from RTK Query renders a fallback, not a crash. Risk mitigated:
  `ProductDetailModal` null crash.

### Outcome

- `tasks.md` generated: 88 tasks (T001–T088) across 8 phases.
- TDD satisfied: every component, hook, utility, and integration path has a
  failing-test task before its implementation task.
- Key tasks added beyond spec requirements: T085 (MSW shared server), T086/T087
  (Playwright E2E), T088 (CI pipeline), T012 (CSP headers in Vercel).
- Next step: `/speckit.analyze` cross-validation before implementation.

---

## 2026-02-23 — Specification Analysis & Remediation: Shopping Cart Web Application (001)

### AI Strategy

The developer ran `/speckit.analyze` twice (two passes) to identify and resolve
cross-artifact inconsistencies before implementation began.

- Model: Claude Sonnet 4.6 via `/speckit.analyze` ×2.
- All three artifacts (`spec.md`, `plan.md`, `tasks.md`) provided simultaneously.
- Constitution served as the compliance ruleset — every finding was tagged against
  the principle it violated.
- **Pass 1** produced 15 findings: 3 CRITICAL, 3 HIGH, 4 MEDIUM, 5 LOW. Critical
  issues: missing E2E tests, no visual regression coverage, MSW not installed, no CI
  pipeline, CSP headers absent from `vercel.json`. Developer approved all remediations.
- **Pass 2** (after Pass 1 applied) produced 9 findings: 0 CRITICAL, 1 HIGH, 4 MEDIUM,
  5 LOW. The HIGH issue was a dual MSW server conflict the AI self-identified — T085
  was placed in Phase 8 (Polish) but its global server needed to exist in Phase 2
  (Foundational) before integration tests could import it.

### Human Audit

- **Process**: Pass 1 flagged `setupFilesAfterFramework` as a potential typo. Both
  `tasks.md` T007 and `quickstart.md` used the same spelling with no evidence of an
  actual error. Treated as a false positive; confirmed `setupFilesAfterFramework` is
  the correct Jest 29 key. Warning note added in Pass 1 remediation, removed in Pass 2
  L5 fix.

- **Architecture / Testing**: Pass 1 integration test tasks (T056, T065, T075, T076)
  described creating local `setupServer()` instances inside each test file. When T085
  also added a global MSW server to `jest.setup.js`, two server instances would run
  simultaneously per test — causing handler layering conflicts and flaky behaviour.
  Resolved by moving T085 to Phase 2; all integration tests updated to import the
  shared `server` from `tests/msw-setup.js` and use `server.use(...)` overrides. No
  test file calls `setupServer()` outside of `msw-setup.js`.

- **Constitution VIII**: Pass 1 found that `plan.md` Constitution Check VIII claimed
  "✅ retry on GET" but T023 only configured `fetchBaseQuery` with a timeout — no
  retry wrapper. Constitution VIII mandates automatic retry on transient GET failures.
  T023 updated to wrap `fetchBaseQuery` with RTK Query's `retry(base, { maxRetries: 3 })`;
  plan.md updated to reference T023.

- **Constitution V**: T007 `coverageThreshold` used a single `global` entry (85/80/90) —
  the component layer minimum. Constitution V requires per-layer thresholds: Hooks/Services
  (90/85/95) and Utils (95/90/100). A global-only config silently allows hooks to pass at
  85% when 90% is required. T007 updated with 4 `coverageThreshold` entries: global plus
  per-directory entries for `./src/hooks/**`, `./src/features/**`, and `./src/utils/**`.

- **Constitution VI**: T088 CI pipeline had 5 jobs (lint, test, build, audit, e2e) with
  no Lighthouse step. Constitution VI requires "Lighthouse performance score MUST remain
  ≥ 90 in CI on every PR." T088 updated with job 6: `@lhci/cli` running `lhci autorun`
  asserting `performance ≥ 0.9`, `accessibility = 1.0`, `best-practices ≥ 0.9`.

- **Constitution III**: T086 Playwright E2E checked overflow at 375px and 1280px only.
  Constitution III mandates visual regression at all 3 canonical viewports. T086 updated
  to check 375px, 768px, and 1280px.

### Verification

Analysis uncovered additional edge cases added directly to task descriptions:

- **T025 extended** — Rapid-dispatch edge case: 10× sequential `addToCart` at reducer
  level asserts final qty = 10 with no skipped updates. Added in Pass 2 L2 fix.

- **T025 extended** — Large cart edge case: 30 distinct products dispatched asserts
  `items.length = 30` with no cross-product deduplication. Added in Pass 2 L2 fix.

- **T075 extended** — Offline mid-session: after `server.close()`, cart qty change and
  remove complete without errors — cart operable on already-loaded data. Added in Pass 2
  L3 fix.

- **T075 extended** — SC-008 500ms timing: `waitFor(..., { timeout: 11500 })` after a
  10 s timeout bounds error display to ≤ 500ms post-failure. Added in Pass 2 L4 fix.

### Outcome

- **Pass 1**: 8 remediations applied; all 3 CRITICAL and 3 HIGH findings resolved.
  Task count grew 84 → 88.
- **Pass 2**: 9 remediations applied; 1 HIGH (dual MSW server) and all 4 MEDIUM findings
  resolved; all 5 LOW findings resolved.
- **Final state**: 0 CRITICAL · 0 HIGH · 0 MEDIUM · 0 LOW across `spec.md`, `plan.md`,
  and `tasks.md`. Constitution compliance: 10/10 principles satisfied (Principle X
  TypeScript deviation documented with mitigations).
- **Key architectural decisions made during remediation**:
  - Single shared MSW server in `tests/msw-setup.js` (not per-test servers)
  - RTK Query `retry` wrapper (maxRetries: 3) on `getProducts` endpoint
  - Per-layer Jest `coverageThreshold` enforcing Constitution V strictly
  - T085 moved from Phase 8 → Phase 2 to unblock integration test phases
- Next step: `/speckit.implement` — task list is production-ready.

---

## 2026-02-24 — Full Implementation: Shopping Cart Web Application (001)

### AI Strategy

The developer ran `/speckit.implement` to execute all 88 tasks across 8 phases:
Setup (T001–T015), Foundational (T016–T032/T085), US1 Browse (T033–T050), US2
Filter & Sort (T051–T056), US3 Product Detail Modal (T057–T062), US4 Add to Cart
(T063–T069), US5 Cart Drawer (T070–T076), Polish (T077–T088).

- Model: Claude Sonnet 4.6 via `/speckit.implement`.
- `CLAUDE.md` (agent file) was the AI's persistent reference — it did not re-ask
  settled questions about stack, constraints, or conventions.
- `tasks.md` provided a dependency-ordered work queue; the AI processed tasks
  sequentially and marked each `[X]` upon completion. TDD was enforced by the
  task structure itself: failing tests always preceded implementation.
- `ProductSchema` and `ProductArraySchema` defined the API boundary contract;
  all data transformation in `transformResponse` was validated against these schemas.
- `src/constants/index.js` was the single source of truth for all magic numbers —
  the AI sourced `MAX_QUANTITY` and `API_TIMEOUT` from there, never inventing values.
- Final deliverable: 181 passing tests across 26 suites; Vite production build
  succeeding with code-split lazy chunks for `ProductDetailModal` and `CartDrawer`.

### Human Audit

Ten corrections were applied during implementation:

- **Process**: AI tried `npm create vite@latest . -- --template react` interactively.
  Non-interactive scaffold failed (directory not empty) — no files were created. AI fell
  back to manual file creation via the Write tool.

- **Tooling**: Babel/Jest config files created as `.js` extension. `"type": "module"` in
  `package.json` makes `.js` files ESM; Jest requires CJS config loaders. Renamed all
  to `.cjs`: `babel.config.cjs`, `jest.config.cjs`, `jest.setup.cjs`.

- **Tooling**: ESLint v9 installed by default. ESLint v9 uses flat config format;
  existing `.eslintrc.cjs` is v8 format — immediate incompatibility. Downgraded to
  ESLint v8.

- **Tooling / Testing**: MSW v2 in jsdom failed with `Response is not defined`,
  `TextEncoder`, `BroadcastChannel`, and `WritableStream` errors. jsdom does not
  expose Node 18 Fetch globals used by MSW v2; polyfills must be loaded before
  `undici` in a specific order. Created `jest.polyfills.cjs` with strict ordering:
  Node stream/web globals first → undici Fetch globals → BroadcastChannel stub.
  Registered in `setupFiles` (before the test environment is set up).

- **Logic**: `ProductArraySchema` used `z.array(ProductSchema)` with `.filter()` in
  `.transform()`. `z.string().url()` in Zod v4 throws a `ZodError` on an empty string
  before the filter can run, crashing the entire array parse. Switched to
  `z.array(z.unknown())` + per-item `ProductSchema.safeParse()` — malformed items are
  silently discarded.

- **Testing**: `useFilteredProducts` tests used RTK Query `upsertQueryData` to seed
  test data. The hook still triggered a live MSW fetch that overrode the injected data —
  tests always returned empty results. Replaced with `server.use(http.get(...))` handler
  override + `waitFor()` pattern.

- **Architecture**: `ProductDetailModal` initially received a full `product` object prop.
  T060 specifies a `productId` prop with RTK Query cache lookup; App.jsx was passing
  `product={selectedProduct}`. Updated App.jsx to pass `productId={selectedProductId}`;
  the component does `useGetProductsQuery().data?.find()` internally.

- **Logic**: Integration test used `fireEvent.click` on disabled Add to Cart button for
  OOS products. React Testing Library's `fireEvent` bypasses the browser's native
  `disabled` attribute handling; `onClick` fired even on disabled buttons. Added
  `if (oos) return` guard at the top of `handleAddToCart` in `ProductCard.jsx`.

- **Testing**: Cart integration tests used sessionStorage-persisted state from prior
  tests. redux-persist rehydrated stale cart data from the previous test's sessionStorage,
  corrupting item counts. Used unique `Date.now() + Math.random()` persist key per
  test store instance to isolate state.

- **Testing / Logic**: Cart-persistence test used single-serialized `JSON.stringify({items,
  isOpen})`. redux-persist v6 double-serialises: each value in the outer object is itself
  `JSON.stringify`'d. Corrected to the double-serialization format:
  `JSON.stringify({ items: JSON.stringify(items), isOpen: JSON.stringify(false), _persist: JSON.stringify({...}) })`.

### Verification

AI-generated tests that caught real bugs during implementation:

- **T022** — Empty `image` URL in API response: `ProductArraySchema` was expected to
  filter products where `image` is an empty string. **Real bug found**: Zod `z.string().url()`
  threw a `ZodError` instead of filtering. Required a full schema architecture change from
  `z.array(ProductSchema)` to `z.array(z.unknown())` + per-item `safeParse`.

- **T032** — `useFilteredProducts` async data flow: Tests use `server.use()` override +
  `waitFor()` for async RTK Query data. **Real bug found**: `upsertQueryData` approach
  failed because the hook always fetched from MSW, ignoring injected data. All 7 tests
  were always empty before the fix.

- **T065** — OOS Add to Cart does not change cart count: `fireEvent.click` on a disabled
  button should not dispatch. **Real bug found**: React's disabled button does not block
  `fireEvent.click`; `onClick` was firing. Required `if (oos) return` guard in the handler.

- **T076** — Cart persistence rehydration: Pre-populate `sessionStorage` in the correct
  redux-persist v6 double-serialized format. **Real bug found**: single `JSON.stringify`
  produced an unparseable state object that redux-persist could not rehydrate.

- **T025** — Large cart (30 products) no deduplication: Dispatching 30 distinct products
  yields `items.length = 30`. No bug — confirmed reducer handles large state correctly.

### Outcome

- All 88 tasks completed and marked `[X]` in `tasks.md`.
- **181 passing tests** across 26 test suites (0 failures).
- Coverage: global statements/branches/functions all above thresholds;
  features/hooks layer ≥ 95%; utils layer 100%.
- Vite production build: `dist/index.html` + CSS chunk + two lazy JS chunks
  (ProductDetailModal, CartDrawer) + main bundle (367 kB raw / 115 kB gzip).
- 10 human corrections applied; 4 AI-generated tests caught real bugs.
- Deferred items completed in the following session: T086/T087 Playwright E2E,
  T088 GitHub Actions CI, T079 WCAG spot-check, T083 quickstart validation.

---

## 2026-02-24 — Polish Completion: Playwright E2E, CI/CD, WCAG & Quickstart (001)

### AI Strategy

The developer instructed the AI to complete 4 deferred Phase 8 tasks (T079, T083,
T086, T087, T088).

- Model: Claude Sonnet 4.6 via Claude Code (continued `/speckit.implement` session).
- `CLAUDE.md` and `tasks.md` provided the scope and acceptance criteria.
- AI ran all 14 component test suites to confirm jest-axe WCAG assertions, spot-checked
  focus ring CSS classes on 5 key interactive elements, compared `quickstart.md` against
  actual config files, wrote both Playwright E2E specs, updated `playwright.config.js`,
  and created `.github/workflows/ci.yml` and `.lighthouserc.js`.

### Human Audit

- **Accessibility**: QuantitySelector `+`/`−` buttons and the number input had no
  `focus-visible:ring` classes. Visual keyboard focus was invisible for this component —
  a WCAG 2.1 AA failure. Added `focus:outline-none focus-visible:ring-2
  focus-visible:ring-primary focus-visible:ring-offset-1` to all 3 controls in
  `QuantitySelector.jsx`.

- **Documentation**: `quickstart.md` referenced `jest.config.js` with
  `setupFilesAfterFramework` and `coverageThresholds`. The actual project uses `.cjs`
  extension; the correct Jest key is `setupFilesAfterEnv`; the correct key is
  `coverageThreshold` (no 's'); the config also omitted `testEnvironmentOptions`,
  `setupFiles`, `transformIgnorePatterns`, `testMatch`, and the per-layer thresholds.
  Updated Step 4 with accurate `jest.config.cjs`, `jest.setup.cjs`, and
  `babel.config.cjs` contents.

- **Documentation**: `quickstart.md` fontFamily listed `['Inter', 'system-ui',
  'sans-serif']`. The actual `tailwind.config.js` has `['Inter', 'ui-sans-serif',
  'system-ui', 'sans-serif']` — an extra `ui-sans-serif` fallback. Corrected Step 3
  fontFamily to match the actual config.

- **Tooling**: CI pipeline used `npx wait-on` to poll for server readiness before
  running E2E tests. `wait-on` is not in devDependencies and would fail in CI with
  `npx wait-on: not found`. Replaced with a bash `curl` retry loop:
  `for i in $(seq 1 30); do curl -sf ... && break || sleep 1; done`.

### Verification

No new edge-case bugs were found in this session — all work was completing deferred
setup and documentation tasks. Existing tests confirmed passing:

- All 14 component test suites with jest-axe: ✓ 113 tests passing (41 atoms + 72
  molecules/organisms).
- QuantitySelector tests after focus ring fix: ✓ 10/10 tests still passing (axe
  assertion included).
- Full suite after quickstart.md edits: ✓ 181/181 tests passing across 26 suites.

### Outcome

- All 88 tasks now fully implemented (no deferred items remaining).
- **181 passing tests** across 26 suites — unchanged.
- New files: `e2e/browse-catalogue.spec.js`, `e2e/add-to-cart.spec.js`,
  `.github/workflows/ci.yml`, `.lighthouserc.js`.
- CI pipeline: 6 jobs (lint, test:coverage, build, audit, e2e, lighthouse) gated on
  push/PR; Lighthouse assertions: performance ≥ 0.9, accessibility = 1.0,
  best-practices ≥ 0.9 (Constitution VI).
- 4 human corrections: 1 to component code (focus rings); 3 to documentation.

---

## 2026-02-24 — Quantity Sync: ProductCard ↔ ProductDetailModal (001)

### AI Strategy

The developer reported a UX bug: the quantity selector on the listing card and the
one in the product detail modal were independent — changing one did not update the
other.

- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- Developer described the desired behaviour in plain English.
- AI read both components, identified root cause (independent `useState(1)` in each),
  and proposed lifting quantity to a shared Redux map `productQuantities: {}` in
  `productsSlice` (key = productId, value = quantity, default 1 via selector fallback).
- Developer approved the approach. Both components now read
  `selectProductQuantity(state, productId)` and dispatch `setProductQuantity({ productId,
  quantity })` on change; state resets to 1 after a successful add.

### Human Audit

- **UX / Architecture**: Human reported the desync. Quantity on listing card and modal
  were independent `useState(1)` — no connection between them. Human described the
  desired synchronisation behaviour; AI lifted state to Redux and updated both components.

### Verification

- **new (ProductCard)** — Quantity pre-seeded via Redux `preloadedState`: Card spinbutton
  shows 4 when the store has `productQuantities: { 1: 4 }`. No bug — confirms Redux-driven
  value.

- **new (ProductDetailModal)** — Quantity pre-seeded via Redux `preloadedState`: Modal
  spinbutton shows 4 when the store has `productQuantities: { 1: 4 }`. No bug — confirms
  sync between card and modal.

### Outcome

- `productsSlice.js`: `productQuantities: {}` in `initialState`; `setProductQuantity`
  reducer; `selectProductQuantity` selector exported.
- `ProductCard.jsx`: local `useState` replaced with `useAppSelector(selectProductQuantity)`;
  `onChange` dispatches `setProductQuantity`; add resets via dispatch.
- `ProductDetailModal.jsx`: local `useState` removed; reads `selectProductQuantity`;
  `onChange` dispatches `setProductQuantity`; add resets via dispatch.
- Both test files extended with `productQuantities` param; 1 sync test added each.
- `spec.md` US2 Independent Test updated with sync requirement.

---

## 2026-02-24 — Cart Max-Quantity Guard on Add to Cart (001)

### AI Strategy

The developer instructed the AI to block further adds when the cart already holds
MAX_QUANTITY (50) for a product, and to show "Already at max quantity in cart"
feedback inline in the same location and style as QuantitySelector boundary errors
(below the controls, `role="alert"`, `text-xs text-error`).

- Model: Claude Sonnet 4.6 via Claude Code (direct instruction, two iterations).
- Developer specified the exact UX requirement: inline message, same location as
  QuantitySelector errors, `role="alert"`, specific CSS classes.
- **Iteration 1**: AI placed the guard in `App.jsx handleAddToCart` (error toast) and
  inline in `ProductDetailModal`. Developer rejected — the listing card must show the
  message inline, not as a toast. The two-iteration cycle demonstrates the value of
  precise UX specifications in the initial prompt.
- **Iteration 2**: AI moved the guard into `ProductCard` itself (reads cart via
  `useAppSelector`); removed from `App.jsx`. `ProductDetailModal` unchanged from
  iteration 1.

### Human Audit

- **UX / Logic**: First iteration used an error toast for the ProductCard path.
  Inconsistent with QuantitySelector inline error UX; a toast disappears whereas the
  listing card should show the message in the same place as "Minimum quantity is 1."
  Human requested inline message in the same location and style as QuantitySelector
  boundary errors. AI rewrote the ProductCard implementation in iteration 2.

### Verification

- **new ×2 (ProductCard)** — ProductCard at MAX_QUANTITY: (1) inline `role="alert"` message
  shown on click; (2) `onAddToCart` not called. **Real bug found**: without the guard,
  `onAddToCart` was called and quantity was silently reset to 1 with no user feedback.

- **new ×3 (ProductDetailModal)** — ProductDetailModal at MAX_QUANTITY: (1) Add to Cart +
  QuantitySelector disabled; (2) inline message shown; (3) `onClose` not called. **Real bug
  found**: without the guard, Add to Cart dispatched and closed the modal with no feedback.

### Outcome

- `ProductCard.jsx`: `isAtMax` derived from cart selector; `showMaxError` state;
  `handleAddToCart` guards on `isAtMax`; inline `role="alert"` shown when `showMaxError`;
  `useEffect` clears error when `isAtMax` becomes false.
- `App.jsx`: `handleAddToCart` simplified back to dispatch-only + success toast.
- `ProductDetailModal.jsx`: unchanged from iteration 1.
- 2 new tests in `ProductCard.test.jsx`; 3 new tests in `ProductDetailModal.test.jsx`.
- `spec.md` "Cart already at max quantity" edge case updated to inline-only.

---

## 2026-02-24 — QuantitySelector: Dismiss Validation Message on Blur (001)

### AI Strategy

The developer reported that the min/max boundary validation message persisted on
screen after the user interacted with another element — it should clear when focus
leaves the QuantitySelector.

- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- Developer described the bug and desired behaviour.
- AI read `QuantitySelector.jsx`, identified root cause: `attempted` state was only
  cleared on a valid `onChange` call; no mechanism existed to clear it on external
  interaction.
- AI proposed an `onBlur` handler on the wrapper `div` that checks
  `e.currentTarget.contains(e.relatedTarget)` — clears the error only when focus truly
  leaves the component, not when moving between `−` / input / `+` internally.

### Human Audit

- **UX / Logic**: Human reported the UX defect. Boundary error message ("Minimum quantity
  is 1" / "Maximum quantity is 50") persisted after the user interacted elsewhere. It should
  be transient — cleared on blur. Human described the desired behaviour; AI produced the
  `onBlur` fix with the focus-containment check.

### Verification

- **new** — Error clears on focus-leave: Trigger error via decrement at min; then
  `fireEvent.blur` on the button; asserts `queryByRole('alert')` returns null. **Real bug
  found**: confirmed the message persisted before the fix; test passes after.

### Outcome

- `QuantitySelector.jsx`: `handleBlur` function + `onBlur={handleBlur}` on wrapper `div`.
- `QuantitySelector.test.jsx`: 1 new test (`error message clears when focus leaves the
  component`); count 10 → 11.
- `spec.md` FR-019: blur-dismiss requirement added.
- `contracts/component-interfaces.md`: blur-dismiss accessibility note added.
- No regressions — all 10 prior QuantitySelector tests unchanged.

---

## 2026-02-24 — Remove Out-of-Stock Feature (001)

### AI Strategy

The developer decided to remove the OOS simulation entirely — FakeStore API has no
stock field and the hardcoded `Set([3, 7])` adds complexity without business value.

- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- Developer commented out `OUT_OF_STOCK_IDS` in `src/constants/index.js` as the
  initiating signal.
- AI used `CLAUDE.md` project structure to locate all affected files without guidance,
  ran grep for `OUT_OF_STOCK_IDS` occurrences, identified 7 affected files, and applied
  edits across source, tests, spec, plan, and tasks in a single session.

### Human Audit

- **Scope / UX**: Human initiated the removal. OOS feature was simulated via a hardcoded
  `Set([3, 7])` constant; FakeStore API has no stock field; the feature adds UX complexity
  without real data to back it. Human commented out the constant as the initiating signal;
  AI completed the full removal across all files.

### Verification

No new tests were added — existing tests were updated to remove OOS-specific assertions.
The remaining test suite covers all other cart and product functionality.

Files changed:

- `src/constants/index.js` — Removed `OUT_OF_STOCK_IDS` export.
- `src/components/ProductCard/ProductCard.jsx` — Removed `isOutOfStock` prop, `oos` var,
  badge render, disabled states, and `Badge` import.
- `src/components/ProductGrid/ProductGrid.jsx` — Removed `OUT_OF_STOCK_IDS` import and
  `isOutOfStock` prop passthrough.
- `src/components/ProductDetailModal/ProductDetailModal.jsx` — Removed `OUT_OF_STOCK_IDS`
  import, `isOOS` var, OOS conditional JSX branch, and `Badge` import.
- `src/components/ProductCard/ProductCard.test.jsx` — Removed 3 OOS test cases and
  `isOutOfStock={false}` default prop.
- `src/components/ProductDetailModal/ProductDetailModal.test.jsx` — Removed
  `OUT_OF_STOCK_IDS` import, OOS product fixture, and 1 OOS test.
- `tests/integration/add-to-cart.test.jsx` — Removed `OUT_OF_STOCK_IDS` import, OOS
  product from mock data, and 2 OOS tests; `toHaveLength` updated 3 → 2.

### Outcome

- OOS feature fully removed from source code, tests, spec, plan, and tasks.
- FR-016a and FR-016b removed from `spec.md`; FR-017 updated to drop the "in-stock"
  qualifier.
- `OUT_OF_STOCK_IDS` row removed from `plan.md` Technical Context and Key Decisions
  tables.
- Test count reduced by 6 (3 ProductCard + 1 ProductDetailModal + 2 integration).

<!-- Append new entries below this line, oldest at top, newest at bottom. -->
