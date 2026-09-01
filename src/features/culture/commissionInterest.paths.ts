import { routes } from "../../app/routeMap";

/**
 * The one Culture surface that is live: registering interest in the commission
 * board (`CommissionInterestPage`, `POST /commissions/interest`).
 *
 * It sits in its own module, like `economy/barterProposals.paths.ts`, so that
 * `CultureComingSoon` and `authGate` can deep-link to it without importing
 * `culture.data.tsx` and dragging the demo fixtures into a live chunk.
 *
 * MIRRORED BY HAND in two places, both of which must be changed together:
 *   - `GATED_PATTERNS` in `src/app/authGate.ts` (this page needs a session),
 *   - `GATED_PATTERNS` in `scripts/publicPaths.mjs`, authGate's build-script
 *     mirror.
 * Both list it as a string literal because the mirror test parses those two
 * lists as text and only understands quoted literals and `routes.*`.
 */
export const COMMISSION_INTEREST_PATH = `${routes.culture}/commission-interest`;
