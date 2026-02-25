<!--
SYNC IMPACT REPORT
==================
Version Change: (none) → 1.0.0
Constitution Bump Type: MAJOR — initial ratification, no prior version exists.

Modified Principles: N/A — initial document.

Added Sections:
  Core Principles:
    I.   Component Architecture (Modular & Reusable)
    II.  Design System Conformance
    III. Responsive-First Development
    IV.  Accessibility — WCAG 2.1 AA  (NON-NEGOTIABLE)
    V.   Test-Driven Development — TDD (NON-NEGOTIABLE)
    VI.  Performance Optimization
    VII. State Management Discipline
    VIII.API Integration & Error Handling
    IX.  Frontend Security
    X.   Code Quality & Maintainability
  Development Standards:
    - Loading States
    - Coverage Enforcement & Test Matrix
    - Dependency & Versioning Policy
  AI Collaboration & Developer Log:
    - developer-log.md structure and rules
  Governance:
    - Amendment procedure
    - Versioning policy
    - Compliance review cadence

Removed Sections: N/A

Templates Requiring Updates:
  ✅ .specify/memory/constitution.md         — updated (this file)
  ⚠️  .specify/templates/plan-template.md    — "Constitution Check" gates should
       reference Principles I–X explicitly; manually update the gate list.
  ⚠️  .specify/templates/spec-template.md    — FR templates should mandate
       accessibility (P-IV) and responsiveness (P-III) acceptance scenarios.
  ⚠️  .specify/templates/tasks-template.md   — task phases should include:
       TDD red-green-refactor task blocks, accessibility audit tasks,
       visual regression test tasks, and a security hardening phase.
  ⚠️  .specify/templates/agent-file-template.md — add reference to
       developer-log.md obligation for every AI-assisted session.

Deferred TODOs:
  - Confirm technology stack (framework, state manager, test runner) in the first
    plan.md; update Principle V and VII references accordingly.
  - Establish design token file path once project is scaffolded;
    update Principle II token source reference.
  - Create developer-log.md at project root (companion audit file).
-->

# Kibo Constitution

## Core Principles

### I. Component Architecture (Modular & Reusable)

Every UI element MUST be built as a self-contained, independently testable
component. Components MUST follow Atomic Design hierarchy:

- **Atoms** — smallest indivisible elements (Button, Input, Icon, Badge).
- **Molecules** — single-responsibility compositions of atoms.
- **Organisms** — complex UI regions composed of molecules.
- **Pages** — assemblies of organisms bound to routing and data layers.

**Rules**:
- A component MUST NOT reach outside its defined interface (props/slots/context)
  to manipulate sibling or ancestor state directly.
- Business logic MUST be separated from presentation; custom hooks or service
  modules own logic, components own rendering.
- Each component MUST have a co-located unit test file
  (`ComponentName.test.tsx`) in the same directory.
- Any component exceeding 300 lines of code MUST be decomposed before merge.
- Shared primitives (buttons, inputs, modals) MUST live in a `components/ui/`
  layer and MUST NOT import from feature-specific modules.

**Rationale**: Modularity reduces regression surface, accelerates reuse, and
enables independent story-level development across the team.

### II. Design System Conformance

The project MUST maintain a single design token source-of-truth. Every visual
decision — color, spacing, typography, elevation, motion — MUST be derived from
design tokens. Hard-coded style values in component code are forbidden.

**Rules**:
- Design tokens MUST be defined in a central configuration
  (e.g., `tokens/` directory or CSS custom properties) and consumed via
  utility classes or styled primitives.
- A component MUST NOT introduce a one-off color or spacing value without a
  corresponding token entry and team approval.
- All iconography MUST come from the approved icon library; ad-hoc SVG
  imports require documented justification.
- Dark mode and theme variants MUST be expressed as token overrides, not
  duplicated stylesheets or conditional style blocks.
- Design token changes MUST trigger a visual regression test run in CI.

**Rationale**: A consistent token contract prevents visual drift and enables
full theme changes without component-level rewrites.

### III. Responsive-First Development

Every feature MUST be designed and implemented across three canonical viewports
before it is considered complete:

| Breakpoint | Viewport Width | Alias |
|------------|---------------|-------|
| Mobile     | < 768 px      | `sm`  |
| Tablet     | 768 px–1199 px| `md`  |
| Desktop    | ≥ 1200 px     | `lg`  |

**Rules**:
- Implementation MUST begin at the mobile breakpoint and progressively enhance
  upward (mobile-first CSS methodology).
- No horizontal scroll is permitted at any defined breakpoint width.
- Touch targets MUST be ≥ 44×44 px on mobile viewports.
- Fluid typography and spacing MUST use relative units (`rem`, `%`, `vw/vh`);
  pixel-locked font sizes are forbidden.
- Automated visual regression tests MUST cover all three viewports for every
  new or modified component.
- Layout tests MUST assert the absence of overflow at each breakpoint.

**Rationale**: Building mobile-first prevents retroactive layout regressions
and ensures the product is usable for users on constrained devices and screens.

### IV. Accessibility — WCAG 2.1 AA (NON-NEGOTIABLE)

Every interface element MUST conform to WCAG 2.1 Level AA. Accessibility is a
release gate, not a post-launch backlog item.

**Rules**:
- Color contrast ratio MUST be ≥ 4.5:1 for normal text and ≥ 3:1 for large
  text (≥ 18 pt / 14 pt bold) and UI component boundaries.
- All interactive elements MUST be keyboard-navigable and display a visible,
  high-contrast focus indicator that is not suppressed via `outline: none`
  without a replacement.
- All non-decorative images MUST carry descriptive `alt` text; decorative
  images MUST use `alt=""` and `role="presentation"`.
- Dynamic content changes MUST be announced via ARIA live regions (`aria-live`,
  `aria-atomic`) where screen reader users would otherwise miss updates.
- Every form input MUST have a programmatically associated `<label>` element
  (via `for`/`id` pairing or `aria-labelledby`).
- Reading and keyboard navigation order MUST follow logical DOM order.

**Rationale**: Accessibility failures exclude users, create legal liability,
and are exponentially cheaper to fix during development than after launch.

### V. Test-Driven Development — TDD (NON-NEGOTIABLE)

The Red-Green-Refactor cycle is mandatory for all new features and bug fixes.
No production implementation code MAY be written before a failing test exists.

**Rules**:
- **Red** — Write a failing test that precisely defines the expected behavior.
- **Green** — Write the minimal implementation to make the test pass.
- **Refactor** — Improve structure and clarity without breaking tests.
- Minimum enforced coverage thresholds:

  | Layer              | Statement | Branch | Function |
  |--------------------|-----------|--------|----------|
  | Components         | 85 %      | 80 %   | 90 %     |
  | Hooks / Services   | 90 %      | 85 %   | 95 %     |
  | Utilities          | 95 %      | 90 %   | 100 %    |

- Tests MUST cover: happy path, all edge cases, error states, and loading
  states for every feature.
- Integration tests MUST cover the end-to-end user journey for every P1
  user story.
- Test file naming convention: `[ComponentName].test.tsx` co-located with
  source; E2E tests live in `e2e/`.

**Rationale**: TDD is the primary defect-prevention mechanism. Coverage
thresholds are minimum floors — teams are expected to exceed them.

### VI. Performance Optimization

The UI MUST meet Core Web Vitals targets measured under simulated 4G throttle
conditions at every production deployment candidate.

**Rules**:
- **LCP** (Largest Contentful Paint): MUST be ≤ 2.5 s.
- **INP** (Interaction to Next Paint): MUST be ≤ 200 ms.
- **CLS** (Cumulative Layout Shift): MUST be < 0.1.
- **Initial JS bundle** (gzipped, first load): MUST NOT exceed 200 KB.
- Images MUST be served in modern formats (WebP/AVIF) with explicit `width`
  and `height` attributes to prevent CLS.
- Code splitting MUST be applied at the route level; non-critical components
  MUST use lazy loading (`React.lazy` / dynamic import).
- Every third-party script addition MUST be accompanied by a documented
  performance budget impact assessment before approval.

**Rationale**: Performance is a user experience feature. Slow UIs reduce
conversion, retention, and accessibility for users on low-end devices or
limited network bandwidth.

### VII. State Management Discipline

Application state MUST be classified and stored at the appropriate scope.
Uncontrolled, sprawling global state is a defect category and is forbidden.

**Rules**:
- **Local UI state** (menus, hover, transient toggles): MUST live in
  component-local state (`useState`, `useReducer`).
- **Shared cross-component state**: MUST use a designated, documented state
  manager (e.g., Zustand, Redux Toolkit, or React Context); the choice MUST
  be recorded in the project's `plan.md`.
- **Server / async state**: MUST be managed via a data-fetching library
  (e.g., TanStack Query, SWR); raw `useEffect`-based fetch patterns are
  forbidden.
- Global state MUST be organized into domain slices; monolithic store objects
  are forbidden.
- State mutations MUST be explicit and traceable; direct object mutation is
  forbidden.
- Derived values MUST be computed via selectors or memoized computations, not
  redundantly stored as separate state entries.

**Rationale**: Undisciplined state management is the primary source of
hard-to-reproduce UI inconsistencies and stale data bugs.

### VIII. API Integration & Error Handling

All external data boundaries MUST be treated as unreliable. Every API call
MUST handle all three states — loading, success, and error — without exception.

**Rules**:
- Every fetch operation MUST render: a loading state UI, a success state UI,
  and an error state UI with user-actionable messaging.
- Raw API error strings MUST NOT be surfaced to users; all error messages MUST
  be human-readable and contextual.
- All API calls MUST have a defined timeout; indefinitely hanging requests are
  forbidden.
- Retry logic MUST be implemented for transient network failures on idempotent
  requests (GET, HEAD, OPTIONS).
- API response shapes MUST be validated at the boundary using runtime schema
  validation (e.g., Zod); unvalidated API responses MUST NOT propagate into
  component state.
- Empty and zero states MUST have a designed UI; blank screens for empty
  collections are forbidden.
- All API integration code MUST be isolated in a service/query layer;
  components MUST NOT contain `fetch`/`axios` calls directly.

**Rationale**: Network failures are inevitable. Defensive API handling
preserves user trust and prevents data corruption from partial operations.

### IX. Frontend Security

The UI MUST apply defense-in-depth against OWASP Top 10 client-side threats.
Security controls are non-negotiable and cannot be deferred.

**Rules**:
- All user-supplied content rendered to the DOM MUST be sanitized; direct
  `innerHTML` assignment with unsanitized data is forbidden.
- All external outbound links MUST carry `rel="noopener noreferrer"`.
- Authentication tokens MUST be stored in `httpOnly` cookies; storing tokens
  in `localStorage` or `sessionStorage` is forbidden.
- Content Security Policy (CSP) headers MUST be configured for all production
  deployments.
- Sensitive data (PII, tokens, secrets) MUST NOT appear in browser console
  logs, URL query strings, or error reporting payloads.
- CSRF protection MUST be verified for all state-mutating API operations.

**Rationale**: The frontend is the first public attack surface. Client-side
security controls reduce the blast radius of backend vulnerabilities and
protect user data directly.

### X. Code Quality & Maintainability

Code is read far more often than it is written. Every change MUST leave the
codebase easier to understand than it found it.

**Rules**:
- Functions MUST have a single, clear responsibility; cyclomatic complexity
  > 10 triggers mandatory decomposition before the PR can merge.
- Magic numbers and strings MUST be replaced with named constants.
- Dead code MUST be removed before merge; commented-out code blocks are
  forbidden.
- Dependencies MUST be reviewed monthly; stale or unmaintained packages MUST
  be replaced or removed.
- All public component props and hook return values MUST be documented with
  JSDoc or equivalent inline documentation.

**Rationale**: Maintainability is a compounding cost factor. Code quality
debt introduced by one feature is paid by every subsequent feature that
touches the same files.

## Development Standards

### Loading States

Every asynchronous operation visible to the user MUST render an appropriate
loading indicator. Loading state implementation MUST follow these standards:

- **Skeleton screens** MUST be used for content-heavy components (lists,
  cards, feeds, tables) to reduce perceived load time and prevent CLS.
- **Spinners** are permitted only for transient operations expected to
  complete in under 2 seconds (e.g., form submission, file upload).
- Loading states MUST be explicitly tested in unit tests by asserting the
  loading indicator renders when data is in a pending state.
- A component MUST NOT render a partial data state; it renders either the
  full loading skeleton or the full populated success state.
- Loading state components MUST match the dimensions of their success-state
  counterparts to prevent layout shift.

### Coverage Enforcement & Test Matrix

CI pipelines MUST block merges when any coverage metric falls below the
thresholds defined in Principle V. Coverage reports MUST be published as CI
artifacts for every PR. The following test types MUST all be present per
shipped feature:

| Test Type          | Scope                                | Required Tooling             |
|--------------------|--------------------------------------|------------------------------|
| Unit               | Individual component / hook          | Vitest / Jest + Testing Library |
| Integration        | User journey across components       | Testing Library + MSW         |
| E2E                | Critical paths in production-like env| Playwright / Cypress          |
| Visual Regression  | Per-breakpoint screenshot diff       | Chromatic / Percy             |

All test types MUST be green before a feature branch is eligible for merge
into `main`.

### Dependency & Versioning Policy

- `package.json` MUST pin major versions; minor and patch updates MUST be
  automated via Dependabot or Renovate with auto-merge for patch updates.
- Any new runtime dependency MUST be approved in the PR description with:
  purpose, gzipped bundle size impact, and maintenance status (last commit,
  weekly downloads, license).
- Dev-only dependencies do not require bundle justification but MUST be
  documented with their purpose.
- Duplicate dependencies providing the same functionality are forbidden.

## AI Collaboration & Developer Log

All AI-assisted development sessions MUST be logged. The developer log at
`developer-log.md` (project root) is a living audit trail that ensures human
oversight and accountability for AI-generated code and design decisions.

### developer-log.md Structure

Each entry in `developer-log.md` MUST follow this format:

```markdown
## [YYYY-MM-DD] — [Feature / Task Name]

### AI Strategy
- Prompt used or task delegated to AI
- Model and tool used (e.g., Claude Sonnet 4.6 via Claude Code)
- Key decisions suggested or made by AI

### Human Audit
- What the human engineer reviewed in the AI output
- Changes made to AI output (refactors, corrections, outright rejections)
- Rationale for accepted vs. rejected suggestions

### Verification
- Tests written and run to validate AI-generated code
- Manual QA steps performed
- Accessibility and performance checks completed

### Outcome
- Final state of the feature/task after human review
- Any deferred items or follow-up decisions required
```

**Rules**:
- MUST create a log entry for every session where AI writes, modifies, or
  reviews production code or architecture decisions.
- The Human Audit and Verification sections MUST be completed by a human
  engineer; AI-generated content in these sections is a governance violation.
- AI-generated code merged without a corresponding log entry is a
  constitution violation and MUST be flagged in the next sprint retro.
- The developer log MUST be reviewed in each sprint retrospective to surface
  recurring AI error patterns and improve future prompting strategy.
- Log entries MUST be append-only; editing historical entries is forbidden.

**Rationale**: AI-assisted development accelerates delivery but introduces
risks around correctness, security, and maintainability. A mandatory human
audit trail closes the accountability gap and creates institutional memory
about where AI assistance succeeds and fails.

## Governance

This Constitution supersedes all other project practices, style guides, and
ad-hoc conventions. When a conflict arises between this document and any other
guideline, the Constitution takes precedence.

**Amendment Procedure**:
1. Propose the amendment in a dedicated PR with written rationale and a
   migration plan for any affected code or templates.
2. Obtain approval from at least two senior engineers or the project lead.
3. Increment `CONSTITUTION_VERSION` per the versioning policy below.
4. Set `LAST_AMENDED_DATE` to the PR merge date (ISO format YYYY-MM-DD).
5. Propagate changes to all dependent templates (flag in Sync Impact Report).
6. Append an entry to `developer-log.md` documenting the amendment and its
   rationale.

**Versioning Policy**:
- **MAJOR** (X.0.0) — Backward-incompatible governance change: removal or
  redefinition of a NON-NEGOTIABLE principle.
- **MINOR** (0.X.0) — New principle or section added; material expansion of
  existing guidance that changes what teams MUST do.
- **PATCH** (0.0.X) — Clarifications, typo corrections, wording refinements
  with no change to required behaviors.

**Compliance Review**:
- Every PR MUST include a "Constitution Check" confirming compliance with all
  applicable principles before review is requested.
- A quarterly audit MUST review all active features against the Constitution
  and log findings in `developer-log.md`.
- Violations identified in audit MUST be tracked as defects labeled
  `constitution-violation` and resolved before the next minor release.

**Authoritative Guidance File**: `.specify/memory/constitution.md` is the
single source of truth for project governance. `developer-log.md` at the
project root is the companion AI audit record and MUST be maintained in
parallel.

---

**Version**: 1.0.0 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
