# AI Workflow Journal — Kibo Shopping Cart App

Documenting significant AI interactions during the development of `001-shopping-cart-app`:
how I constructed prompts, how I evaluated AI responses, and how I overrode and corrected AI output where needed.

---

## Interaction Log and Audit

Specific instances where I caught and corrected meaningful AI output issues:

---

### Spec Review 1 — Multi-Quantity Add Scoped to Product Detail Modal Only

**Context:** Before the multi-quantity add feature was implemented, the AI-generated plan described adding a `QuantitySelector` and wiring the quantity value into the `addToCart` dispatch. The plan only mentioned `ProductDetailModal` as the target component.

**What the plan got wrong:** The spec required both `ProductDetailModal` and `ProductCard` to support selecting a quantity before adding. The plan did not include `ProductCard` in the scope.

**How I corrected it:** I flagged the omission before any implementation file was opened and revised the plan to include both components. Both were built with quantity support from the start — no rollback or after-the-fact patching was needed.

---

### Spec Review 2 — Plan Proposed localStorage for Cart Persistence

**Context:** Before implementation of cart persistence began, The plan outlined using `redux-persist` with the default storage engine to keep the cart across sessions.

**What the plan got wrong:** The plan proposed `localStorage`, which would have persisted the cart across browser sessions indefinitely. But we needed cart state should survive a page refresh within the same tab but clear when the browser is closed or a new session starts.

**How I corrected it:** I caught the wrong storage adapter at the plan stage. I corrected the plan to import `sessionStorage`, and the implementation followed correctly from that point.

---

### Spec Review 3 — Plan Proposed Zod for API Response Validation

**Context:** During planning for API validation, the AI proposed using Zod to define a product schema and validate each API response item, rejecting ones that failed the schema.

**What the plan got wrong:** The plan proposed installing Zod and defining a `productSchema.js` file but the validation was required to be a plain JS filter dropping items where required fields had wrong types, price was zero or negative, or image was empty.

**How I corrected it:** I rejected the Zod approach before any package was installed. I redirected the plan to a plain JS `parseProducts()` filter inside `transformResponse`, dropping items where required fields had wrong types, price was zero or negative, or image was empty. No Zod code was ever written.

---

### Spec Review 4 — Search Dropped from Filter/Sort Feature

**Context:** The plan for the product browsing feature included category filter tabs, a sort control, and a text search input. All three were scoped together as a single filtering feature.

**What the plan got wrong:** `fakestoreapi.com` provides no search endpoint and the project has no backend. A text search would have had to run client-side against the already-loaded product list, which conflicts with the project constraint of no text search.

**How I corrected it:** I prompted to remove search from the plan before any component work began. The category filter tabs and sort control were implemented as planned.

---

### Spec Review 5 — Out-of-Stock Feature Dropped, API Provides No Stock Count

**Context:** An out-of-stock feature was considered and added, disabling "Add to Cart" and showing an unavailable state when a product had no remaining stock.

**What the plan got wrong:** The `fakestoreapi.com` products endpoint returns no stock count or availability field. There is no data to derive an out of stock state from, making the feature unimplementable without introducing fabricated or hardcoded values.

**How I corrected it:** I steered it to drop the feature entirely during the spec stage. This avoided a speculative implementation built on data that does not exist.

---

### Audit 1 — Add to Cart Button Remained Clickable at MAX_QUANTITY

**What happened:** After adding 50 units of a product (the `MAX_QUANTITY` limit), the "Add to Cart" button remained fully interactive. Clicking it dispatched an action, but the reducer silently discarded it. The user could click indefinitely with no feedback.

**How I prompted the AI:** I asked the AI to enforce the `MAX_QUANTITY` limit of 50 per product and prevent the cart from exceeding it and and display a "Max reached" label and disbale button.

---

### Audit 2 — SVG Gradient ID Collision (StarRating)

**What happened:** The AI's `StarRating` component defined `<linearGradient id="star-gradient">` inside each component's SVG. When the product grid rendered 20 cards simultaneously, all 20 `<linearGradient>` elements shared the same `id`. Browsers apply the last definition encountered, so every star on the page showed the same fill percentage — the rating of whichever card appeared last in the DOM.

**How I evaluated the response:** I reviewed the generated SVG and noticed the gradient was defined as `<linearGradient id="star-gradient">` — a fixed, hardcoded `id`. I recognised that SVG `id` attributes are document-scoped, not component-scoped. When the product grid rendered 20 cards, all 20 gradient elements would share the same `id` and browsers would apply only the last definition, making every star on the page show the same fill.

**How I prompted the AI:** I asked the AI to implement a fractional star rating component using an SVG gradient for partial fill with differnt id for each.

**How It corrected it:** It changed the gradient `id` to `star-gradient-${productId}` to make each instance independent. It then added a regression test that renders two `StarRating` components with different values and asserts both display the correct fill widths.

---

### Audit 3 — Clamping Instead of Reverting on Invalid Quantity Input

**What happened:** During code review of the AI's quantity validation output, the implementation used a clamping strategy: a typed value of `0` or anything above `50` was clamped to `1`. The issue was caught before testing by reading the code — `Math.max(1, Math.min(MAX_QUANTITY, parsed))` was visible in the `onBlur` handler.

**How I evaluated the response:** I read the generated `onBlur` handler before running any tests and found `Math.max(1, Math.min(MAX_QUANTITY, parsed))`. This clamping approach silently mutates the cart: if a user holds 3 units and accidentally types `0`, the handler dispatches `updateQuantity(1)` and removes 2 items with no warning.

**How I prompted the AI:** I asked the AI to handle invalid quantity input in `QuantitySelector` — values below 1 or above `MAX_QUANTITY` — and restore a valid state when the field loses focus.

**How It corrected it:** It removed the `Math.max/min` clamp and rewrote the `onBlur` handler to treat out-of-range input as a no-op, the local display state resets to the current `cartQuantity` from Redux and no dispatch is fired. 

---

### Audit 4 — Redux Quantity Not Synced Between ProductCard and ProductDetailModal

**What happened:** During manual testing, a product was added to the cart from the `ProductCard` (quantity 3). Opening the `ProductDetailModal` for the same product showed a quantity of 1. Changing the quantity in the modal and closing it also had no effect on what the card displayed.

**How I evaluated the response:** I tested manually by adding 3 units from `ProductCard`, then opening `ProductDetailModal` for the same product. The modal showed a quantity of 1. I traced the issue through the code: `ProductCard` was reading from `cartSlice`, while `ProductDetailModal` was reading from a separate UI quantity field the AI had silently added to `productsSlice`. They were writing to different Redux keys and never reflecting each other's state.

**How I prompted the AI:** I asked the AI to connect quantity state to both `ProductCard` and `ProductDetailModal` so changes in either component reflected in the cart.

**How It corrected it:** It removed the separate quantity field from `productsSlice`. It unified both components to read from `cartSelectors.selectItemQuantity(id)` and write via `dispatch(updateQuantity(...))` in `cartSlice`.

---

### Audit 5 — AI Proposed a Raw Fetch Interceptor Instead of RTK Query Retry

**What happened:** When asked to add retry logic to the product fetch, the AI responded with a custom `fetchFn` passed to `fetchBaseQuery`. The code was syntactically valid and would have retried, but it bypassed RTK Query's cache, timeout enforcement, and request lifecycle entirely.

**How I evaluated the response:** I recognised this bypassed RTK Query's cache, the 10 s timeout, and the request lifecycle. Errors thrown inside a custom `fetchFn` don't surface through RTK Query's error state correctly, and the retry count was invisible to the rest of the codebase.

**How I prompted the AI:** I re-prompted the AI with an explicit constraint: stay within RTK Query's own tooling, no custom `fetchFn`

**How It corrected it:** It replaced the output with `retry(fetchBaseQuery(...))` from `@reduxjs/toolkit/query`, wrapping the existing base query, with max retries capped at 3 in the config.

---

## Verification

**Using AI to generate tests for complex edge cases:**


**Edge case: SVG gradient stop offsets for fractional star fills (3.7, 4.2)**

The AI's initial `StarRating` test suite omitted fill percentage tests entirely. When explicitly asked to add them, the AI generated boundary tests — a rating of `0` producing all `0.0%` offsets and a rating of `5` producing all `100.0%` offsets — but did not include any mid-value fractional cases. A second explicit prompt was needed to add tests for values like `3.7` and `4.2`, where the expected per-star gradient stops are non-trivial to reason about (e.g. for 3.7: stars 1–3 at `100.0%`, star 4 at `70.0%`, star 5 at `0.0%`).

Once directed to the mid-value cases, the AI produced correct assertions using a helper that reads the `offset` attribute of each `linearGradient` stop in the rendered SVG. Both the 3.7 and 4.2 tests were adopted without changes. The pattern required two rounds of prompting: one to add fill tests at all, and a second to cover fractional values between the boundaries.

---

**Edge case: Sort stability with equal ratings in `rating_desc`**

The AI was asked directly about edge cases in the sort logic:
> "What edge cases should I test for the product sort, specifically for `rating_desc`?"

The AI identified sort stability with equal `rating.rate` values as a meaningful case, two products with identical ratings should preserve their original relative order (stable sort), not swap unpredictably between renders. It produced a correct test that constructed two products with equal ratings, ran them through the `rating_desc` comparator, and asserted that their order in the output matched their order in the input.