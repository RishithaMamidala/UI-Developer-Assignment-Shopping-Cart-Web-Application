# Kibo Store - Shopping Cart Application  
## Developer Log

---

# Phase 1 – Constitution Definition

## Prompt  
`/speckit.constitution`

The project is to build a basic shopping cart web application that fetches products
from an API, displays them, and supports add-to-cart and cart management.
The project must follow strict rules for code quality and structure, including clean
architecture principles, modular and reusable components, consistent naming conventions, separation of concerns, linting and formatting standards, and performance best practices.
It must ensure correct and complete implementation of all specifications, including input validation, robust error handling, edge-case handling, accessibility compliance, and security best practices.
The project must be fully responsive across Desktop, Tablet, and Mobile. It must follow
strong UI/UX standards: mobile-first design, semantic HTML, accessibility requirements, clear visual hierarchy, spacing consistency, and clean modern layout principles.
It must include comprehensive unit testing with defined coverage expectations, edge-case testing, appropriate mocking, and reliable isolated tests. README.md must include Framework & Library Versions, Setup & Run Instructions, and Testing Instructions.
Keep track of all conversations in developer-log.md with: AI Strategy (how context was provided to AI), Human Audit (at least 3 corrections made to AI output), and Verification (how AI was used to generate tests for complex edge cases).


## Output  
**File created:** `constitution.md`

### What Was Produced
- 10 Core Engineering Principles:
  - Component Architecture  
  - Design System Conformance  
  - Responsive-First Approach  
  - Accessibility (WCAG 2.1 AA)  
  - TDD Enforcement  
  - Performance Standards  
  - State Management Discipline  
  - API & Error Handling Standards  
  - Frontend Security  
  - Code Quality & Linting  

- Development Standards:
  - Loading states
  - Coverage matrix
  - Dependency governance

- AI audit logging structure
- Amendment & compliance governance

This established non-negotiable quality gates before any feature work.

---

# Phase 2 – Initial Specification

## Prompt  
`/speckit.specify`

It is a basic cart application. The landing displays a list of products fetched from a live API. Each product shows essential details such as image, title, price, and a short description.Users can add products to their cart directly. The cart page displays all selected items along with their quantities and total price in a side bar/drawer.


## Output  
**File created:** `spec.md`

### Clarifications Resolved
## Steering Prompt
1. Sort & Filter required → **Yes**
2. Cart persistence → **Within current browser session**
3. Checkout required → **No**

### Structured User Stories
1. Browse Product Catalogue  
2. Filter & Sort Products  
3. Add to Cart  

The constitution principles were validated before accepting the spec.

---

# Phase 3 – Spec Audit & Feature Expansion

## Audit Finding
Initial specification lacked:
- Product detail view
- Multi-quantity add capability

## Steering Prompt
Added:
- Product detail view
- Add multiple quantities at once

## Output
Updated `spec.md` with:

### 4 Prioritized User Stories
1. Browse Product Catalogue  
2. Filter & Sort Products  
3. View Product Details  
4. Add to Cart with Quantity Control  

Also added:
- Functional requirements
- Success criteria
- Edge-case catalogue
- Spec quality checklist validation

---

# Phase 4 – Clarification Round

## Prompt  
`/speckit.clarify`

### Key Decisions
## Steering Prompt
1. No out-of-stock feature
2. Add category filter tabs + sort control
3. No consent banner (cart storage considered strictly necessary)
4. Max quantity = 50
5. API timeout = 10 seconds

The specification was updated accordingly.

---

# Phase 5 – Architecture Planning

## Prompt  
`/speckit.plan`

For the frontend UI/UX use react.js, tailwind and redux.Get the data from the API "https://fakestoreapi.com/products". Use Jest and React Testing Library for unit and integration testing. Use Playwright for end to end testing and deploy on vercel. responsive UI, frontend-only, no database

### Tech Stack
- React (JavaScript)
- Redux
- Tailwind CSS
- Jest + React Testing Library
- Playwright (E2E)
- Vercel deployment
- Frontend-only (no database)
- Live API: https://fakestoreapi.com/products

## Steering Prompt
AI initially structured the plan using TypeScript.  
It was corrected to use **JavaScript** as originally intended.

### Output
`plan.md` included:
- Project structure
- Data model
- Architecture layers
- Risk analysis
- Implementation notes

---

# Phase 6 – Task Breakdown

## Prompt  
`/speckit.tasks`

## Output  
**File created:** `tasks.md`

Included:
- Setup tasks
- Foundational architecture tasks
- User story implementation tasks
- Testing tasks
- Deployment tasks

Structured as an actionable engineering checklist.

---

# Phase 7 – Architectural Analysis

## Prompt  
`/speckit.analyze`

### Findings
- 3 Critical
- 2 High
- 4 Medium
- 5 Low deviations

### Critical & High Issues Identified
- Missing E2E coverage
- No visual regression coverage
- MSW not installed for API mocking
- CSP headers absent from `vercel.json`
- No retry mechanism on GET requests

All issues were resolved systematically by user clarifications.

---

# Phase 8 – Implementation (TDD Driven)

## Prompt  
`/speckit.implement`

### Execution Highlights
- Followed Test-Driven Development as defined in the constitution
- Installed missing dependencies
- Implemented features incrementally
- Built a fully working production-ready frontend application

---

# Phase 9 – Manual QA & UX Refinement

After core implementation, manual testing and UX refinement were performed.

---

## Key Bug Fixes & UX Enhancements

### 1. Removed Native Number Input Arrows
Replaced default browser number input arrows with controlled `+ / -` buttons across:
- Landing page
- Product modal
- Cart drawer

Improved UI consistency and control.

---

### 2. Unified Quantity State
Previously:
- Modal quantity and cart quantity were unsynchronized.

Fix:
- Centralized quantity management in Redux
- Ensured real-time synchronization across all components

---

### 3. Toast Notification Overlap
Issue:
- Rapid additions caused overlapping toast notifications.

Fix:
- Controlled toast concurrency
- Prevented stacking overflow

---

### 4. Add-to-Cart Visual Feedback
Improved button UX:
- Temporary green success state
- Smooth visual transition
- Eliminated flashing behavior

---

### 5. Quantity Input UX Fix
Issue:
- Users could not clear the quantity field.

Fix:
- Allowed temporary empty input state
- Applied validation on blur
- Ensured numeric enforcement without blocking input

---

## Final Status

The application is:
- Fully responsive
- Constitution-compliant
- Test-covered (unit + integration + E2E)
- Performance-optimized
- Securely deployed
- UX refined beyond initial specification