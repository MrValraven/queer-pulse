import { apiPost } from "./client";

/**
 * The generic intake-form kinds accepted by `POST /intakes/:kind`. Kept in sync
 * with the backend allowlist (`src/intakes/intake-kinds.ts`). Each maps to one
 * modal:
 *  - `grant` · `suggest_edit` · `sober_host` · `panel_signup` — public
 *    resources forms (a logged-out visitor may submit). `suggest_edit` now
 *    backs the shared `SuggestEditModal`/`SuggestEditTrigger` across the
 *    Glossary, Legal, Trans Healthcare, Harm Reduction, Mental Health and
 *    Library pages — the payload's `context` field tells staff which
 *    surface a suggestion came from.
 *  - `incubator_cohort` · `incubator_mentor` · `incubator_session` — member-only
 *    forms behind the gated `/economy` surface.
 *  - `governance_concern` — the public "Submit a concern" form, triaged on
 *    `/admin/concerns`.
 *  - `culture_suggest_pick` · `culture_post_project` · `culture_submit_work` ·
 *    `culture_submit_playlist` — Culture's four member-submission modals
 *    (`features/culture/CultureFormModals.tsx`). Public like the resources
 *    forms above (the Culture page itself is browsable logged-out).
 */
export type IntakeKind =
  | "grant"
  | "suggest_edit"
  | "sober_host"
  | "panel_signup"
  | "incubator_cohort"
  | "incubator_mentor"
  | "incubator_session"
  | "governance_concern"
  | "culture_suggest_pick"
  | "culture_post_project"
  | "culture_submit_work"
  | "culture_submit_playlist";

/** Acknowledgement returned by the submit — the new row's id and triage state. */
export interface IntakeAck {
  id: string;
  status: "new" | "reviewed";
}

/**
 * Submit an intake form. `payload` is the form's fields verbatim — the backend
 * stores it as a bounded jsonb document and never validates its inner shape, so
 * keep it flat and human-readable (it's what a staff member reads during
 * triage). Live-only: callers guard on `demoMode` and keep their mock flow.
 */
export function submitIntake(
  kind: IntakeKind,
  payload: Record<string, unknown>,
): Promise<IntakeAck> {
  return apiPost<IntakeAck>(`/intakes/${kind}`, { payload });
}
