/** Mock appeal record — the live-mode equivalent of a fetched appeal; only
 * the surrounding chrome (labels, dates formatted via `useFormat()`) is
 * translated. The reference id is an opaque code, not language content.
 *
 * Split out of AppealPanels.tsx (which now only exports components) so the
 * Date values don't trip react-refresh/only-export-components. */
export const APPEAL_REFERENCE = "QP-APP-2847";
export const SUBMITTED_DATE = new Date(2026, 5, 4);
export const EXPECTED_DATE = new Date(2026, 5, 11);
export const DECIDED_DATE = new Date(2026, 5, 9);
