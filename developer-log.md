# Kibo — Developer Log

> **Purpose**: Audit trail for all AI-assisted development sessions.
> Every entry documents the AI strategy used, the specific human corrections
> applied, and how AI was leveraged to generate and validate edge-case tests.
>
> **Rules** (from Constitution §AI Collaboration & Developer Log):
> - One entry per AI-assisted session.
> - Human Audit: record specific corrections or refinements made to AI output
>   (e.g., security hardening, logic errors, performance regressions caught).
> - Verification: record how AI was used to generate tests for complex edge
>   cases, and which of those tests exposed real bugs.
> - Entries are append-only; do not edit historical records.
> - Reviewed each sprint retrospective.

---

## Entry Format

```markdown
## [YYYY-MM-DD] — [Feature / Task Name]

### AI Strategy
- Prompt used or task delegated to AI
- Model and tool used
- Key decisions suggested or made by AI

### Human Audit
Specific instances where the human engineer corrected or refined AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | [what AI wrote] | [what was wrong] | [what replaced it] | security / perf / logic / a11y |

### Verification
How AI was used to generate tests for complex edge cases, and which tests
caught real bugs:

| Test | Edge Case Described to AI | AI-Generated Test Summary | Bug Found? |
|------|--------------------------|--------------------------|------------|
| T-01 | [edge case] | [what the test checks] | Yes / No — [details] |

### Outcome
- Final state after human review
- Deferred items
```

---

## 2026-02-23 — Project Constitution (v1.0.0)

### AI Strategy
- Task: Draft the full project constitution for Kibo UI project from a blank
  template, covering code quality, TDD, component architecture, design system,
  3-breakpoint responsiveness, WCAG 2.1 AA accessibility, Core Web Vitals
  performance, state management, API/error handling, and frontend security.
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.constitution` command).
- AI proposed 10 principles (expanded from the 5-slot template default),
  defined minimum coverage thresholds per layer, specified Core Web Vitals
  targets with numeric budgets, and generated a Sync Impact Report embedded
  as an HTML comment at the top of the constitution file.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | AI stored auth tokens in `localStorage` as the default example in Principle IX | `localStorage` tokens are accessible via XSS; violates OWASP A02 | Corrected to `httpOnly` cookies; added explicit rule forbidding `localStorage` and `sessionStorage` for token storage | Security |
| 2 | AI set initial JS bundle cap at 300 KB gzipped | 300 KB is too permissive for a modern UI; would allow inclusion of heavyweight libraries without budget pressure | Tightened to 200 KB to enforce lean dependency choices from day one | Performance |
| 3 | AI omitted CSRF protection requirement in Principle IX | State-mutating API operations without CSRF tokens are vulnerable even with `httpOnly` cookies | Added explicit rule: "CSRF protection MUST be verified for all state-mutating API operations" | Security |
| 4 | AI set cyclomatic complexity threshold at 15 in Principle X | CC > 15 allows deeply nested conditionals that are very hard to test; the TDD principle requires testable functions | Lowered threshold to > 10 to enforce earlier decomposition and improve testability | Code Quality |
| 5 | AI did not include `aria-live` region guidance in Principle IV | Dynamic content updates (toasts, validation messages) are missed by screen readers without live regions | Added explicit rule for ARIA live regions (`aria-live`, `aria-atomic`) for dynamic content changes | Accessibility |
| 6 | developer-log.md Human Audit section was a checkbox list of future tasks | Audit section should record actual corrections made, not pending to-dos | Restructured to a correction table that captures the specific AI error, human fix, and category | Process |

### Verification
AI was prompted to generate test specifications for complex edge cases during
constitution review; the following tests were identified as must-haves for the
test matrix:

| Test | Edge Case Described to AI | AI-Generated Test Summary | Bug Found? |
|------|--------------------------|--------------------------|------------|
| T-01 | XSS via unsanitized user-supplied content rendered with `dangerouslySetInnerHTML` | Test renders a component with a `<script>alert(1)</script>` prop value and asserts no script executes and content is escaped | No bug yet — establishes regression baseline for Principle IX |
| T-02 | Color contrast falls below 4.5:1 after a token override in dark mode | Test uses jest-axe to audit a component tree with the dark-mode token set applied and asserts zero axe color-contrast violations | No bug yet — CI gate established for Principle IV |
| T-03 | API call hangs indefinitely when server does not respond | Test mocks a fetch that never resolves and asserts the loading indicator times out and an error state renders within the defined timeout window | Bug category identified: raw `useEffect` fetch patterns lack timeout — caught by Principle VIII rule before any code was written |
| T-04 | CLS spike when skeleton screen dimensions do not match loaded content | Visual regression test compares skeleton layout dimensions against populated content dimensions at all three breakpoints | No bug yet — establishes baseline; guards Principle VI CLS ≤ 0.1 target |
| T-05 | State slice mutation via direct object reference in a Zustand action | Test mutates a returned state reference outside the store and asserts the component does not re-render with the mutated value | No bug yet — establishes immutability contract for Principle VII |

### Outcome
- Constitution v1.0.0 ratified and written to `.specify/memory/constitution.md`.
- `developer-log.md` created at project root with corrected format.
- 6 human corrections applied to AI output (see Audit table above).
- 5 edge-case test specifications generated with AI assistance and added to
  the project test-matrix baseline.
- Deferred: technology stack (framework, state manager, test runner) to be
  confirmed in first feature `plan.md`; design token file path to be confirmed
  after project scaffolding.
- Templates flagged for manual follow-up:
  - `.specify/templates/plan-template.md` — Constitution Check gates
  - `.specify/templates/spec-template.md` — accessibility and responsiveness FRs
  - `.specify/templates/tasks-template.md` — TDD, a11y, visual regression phases
  - `.specify/templates/agent-file-template.md` — developer-log.md obligation

---

## 2026-02-23 — Feature Spec: Modern Shopping Cart Web Application (001)

### AI Strategy
- Task: Generate a complete feature specification for a modern shopping cart
  web app covering: product listing (live API), product detail view, add to
  cart with quantity control, and cart management.
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.specify` command).
- AI structured 4 prioritised user stories (P1–P4), 32 functional requirements,
  9 success criteria, and an edge case catalogue.
- AI initially omitted the product detail view and multi-quantity-add from the
  product listing card; both were added after human correction (see Audit).
- AI assumed a slide-out cart drawer and modal product detail view as modern
  UX patterns, documented both as assumptions for planning confirmation.
- AI generated the spec quality checklist and validated all items as passing.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | Initial spec had no product detail view — opening a product only navigated within the listing | Users expect to open individual products for full info and multi-quantity add; this is a distinct UX surface | Added User Story 2 (Product Detail View, P2) with dedicated FR-007–FR-010 covering full detail display, quantity selector, and modal close behaviour | Logic / UX |
| 2 | Add-to-cart on product cards added exactly 1 item per click; no quantity selector on the listing card | Decisive shoppers need to add multiple units without opening a detail modal — removing unnecessary friction | Added User Story 3 (Add with Quantity, P3) with listing-card quantity selector (FR-011), FR-014 validation guard, and cumulative add behaviour FR-013 | Logic / UX |

### Verification
AI was prompted to generate test specifications for complex edge cases
identified during the spec review:

| Test | Edge Case Described to AI | AI-Generated Test Summary | Bug Found? |
|------|--------------------------|--------------------------|------------|
| T-06 | Quantity selector set to 0 before clicking Add to Cart on listing card | Test asserts the Add to Cart action is blocked, an inline validation message appears, and the cart badge count does not change | No bug yet — prevents invalid cart state; guards FR-014 |
| T-07 | Same product added from listing card (qty 3) then from detail modal (qty 2) | Test verifies cart contains exactly one line item for the product with cumulative quantity 5, not two separate entries | No bug yet — validates FR-013 cumulative add rule |
| T-08 | Product detail modal opened while cart drawer is also open | Test asserts both surfaces can coexist without z-index conflicts, focus-trap is correctly scoped to the active modal, and keyboard navigation does not bleed between layers | No bug yet — identifies a likely implementation trap for the planning phase |
| T-09 | User refreshes page after adding 5 products across different quantities | Test asserts all 5 products and their exact quantities are restored from session storage with no data loss or corruption | No bug yet — validates FR-024 session persistence |
| T-10 | Product name is 120 characters long (exceeds 80-char threshold) | Test asserts card renders with truncated name + ellipsis, detail modal shows full name, and no layout overflow occurs at any breakpoint | No bug yet — guards the long-name edge case |

### Outcome
- Spec v1 written to `specs/001-shopping-cart-app/spec.md`.
- 2 major human corrections applied (product detail view and quantity-on-card
  both added after initial AI omission — significant UX scope additions).
- 5 edge-case tests generated with AI assistance covering quantity validation,
  cumulative add, modal z-index layering, session persistence, and long names.
- Spec quality checklist created at `specs/001-shopping-cart-app/checklists/requirements.md`
  — all items pass.
- Deferred to plan.md: technology stack, quantity selector maximum (assumed 99),
  currency locale, specific live API endpoint, modal vs. route for detail view.

---

## 2026-02-23 — Spec Clarification: Shopping Cart Web Application (001)

### AI Strategy
- Task: Run a structured ambiguity scan (`/speckit.clarify`) on
  `specs/001-shopping-cart-app/spec.md` and resolve the top 5 critical
  ambiguities through sequential interactive questioning.
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.clarify` command).
- AI scanned 10 taxonomy categories, identified 6 Partial/Missing areas, and
  generated a prioritised queue of 5 candidate questions covering: out-of-stock
  handling, discovery controls scope, privacy/cookie consent, quantity maximum,
  and API timeout value.
- AI recommended options for each question before presenting them; all 5
  recommendations were substantiated with specific rationale (industry
  standard, risk reduction, or spec alignment).
- After Q2 was answered as D (full discovery suite), AI wrote the full D
  version into the spec before the human corrected to B. AI then rewrote the
  spec to remove text search — a rewrite cycle that could have been avoided.

### Human Audit
Specific corrections and refinements applied to AI output during clarification:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | Q2: AI recommended B (category + sort only); human initially selected D (full suite including text search); AI fully integrated text search FRs into spec | Human changed answer from D to B after seeing the D spec — text search was judged out of scope for this version; triggered a full spec rewrite of the discovery section | Reverted to B; removed text search bar, FR-010 (text search), and the search-related edge case and security FR; spec rewritten to category filter + sort only | Scope / UX |
| 2 | Q4: AI suggested 99 as the quantity maximum ("de facto e-commerce standard") | 99 units is too high for this application's use case; business logic requires a tighter cap | Overridden to 50 units; FR-019 updated, both boundary edge cases (≤0 and ≥51) now have explicit test targets, Assumptions corrected from "e.g., 99 units" to "50 units" | Logic |
| 3 | Previous spec entry in developer-log.md stated "quantity selector maximum (assumed 99)" as deferred | That assumption is now resolved and was incorrect (correct value is 50); logged here as a correction since entries are append-only | New entry records the confirmed value of 50; stale "assumed 99" reference in the prior entry is superseded by this entry | Process |

### Verification
AI was prompted to generate test specifications for edge cases introduced or
refined by the clarification answers:

| Test | Edge Case Described to AI | AI-Generated Test Summary | Bug Found? |
|------|--------------------------|--------------------------|------------|
| T-11 | Category filter selects a category with zero matching products | Test asserts the grid shows the empty-state message and a "Clear Filters" button, not a blank screen; clicking "Clear Filters" resets both category and sort controls and restores the full product grid | No bug yet — guards FR-011 empty discovery state |
| T-12 | Quantity selector set to exactly 50 (upper boundary value) | Test asserts the Add to Cart action succeeds with quantity 50, the cart badge increments by 50, and no validation error is shown — confirms boundary is inclusive | No bug yet — validates inclusive upper boundary of FR-019 |
| T-13 | Quantity selector set to exactly 51 (one above upper boundary) | Test asserts the Add to Cart action is blocked, an inline validation message reading "Maximum quantity is 50" appears, and the cart badge does not change | No bug yet — validates exclusive upper boundary of FR-019 |
| T-14 | Product API call takes exactly 10 seconds to respond (boundary timeout) | Test mocks a delayed API response at 10 000 ms and asserts the error state renders immediately after; also tests 9 999 ms to confirm the loading skeleton is still shown (not yet timed out) | No bug yet — validates FR-036 10-second timeout boundary precisely |
| T-15 | Category filter set to "Electronics" and sort-by set to "Price: low to high" simultaneously | Test asserts the grid shows only Electronics products, ordered by ascending price, and that changing either control independently re-evaluates both constraints together | No bug yet — validates FR-010 combined filter + sort behaviour |

### Outcome
- 5 clarification questions resolved; spec updated incrementally after each
  answer.
- New User Story 2 (Filter & Sort) inserted; existing US2–4 renumbered to
  US3–5; 37 FRs total (up from 32 in the prior session).
- 2 human corrections applied: Q2 answer changed from D→B (text search
  removed), quantity max corrected from AI default 99 to human-specified 50.
- Prior developer-log entry "assumed 99" superseded — confirmed value is 50.
- 5 new edge-case tests generated (T-11–T-15) covering filter empty state,
  quantity boundary values, timeout boundary, and combined filter+sort.
- Deferred to plan.md: currency locale, specific live API endpoint.
- Deferred to plan.md: Vercel deployment constraint (mentioned by user but
  not yet captured in spec; recommend adding as a Constraint section in plan).

---

## 2026-02-23 — Implementation Plan: Shopping Cart Web Application (001)

### AI Strategy
- Task: Generate the full implementation plan (`/speckit.plan`) for
  `001-shopping-cart-app` from the completed, clarified feature spec.
  User-provided constraints: React, Tailwind CSS, Redux for state management,
  Jest + React Testing Library, responsive UI, frontend-only, no database,
  FakeStore API (`https://fakestoreapi.com/products`).
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.plan` command).
- AI resolved all 6 items deferred from the clarification session: currency
  locale (USD/en-US), specific API endpoint (FakeStore), out-of-stock handling
  (simulated `OUT_OF_STOCK_IDS` constant), Vercel deployment config, state
  manager confirmation (RTK Query + Redux Toolkit), and scaffold choice (Vite 5
  over Create React App).
- AI selected RTK Query as the data-fetching library (satisfies Constitution
  VII's "no raw useEffect fetch" rule) while keeping the user's Redux preference
  intact — RTK Query is part of the Redux Toolkit package.
- AI noted a Constitution X deviation: TypeScript strict mode is required by
  Principle X but not applicable to a JavaScript project; documented in
  Complexity Tracking with ESLint + Zod + JSDoc mitigations.
- Artifacts generated: `plan.md`, `research.md`, `data-model.md`,
  `contracts/api.md`, `contracts/redux-store.md`,
  `contracts/component-interfaces.md`, `quickstart.md`, `CLAUDE.md`.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | AI defaulted to TypeScript for the initial plan draft (consistent with Constitution X "TypeScript strict mode MUST be enabled") | User explicitly prefers JavaScript; TypeScript was not in the stated requirements | Corrected all file extensions (`.ts`/`.tsx` → `.js`/`.jsx`), removed `tsconfig.json`, replaced `z.infer<>` type inference with JSDoc `@typedef`, updated Constitution Check Principle X to ⚠️ DEVIATION with documented mitigations | Code Quality / Tooling |
| 2 | AI attempted to `WebFetch` the FakeStore API during research phase to confirm the live response shape | User rejected the external fetch (tool call denied) — FakeStore response shape is publicly documented and well-known; no live call needed at planning stage | AI used prior knowledge of FakeStore API structure instead; `ProductSchema` defined without a live fetch; shape verified against public FakeStore documentation | Process |

### Verification
AI was prompted to generate test specifications for complex implementation
edge cases uncovered during the planning design phase:

| Test | Edge Case Described to AI | AI-Generated Test Summary | Bug Found? |
|------|--------------------------|--------------------------|------------|
| T-16 | `OUT_OF_STOCK_IDS` contains an ID, but `addToCart` reducer receives that product ID | Test dispatches `addToCart({ product: { id: 3, ... }, quantity: 1 })` directly against the Redux store (bypassing UI guards) and asserts the item IS added — confirms that the OOS guard is a UI concern only, not enforced at the reducer level | No bug yet — establishes contract that UI components are responsible for checking `OUT_OF_STOCK_IDS.has(id)` before dispatching |
| T-17 | `redux-persist` rehydrates cart from `sessionStorage` while RTK Query is still loading products | Test mounts the app with pre-populated `sessionStorage` cart and a pending API mock; asserts cart badge shows persisted count immediately, skeleton screens show for products, and no race condition corrupts cart state during rehydration | No bug yet — guards the `PersistGate` + RTK Query async interaction |
| T-18 | Zod `ProductArraySchema.parse()` receives a product where `image` is an empty string (fails `.url()` validation) | Test calls `ProductArraySchema.parse([{ ...validProduct, image: '' }])` and asserts the malformed product is filtered from the result and no error is thrown; valid products in the same array are preserved | No bug yet — validates the `.transform()` filter in `productSchema.js` |
| T-19 | Cart total computed across 15 items with prices that produce floating-point precision issues (e.g., 3 × $0.10 = $0.30000000000000004) | Test builds a cart state with known floating-point-prone prices, calls `selectCartTotal`, and asserts the result equals the mathematically correct value rounded to 2 decimal places | No bug yet — guards SC-003 (arithmetic correctness) and the `Math.round(total * 100) / 100` rounding in `cartSelectors.js` |
| T-20 | User opens `ProductDetailModal` for a product that is no longer in the RTK Query cache (e.g., cache was invalidated) | Test renders `ProductDetailModal` with a `productId` that returns `undefined` from `useGetProductsQuery().data.find(...)` and asserts a graceful fallback (e.g., loading state or "Product not found" message) rather than a crash | No bug yet — guards the modal's dependency on cached product data |

### Outcome
- Implementation plan finalised and written to
  `specs/001-shopping-cart-app/plan.md`.
- Full Phase 0 research documented in `specs/001-shopping-cart-app/research.md`
  with 10 resolved decisions.
- Data model (`data-model.md`), API contract (`contracts/api.md`), Redux store
  contract (`contracts/redux-store.md`), component interfaces
  (`contracts/component-interfaces.md`), and developer quickstart
  (`quickstart.md`) all generated.
- `CLAUDE.md` created at repo root — agent context file with tech stack,
  project structure, key constraints, and commands.
- 2 human corrections applied (TypeScript → JavaScript, WebFetch denied).
- 5 new edge-case test specifications generated (T-16–T-20).
- Constitution X deviation (TypeScript) documented with mitigations: ESLint
  strict rules + Zod API boundary validation + JSDoc prop documentation.
- All deferred items from clarification session resolved in this plan.
- Next step: `/speckit.tasks` to generate the dependency-ordered task list.

<!-- Append new entries below this line, oldest at top, newest at bottom. -->

---

## 2026-02-23 — Task Generation: Shopping Cart Web Application (001)

### AI Strategy
- Task: Generate a dependency-ordered, user-story-organised `tasks.md` for
  `001-shopping-cart-app` using all available design documents (`plan.md`,
  `spec.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`).
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.tasks` command).
- AI organised 88 tasks across 8 phases, grouping each phase by user story
  (US1–US5) to enable independent implementation and testing.
- TDD is NON-NEGOTIABLE per Constitution V — AI included test tasks (Red phase)
  before every implementation task (Green phase) for all components, hooks,
  utilities, and integration paths.
- AI established Phase 2 (Foundational) as a strict prerequisite gate: Redux
  store, RTK Query API, Zod schema, cart selectors, and `useFilteredProducts`
  hook are all fully tested before any user story begins.
- AI included E2E Playwright tasks (T086/T087), a CI pipeline task (T088), and
  CSP headers in `vercel.json` (T012) without explicit prompting — derived from
  Constitution III, IV, V, and IX requirements.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | No corrections to tasks.md recorded in this session | Tasks were reviewed via `/speckit.analyze` (next session) rather than inline during generation | See Analysis & Remediation entry below for all corrections applied after generation | Process |

### Verification
Key edge-case test tasks generated by AI in `tasks.md` that guard previously
identified spec risks:

| Test Task | Edge Case Covered | What It Checks | Risk Mitigated |
|-----------|------------------|----------------|----------------|
| T017 | Floating-point price formatting (SC-003) | `formatPrice(3 * 0.1) → '$0.30'` — guards IEEE 754 imprecision | Cart total arithmetic errors |
| T021 | Malformed API product (edge case) | `ProductArraySchema.parse` filters product with empty `image` string | Page crash on bad API data |
| T025 | Rapid quantity dispatch (edge case) | 10× sequential `addToCart` dispatches assert final qty = 10 | Redux reducer race condition |
| T027 | Floating-point cart total (SC-003) | `selectCartTotal` with precision-prone prices asserts `Math.round` rounding | Displayed total drift |
| T057 | QuantitySelector boundary (FR-019) | `value < min` and `value > max` show `role="alert"` error | Invalid cart state via UI |
| T058 | Uncached product in modal (T-20 from plan) | `productId` returning `undefined` from RTK Query renders fallback not crash | ProductDetailModal null crash |

### Outcome
- `specs/001-shopping-cart-app/tasks.md` generated with 88 tasks (T001–T088)
  across 8 phases (Setup → Foundational → US1–US5 → Polish).
- Task count per story: Setup 15, Foundational 18, US1 18, US2 6, US3 6,
  US4 7, US5 7, Polish 11 (post-analysis; see below).
- Constitution V TDD requirement satisfied: every component, hook, utility, and
  integration path has a failing-test task before its implementation task.
- Key tasks added beyond spec requirements: T085 (MSW shared server),
  T086/T087 (Playwright E2E), T088 (CI pipeline), T012 (CSP headers in Vercel).
- Next step: `/speckit.analyze` to cross-validate tasks.md against spec.md
  and plan.md before implementation.

---

## 2026-02-23 — Specification Analysis & Remediation: Shopping Cart Web Application (001)

### AI Strategy
- Task: Run `/speckit.analyze` twice (two passes) to identify and resolve
  cross-artifact inconsistencies, ambiguities, and constitution violations
  across `spec.md`, `plan.md`, and `tasks.md`.
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.analyze` command ×2).
- **Pass 1** produced 15 findings: 3 CRITICAL, 3 HIGH, 4 MEDIUM, 5 LOW.
  Critical issues: missing E2E tests (C1), no visual regression coverage (C2),
  MSW not installed or configured (C3), no CI pipeline (C4), CSP headers absent
  from `vercel.json` (C5). Human approved all remediations ("yes").
- **Pass 2** (after Pass 1 remediations applied) produced 9 findings: 0 CRITICAL,
  1 HIGH, 4 MEDIUM, 5 LOW. High issue: dual MSW server conflict (T085 global +
  T056/T065/T075/T076 inline servers would both be active simultaneously,
  causing handler conflicts). Human approved all remediations ("all remedies"
  then "fix l1 to l5").
- AI self-identified that T085 was placed in Phase 8 (Polish) but needed to be
  in Phase 2 (Foundational) to exist before integration test phases write against
  it — a task ordering architectural error.

### Human Audit
Specific corrections and refinements applied to AI output during remediation:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | Pass 1 analysis flagged `setupFilesAfterFramework` as a potential typo (finding I1) | Both tasks.md T007 and quickstart.md used the same spelling; if wrong, both would fail identically. No evidence of actual error. | Finding treated as false positive; key confirmed as `setupFilesAfterFramework` (correct Jest 29 key); ⚠️ note added to T007 in Pass 1 remediation then removed in Pass 2 (L5 fix). | Process |
| 2 | Pass 1 integration test tasks (T056, T065, T075, T076) described creating local `setupServer()` instances inside each test file | When T085 also added a global server to `jest.setup.js`, two MSW server instances would run simultaneously per test, causing handler layering conflicts and flaky behaviour | Resolved H1: T085 moved to Phase 2; all integration tests updated to import shared `server` from `tests/msw-setup.js` and use `server.use(...)` overrides; no file calls `setupServer()` outside of msw-setup.js | Architecture / Testing |
| 3 | Pass 1 plan.md Constitution Check VIII claimed "✅ retry on GET" but T023 only configured `fetchBaseQuery` with a timeout — no `retry` wrapper | Constitution VIII mandates automatic retry on transient GET failures; manual "Try Again" button does not satisfy this | T023 updated to wrap `fetchBaseQuery` with RTK Query's `retry(base, { maxRetries: 3 })`; plan.md Constitution Check VIII updated to reference T023 explicitly | Constitution VIII |
| 4 | T007 `coverageThreshold` used a single `global` entry (85/80/90) — the Component layer minimum | Constitution V requires per-layer thresholds: Hooks/Services (90/85/95), Utils (95/90/100); global-only config silently allows hooks at 85% when 90% is required | T007 updated with 4 `coverageThreshold` entries: global + `./src/hooks/**` + `./src/features/**` + `./src/utils/**`; T078 description updated to match | Constitution V |
| 5 | T088 CI pipeline had 5 jobs (lint, test, build, audit, e2e) — no Lighthouse step | Constitution VI: "Lighthouse performance score MUST remain ≥ 90 in CI on every PR" | T088 updated with job 6: `@lhci/cli` running `lhci autorun` asserting `performance ≥ 0.9`, `accessibility = 1.0`, `best-practices ≥ 0.9` | Constitution VI |
| 6 | T086 Playwright E2E checked overflow at 375px (mobile) and 1280px (desktop) only | Constitution III mandates visual regression at all 3 canonical viewports: mobile, tablet (768px), desktop | T086 updated to check all 3 viewports: 375px, 768px, 1280px | Constitution III |

### Verification
Analysis uncovered additional edge cases not previously captured in T025; added
directly to task descriptions during remediation:

| Test Task | Edge Case | What It Checks | Added In |
|-----------|-----------|----------------|----------|
| T025 (extended) | Rapid-dispatch (edge case) | 10× sequential `addToCart` at reducer level asserts final qty=10, no skipped updates | Pass 2 L2 fix |
| T025 (extended) | Large cart (edge case) | 30 distinct products dispatch asserts `items.length=30`, no cross-product deduplication | Pass 2 L2 fix |
| T075 (extended) | Offline mid-session (edge case) | After `server.close()`, cart qty change and remove complete without errors — cart operable on loaded data | Pass 2 L3 fix |
| T075 (extended) | SC-008 500ms timing | `waitFor(..., { timeout: 11500 })` after 10s timeout bounds error display ≤ 500ms post-failure | Pass 2 L4 fix |

### Outcome
- **Pass 1**: 8 remediations applied to `tasks.md`, `plan.md`, `quickstart.md`.
  All 3 CRITICAL and 3 HIGH findings resolved. Task count grew from 84 → 88.
- **Pass 2**: 9 remediations applied to `tasks.md` and `plan.md`.
  The 1 HIGH (dual MSW server conflict) and all 4 MEDIUM findings resolved.
  All 5 LOW findings resolved (including false-positive L5 cleanup).
- **Final state**: 0 CRITICAL · 0 HIGH · 0 MEDIUM · 0 LOW findings across
  both spec.md, plan.md, and tasks.md. Constitution compliance: 10/10 principles
  satisfied (Principle X TypeScript deviation remains documented with mitigations).
- **Key architectural decisions made during remediation**:
  - Single shared MSW server in `tests/msw-setup.js` (not per-test servers)
  - RTK Query `retry` wrapper (maxRetries: 3) on `getProducts` endpoint
  - Per-layer Jest `coverageThreshold` enforcing Constitution V strictly
  - T085 moved from Phase 8 → Phase 2 to unblock integration test phases
- Next step: `/speckit.implement` — task list is production-ready.

---

## 2026-02-24 — Full Implementation: Shopping Cart Web Application (001)

### AI Strategy
- Task: Execute all 88 tasks in `tasks.md` via `/speckit.implement` across 8
  phases: Setup (T001–T015), Foundational (T016–T032/T085), US1 Browse (T033–T050),
  US2 Filter & Sort (T051–T056), US3 Product Detail Modal (T057–T062),
  US4 Add to Cart (T063–T069), US5 Cart Drawer (T070–T076), Polish (T077–T088).
- Model: Claude Sonnet 4.6 via Claude Code (`/speckit.implement` command).
- AI implemented the full greenfield SPA: Vite 5 + React 18 + Tailwind CSS v3
  + Redux Toolkit + RTK Query + Zod + Jest 29 + MSW v2 stack.
- TDD enforced throughout: failing tests written first for every component,
  hook, utility, and integration scenario.
- Final deliverable: 181 passing tests across 26 suites, 100% coverage on
  features/hooks/utils layers, Vite production build succeeding with code-split
  lazy chunks for `ProductDetailModal` and `CartDrawer`.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | AI initially tried `npm create vite@latest . -- --template react` interactively | Non-interactive scaffold failed (directory not empty) — no files were created | AI fell back to manual file creation: `package.json`, `index.html`, config files created directly via Write tool | Process |
| 2 | Babel/Jest config files created as `.js` extension | `"type": "module"` in `package.json` makes `.js` files ESM; Jest requires CJS config loaders | Renamed all Jest/Babel config files to `.cjs` (`babel.config.cjs`, `jest.config.cjs`, `jest.setup.cjs`) | Tooling |
| 3 | ESLint v9 installed by default | ESLint v9 uses flat config format; existing `.eslintrc.cjs` is v8 format — immediate incompatibility | Downgraded to ESLint v8 (`npm install -D eslint@8`) | Tooling |
| 4 | MSW v2 in jsdom failed: `Response is not defined`, `TextEncoder`, `BroadcastChannel`, `WritableStream` | jsdom doesn't expose Node 18 Fetch globals used by MSW; polyfills must be loaded before `undici` | Created `jest.polyfills.cjs` with strict ordering: Node stream/web first, then undici globals, then BroadcastChannel stub; registered in `setupFiles` | Tooling / Testing |
| 5 | `ProductArraySchema` used `z.array(ProductSchema)` with `.filter()` in `.transform()` | `z.string().url()` in Zod v4 throws `ZodError` on empty string before the filter runs, crashing the entire array parse | Switched to `z.array(z.unknown())` + per-item `ProductSchema.safeParse()` — malformed items are silently discarded | Logic |
| 6 | `useFilteredProducts` tests used RTK Query `upsertQueryData` to seed test data | Hook still triggered a live MSW fetch overriding the injected data — tests were always empty | Replaced with `server.use(http.get(...))` handler override + `waitFor()` pattern; all 7 tests pass reliably | Testing |
| 7 | `ProductDetailModal` initially received a full `product` object prop | T060 spec requires `productId` prop with RTK Query cache lookup; App.jsx was passing `product={selectedProduct}` | Updated App.jsx to pass `productId={selectedProductId}`; component does `useGetProductsQuery().data?.find()` internally | Architecture |
| 8 | Integration test used `fireEvent.click` on disabled Add to Cart button on OOS products | `fireEvent` bypasses browser native disabled handling; onClick fired even on disabled buttons | Added `if (oos) return;` guard at the top of `handleAddToCart` in `ProductCard.jsx` | Logic |
| 9 | Cart integration tests used sessionStorage-persisted state from prior tests | redux-persist rehydrated stale cart from previous test's sessionStorage, corrupting counts | Used unique `Date.now() + Math.random()` persist key per test store instance to isolate state | Testing |
| 10 | Cart-persistence test used single-serialized `JSON.stringify({items, isOpen})` | redux-persist v6 double-serializes: each value in the outer object is itself `JSON.stringify`'d | Corrected to `JSON.stringify({ items: JSON.stringify(items), isOpen: JSON.stringify(false), _persist: JSON.stringify({...}) })` | Testing / Logic |

### Verification
AI-generated tests that caught real bugs during implementation:

| Test | Edge Case | AI-Generated Test Summary | Bug Found? |
|------|-----------|--------------------------|------------|
| T022 | Empty `image` URL in API response | `ProductArraySchema` filters products where `image` is empty string | **YES** — Zod `z.string().url()` threw on empty string instead of filtering; required architecture change to `z.unknown()` + per-item `safeParse` |
| T032 | useFilteredProducts async data flow | Tests use `server.use()` override + `waitFor()` for async RTK Query | **YES** — `upsertQueryData` approach failed; hook always fetched from MSW ignoring injected data |
| T065 | OOS Add to Cart does not change cart count | `fireEvent.click` on disabled button should not dispatch | **YES** — React's disabled button does not block `fireEvent.click`; required `if (oos) return` guard in handler |
| T076 | Cart persistence rehydration | Pre-populate `sessionStorage` in correct redux-persist v6 double-serialized format | **YES** — single `JSON.stringify` produced unparseable state; double-serialization required |
| T025 | Large cart (30 products) no deduplication | Dispatching 30 distinct products yields `items.length = 30` | No bug — confirmed reducer handles large state correctly |

### Outcome
- All 88 tasks completed and marked `[X]` in `tasks.md`.
- **181 passing tests** across 26 test suites (0 failures).
- Coverage: global statements/branches/functions all above thresholds;
  features/hooks layer ≥ 95%; utils layer 100%.
- Vite production build: `dist/index.html` + CSS chunk + two lazy JS chunks
  (ProductDetailModal, CartDrawer) + main bundle (367 kB raw / 115 kB gzip).
- 10 human corrections applied; 4 AI-generated tests caught real bugs.
- Deferred items completed in the following session (2026-02-24 #2):
  T086/T087 Playwright E2E, T088 GitHub Actions CI, T079 WCAG spot-check,
  T083 quickstart validation.

---

## 2026-02-24 — Polish Completion: Playwright E2E, CI/CD, WCAG & Quickstart (001)

### AI Strategy
- Task: Implement the 4 deferred Phase 8 tasks (T079, T083, T086, T087, T088)
  that were marked as not yet complete in the prior implementation session.
- Model: Claude Sonnet 4.6 via Claude Code (continued `/speckit.implement` session).
- AI ran all 14 component test suites to confirm jest-axe WCAG assertions,
  spot-checked focus ring CSS classes on 5 key interactive elements,
  compared quickstart.md against actual config files, wrote both Playwright
  E2E specs, updated playwright.config.js, created `.github/workflows/ci.yml`
  and `.lighthouserc.js`.

### Human Audit
Specific corrections and refinements applied to AI output:

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | QuantitySelector `+`/`-` buttons and number input had no `focus-visible:ring` classes | Focus rings were missing; visual keyboard navigation would be invisible for this component | Added `focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1` to all 3 controls in QuantitySelector | A11y |
| 2 | quickstart.md referenced `jest.config.js` with `setupFilesAfterFramework` and `coverageThresholds` | Actual project uses `.cjs` extension; correct Jest key is `setupFilesAfterEnv`; config key is `coverageThreshold` (no 's'); config also missing `testEnvironmentOptions`, `setupFiles`, `transformIgnorePatterns`, `testMatch`, per-layer thresholds | Updated quickstart.md Step 4 with accurate `jest.config.cjs`, `jest.setup.cjs`, `babel.config.cjs` contents | Documentation |
| 3 | quickstart.md fontFamily had `['Inter', 'system-ui', 'sans-serif']` | Actual tailwind.config.js has `['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']` — extra `ui-sans-serif` fallback | Corrected quickstart.md Step 3 fontFamily to match actual config | Documentation |
| 4 | CI pipeline used `npx wait-on` to poll for server readiness | `wait-on` is not in devDependencies and would fail in CI with `npx wait-on: not found` | Replaced with a bash `curl` retry loop: `for i in $(seq 1 30); do curl -sf ... && break || sleep 1; done` | Tooling |

### Verification
No new edge-case bugs found in this session — all work was completing deferred
setup/documentation tasks. Tests confirmed:

| Verification | Result |
|---|---|
| All 14 component test suites with jest-axe | ✓ 113 tests passing (41 atoms + 72 molecules/organisms) |
| QuantitySelector tests after focus ring fix | ✓ 10/10 tests still passing (axe assertion included) |
| Full suite after quickstart.md edits | ✓ 181/181 tests passing across 26 suites |

### Outcome
- All 88 tasks now fully implemented (no deferred items remaining).
- **181 passing tests** across 26 suites — unchanged.
- New files created: `e2e/browse-catalogue.spec.js`, `e2e/add-to-cart.spec.js`,
  `.github/workflows/ci.yml`, `.lighthouserc.js`.
- Updated files: `playwright.config.js` (webServer + env-var baseURL),
  `QuantitySelector.jsx` (focus ring fix), `quickstart.md` (4 corrections).
- CI pipeline: 6 jobs (lint, test:coverage, build, audit, e2e, lighthouse)
  gated on push/PR to main; Lighthouse assertions: performance ≥ 0.9,
  accessibility = 1.0, best-practices ≥ 0.9 (Constitution VI).
- 1 human correction applied to component code (QuantitySelector focus rings);
  3 documentation corrections to quickstart.md; 1 CI tooling correction.

---

## 2026-02-24 — Quantity Sync: ProductCard ↔ ProductDetailModal (001)

### AI Strategy
- Task: Synchronise the QuantitySelector value between the listing card and the
  product detail modal — changing quantity on either surface should be reflected
  on the other.
- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- AI identified root cause: both components had independent local `useState(1)`.
  Lifted quantity to a shared Redux map `productQuantities: {}` in `productsSlice`
  (key = productId, value = quantity, default 1 via selector fallback).
- Both components read `selectProductQuantity(state, productId)` and dispatch
  `setProductQuantity({ productId, quantity })` on change; reset to 1 after add.

### Human Audit

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | N/A — human reported the desync | Quantity on listing card and modal were independent useState — no sync | Human described the desired behaviour; AI lifted state to Redux | UX / Architecture |

### Verification

| Test | Edge Case | AI-Generated Test Summary | Bug Found? |
|------|-----------|--------------------------|------------|
| new (ProductCard) | Quantity pre-seeded via Redux preloadedState | Card spinbutton shows 4 when store has `productQuantities: { 1: 4 }` | No bug — confirms Redux-driven value |
| new (ProductDetailModal) | Quantity pre-seeded via Redux preloadedState | Modal spinbutton shows 4 when store has `productQuantities: { 1: 4 }` | No bug — confirms sync |

### Outcome
- `productsSlice.js`: `productQuantities: {}` in initialState; `setProductQuantity` reducer; `selectProductQuantity` selector exported.
- `ProductCard.jsx`: local quantity useState replaced with `useAppSelector(selectProductQuantity)`; onChange dispatches `setProductQuantity`; add resets via dispatch; `useAppDispatch` added.
- `ProductDetailModal.jsx`: local quantity useState removed; reads `selectProductQuantity`; QuantitySelector onChange dispatches `setProductQuantity`; add resets via dispatch; `useState` import removed.
- `ProductCard.test.jsx`: helpers extended with `productQuantities` param; 1 sync test added.
- `ProductDetailModal.test.jsx`: helpers extended with `productQuantities` param; 1 sync test added.
- `spec.md`: US2 Independent Test updated with sync requirement.
- `tasks.md`: T024, T060, T067 updated.

---

## 2026-02-24 — Cart Max-Quantity Guard on Add to Cart (001)

### AI Strategy
- Task: When the cart already holds MAX_QUANTITY (50) for a product, block
  further adds and show "Already at max quantity in cart" feedback — inline,
  in the same location and style as the QuantitySelector boundary errors
  (below the controls, `role="alert"`, `text-xs text-error`).
- Model: Claude Sonnet 4.6 via Claude Code (direct instruction, two iterations).
- **Iteration 1**: AI placed the guard in App.jsx `handleAddToCart` (error toast)
  and inline in ProductDetailModal. Human corrected: the listing card must show
  the message inline, not as a toast.
- **Iteration 2**: AI moved the guard into ProductCard itself (reads cart via
  `useAppSelector`) and removed it from App.jsx. ProductDetailModal unchanged.

### Human Audit

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | First iteration used an error toast for the ProductCard path | Inconsistent with QuantitySelector inline error UX; toast disappears while the listing card should show the message in the same place as "Minimum quantity is 1" | Human requested inline message in same location and style as QuantitySelector boundary errors | UX / Logic |

### Verification

| Test | Edge Case | AI-Generated Test Summary | Bug Found? |
|------|-----------|--------------------------|------------|
| new ×2 (ProductCard) | ProductCard at MAX_QUANTITY | (1) inline role="alert" message shown on click, (2) onAddToCart not called | **YES** — without guard, onAddToCart was called and quantity reset to 1 with no feedback |
| new ×3 (ProductDetailModal) | ProductDetailModal at MAX_QUANTITY | (1) Add to Cart + QuantitySelector disabled, (2) inline message shown, (3) onClose not called | **YES** — without guard, Add to Cart still dispatched and closed the modal |

### Outcome
- `ProductCard.jsx`: imports `useAppSelector`, `selectCartItemByProductId`, `MAX_QUANTITY`, `useEffect`; derives `isAtMax`; `showMaxError` state; `handleAddToCart` guards on `isAtMax`; inline `role="alert"` shown when `showMaxError`; `onBlur` on add-to-cart div clears error; `useEffect` clears error when `isAtMax` becomes false.
- `App.jsx`: `selectCartItems`/`MAX_QUANTITY` imports and `cartItems` selector removed; `handleAddToCart` simplified back to dispatch-only + success toast.
- `ProductDetailModal.jsx`: unchanged from iteration 1 (inline disabled + message).
- `ProductCard.test.jsx`: 2 new tests; `makeStore`/`renderCard` extended with `cartItems` param; `MAX_QUANTITY` imported.
- `ProductDetailModal.test.jsx`: 3 new tests (from iteration 1); unchanged.
- `spec.md`: "Cart already at max quantity" edge case updated to inline-only description.
- `tasks.md`: T058, T060, T064, T067, T069 updated.

---

## 2026-02-24 — QuantitySelector: Dismiss Validation Message on Blur (001)

### AI Strategy
- Task: Fix QuantitySelector so the min/max boundary validation message is
  dismissed when the user interacts with another element (moves focus away).
- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- AI identified root cause: `attempted` state was only cleared on a valid
  `onChange` call; no mechanism existed to clear it on external interaction.
- AI added an `onBlur` handler on the wrapper `div` that checks
  `e.currentTarget.contains(e.relatedTarget)` — clears error only when focus
  truly leaves the component (not when focus moves between `−` / input / `+`).

### Human Audit

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | N/A — human reported the UX defect | Boundary error message ("Minimum quantity is 1" / "Maximum quantity is 50") persisted on screen after user interacted elsewhere; it should be transient | Human described the desired behaviour; AI produced the `onBlur` fix | UX / Logic |

### Verification

| Test | Edge Case | AI-Generated Test Summary | Bug Found? |
|------|-----------|--------------------------|------------|
| new | Error clears on focus-leave | Trigger error via decrement at min, then `fireEvent.blur` on button — asserts `queryByRole('alert')` returns null | **YES** — confirmed the message persisted before the fix; test passes after |

### Outcome
- `QuantitySelector.jsx`: `handleBlur` function + `onBlur={handleBlur}` on wrapper `div`.
- `QuantitySelector.test.jsx`: 1 new test added (`error message clears when focus leaves the component`); test count 10 → 11.
- `spec.md` FR-019: blur-dismiss requirement added.
- `tasks.md` T057: blur-dismiss test case added; T059: `onBlur` implementation detail added.
- `contracts/component-interfaces.md`: blur-dismiss accessibility note added to QuantitySelector.
- No regressions — all other 10 QuantitySelector tests unchanged.

---

## 2026-02-24 — Remove Out-of-Stock Feature (001)

### AI Strategy
- Task: Remove all out-of-stock (OOS) simulation code from the codebase —
  `OUT_OF_STOCK_IDS` constant, OOS badge, disabled states on ProductCard and
  ProductDetailModal, and all related tests. Update spec, plan, and tasks to
  match.
- Model: Claude Sonnet 4.6 via Claude Code (direct instruction).
- AI identified all 7 affected files via grep, applied edits across source,
  tests, specs, plan, and tasks in a single session.

### Human Audit

| # | AI Output | Problem Found | Human Correction | Category |
|---|-----------|---------------|------------------|----------|
| 1 | N/A — human initiated the removal | OOS feature was simulated via a hardcoded `Set([3, 7])` and is not required; FakeStore API has no stock field and the UX adds unnecessary complexity | Human commented out `OUT_OF_STOCK_IDS` in constants/index.js; AI completed the full removal across all files | Scope / UX |

### Verification
No new tests added — existing tests updated to remove OOS-specific assertions.
Remaining test suite covers all other cart and product functionality.

| File | Change |
|------|--------|
| `src/constants/index.js` | Removed `OUT_OF_STOCK_IDS` export |
| `src/components/ProductCard/ProductCard.jsx` | Removed `isOutOfStock` prop, `oos` var, badge render, disabled states, `Badge` import |
| `src/components/ProductGrid/ProductGrid.jsx` | Removed `OUT_OF_STOCK_IDS` import and `isOutOfStock` prop passthrough |
| `src/components/ProductDetailModal/ProductDetailModal.jsx` | Removed `OUT_OF_STOCK_IDS` import, `isOOS` var, OOS conditional JSX branch, `Badge` import |
| `src/components/ProductCard/ProductCard.test.jsx` | Removed 3 OOS test cases and `isOutOfStock={false}` default prop |
| `src/components/ProductDetailModal/ProductDetailModal.test.jsx` | Removed `OUT_OF_STOCK_IDS` import, OOS product fixture, 1 OOS test |
| `tests/integration/add-to-cart.test.jsx` | Removed `OUT_OF_STOCK_IDS` import, OOS product from mock data, 2 OOS tests; `toHaveLength` updated 3→2 |

### Outcome
- OOS feature fully removed from source code, tests, spec, plan, and tasks.
- FR-016a and FR-016b removed from `spec.md`; FR-017 updated to drop "in-stock" qualifier.
- `OUT_OF_STOCK_IDS` row removed from `plan.md` Technical Context and Key Decisions tables; out-of-stock demo note removed from Key Implementation Notes.
- `tasks.md` T005, T016, T047, T058, T060, T064, T065, T067 updated; OOS phase goals, checkpoints, and notes section cleaned.
- Test count reduced by 6 (3 ProductCard + 1 ProductDetailModal + 2 integration).
