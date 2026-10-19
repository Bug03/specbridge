# PR Review: Prevent duplicate orders and charges on checkout retries

> **Synthetic sample.** The repository, ticket, commit IDs, source paths, and findings in this report are fictional. This is not a review of a real project and contains no private PR content.

| | |
| --- | --- |
| **Repository / PR** | `HarborCart/commerce-api` · PR `#1842` |
| **Change** | Add retry handling to the checkout payment step |
| **Reviewed revisions** | Base `4f81a62` · Head `9d3b7c1` *(illustrative IDs)* |
| **Recommendation** | **Changes requested before merge** |
| **Findings** | 2 actionable items · 1 P1 · 1 P3 |

## Executive summary

> A customer can retry checkout after a network interruption. The new flow does not preserve one idempotency key across retries, so the payment provider may create a second charge even if it accepted the first request. Also, when a payment is declined, reserved inventory is returned only after the reservation expires.

**Customer impact:** customers may be charged twice; available stock may be temporarily blocked after a failed payment.

**Recommendation:** do not release this change until retries for the same checkout resolve to one order and payment. Releasing reservations sooner than the 30-minute expiry is an optional improvement if the team accepts the current TTL.

## Business Review

**Status: Not Approved** — The requirement that one checkout create at most one order and charge is unmet.

This review uses two fictional acceptance criteria from ticket `HC-184`:

| Requirement / expected behavior | Assessment | Evidence |
| --- | --- | --- |
| Retrying the same checkout after a timeout creates at most one order and one payment. | **Not met** | Each retry creates a new `orderId`; the API accepts `Idempotency-Key` but does not forward it to the payment layer. See finding **F-01**. |
| A reservation after payment failure is released within 30 minutes. | **Met** | The reservation expires automatically within 30 minutes. Earlier release would improve availability but is not a blocking criterion in this sample. |

### Affected customer journeys

1. The customer confirms the cart and the browser submits the payment request.
2. The provider accepts the payment, but its response times out before reaching the browser.
3. The customer retries because no result was shown.
4. The backend creates a new `orderId`, so it no longer recognizes the retry as the same checkout.

In a separate path, a bank declines a payment. The customer sees a failure, but inventory may remain reserved until expiry. During that time, the stock shown to other customers can differ from the stock that is actually purchasable.

### What is working well

- Inventory is reserved before calling the provider, reducing overselling in the normal flow.
- Failed outcomes are recorded on the order instead of leaving it pending indefinitely.
- The API already accepts `Idempotency-Key`, providing an existing contract the fix can build on without adding a separate client retry mechanism.

### Out of scope / unknown

- The sample ticket does not specify a maximum pending duration or the refund behavior when capture succeeds but order persistence fails.
- Reconciliation and manual support workflows were not reviewed.
- The acceptance criteria are illustrative. A real review should link the actual Jira/OpenSpec requirement and reviewed source revision.

## Technical Review

**Status: Not Approved** — Finding F-01 remains a blocker; F-02 is a non-blocking follow-up if the team accepts the current TTL.

### F-01 · P1 · Medium likelihood

**A retry after a timeout can create a second order and charge**

- **Location:** `src/checkout/submit.ts:48-70`; `src/orders/create.ts:22-30`; `src/payments/gateway.ts:31-45` *(illustrative paths and lines)*
- **Origin:** Introduced by the sample PR. The API accepts an idempotency key, but the new flow does not pass it through order creation and payment.
- **Blocks approval:** Yes — the report has not established that retries cannot create a second charge.
- **Reproduction:** The provider accepts the first payment, but its response is lost. The client retries the same checkout. The backend creates a different `orderId` and uses that new ID as the provider key, so the provider does not deduplicate the second charge against the first.
- **Impact:** The customer can receive two orders and two charges for one purchase. Support must reconcile the transactions or issue a refund.
- **Evidence / code path:** `submitCheckout()` reads the header but calls `createOrder()` without it; `createOrder()` generates an ID on each call; `charge()` uses the order ID as the provider idempotency key.
- **Suggested fix:** Assign a stable key to one logical checkout, persist it with the result so retries replay the same order, and enforce uniqueness at the data layer. Pass that key through to the payment provider.
- **Validation to add:** Simulate a timeout after the provider accepts a request, retry with the same key sequentially and concurrently, and confirm there is only one order and charge.
- **Assumptions / downgrade factors:** This finding assumes the provider accepts the second request when it receives a new key. If another layer already enforces uniqueness by checkout session, inspect that layer before keeping the P1 severity.

### F-02 · P3 · High likelihood

**A failed payment does not immediately release the inventory reservation**

- **Location:** `src/checkout/confirm.ts:73-91`; `src/inventory/reserve.ts:14-27` *(illustrative paths and lines)*
- **Origin:** Introduced by the sample PR. The error handler updates the order status but skips the release operation.
- **Reproduction:** Only one unit of a product remains. Checkout reserves it and submits payment; the provider returns `declined`. The order becomes `failed`, but the reservation stays active for up to 30 minutes.
- **Impact:** Another customer cannot buy the item even though the prior payment failed; inventory becomes available only after the expiry job runs.
- **Blocks approval:** No — the sample criterion permits expiry within 30 minutes; this can be tracked as an availability improvement.
- **Evidence / code path:** `confirmPayment()` calls `markFailed()` and returns the error without calling `releaseReservation()`. The reservation has only an automatic expiry path.
- **Suggested fix:** Call an idempotent release operation on decline/error and make it retryable if the inventory service is temporarily unavailable. Keep expiry as a recovery fallback.
- **Validation to add:** Cover provider decline, timeout, and unknown provider errors; each path should release stock within the product's promised time.
- **Assumptions / downgrade factors:** This is non-blocking if the TTL and expiry worker meet the product contract. If the PM requires immediate release after a decline, make that a required criterion and reassess severity.

F-02 can be accepted or assigned as a follow-up without changing the Technical Review status. Once F-01 is resolved, Technical Review can be **Approved** even while F-02 remains open.

## Coverage & Limits

| Area | Status | Notes |
| --- | --- | --- |
| Checkout API and service data flow | Reviewed | Focused on idempotency propagation and order creation. |
| Payment provider integration | Partially reviewed | Provider behavior is simulated; no real provider was exercised. |
| Inventory reservation and updates | Reviewed | Reserve, failure, and expiry paths in the sample. |
| Automated checks | Not run | This is a sample report; no real repository or CI run was inspected. |
| Jira/OpenSpec | Illustrative criteria only | No real ticket or specification was accessed. |

**Review basis:** fictional PR content, two sample acceptance criteria, and illustrative code snippets in this document. In a real report, every path must point to the pinned head SHA and be rechecked before findings are published.

## Suggested triage

| Finding | Recommendation | Exit criteria |
| --- | --- | --- |
| F-01 | **Fix before merge** | Retrying the same checkout cannot create another order or charge; concurrent retries are covered. |
| F-02 | **Non-blocking follow-up** | Improve how quickly stock returns after a decline if the team wants to improve availability during the TTL window. |

---

*SpecBridge sample review · Synthetic data · Not an assessment of any real PR or project.*
