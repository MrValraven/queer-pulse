import type { TFunction } from "../../shared/i18n/types";

/**
 * Draft-copy for the reason-first "Say hello" modal (see `ProfileHelloModal.tsx`).
 *
 * The original design mockup hangs bespoke copy off four fixed reasons. This
 * platform's reasons come from each member's own `openTo` entries instead: a
 * shared preset label (translated) or their own free-authored words, with no
 * fixed vocabulary to write four bespoke openers against. `draftForReason`
 * produces one generic template parameterized by the reason's own text
 * rather than reproducing the design's per-reason polish 1:1 — a deliberate
 * simplification, worth knowing about if member-authored `openTo` phrasing
 * ever grows a stable taxonomy to hang richer copy off later.
 *
 * The template itself lives in the `members` i18n catalog
 * (`profile.hello.draftTemplate`, EN + PT) rather than as a hardcoded
 * literal here, matching the identical `state.to.text` pre-fill pattern in
 * `src/features/myevents/MoreMenu.tsx` (`myevents:moreMenu.inviteMessageText`).
 * `t` is threaded in as a parameter since this is a plain data-file function
 * without hook access — call sites already hold `t` from `useTranslation()`.
 */
export function draftForReason(
  reason: string,
  memberFirstName: string,
  t: TFunction,
): string {
  return t("members:profile.hello.draftTemplate", {
    first: memberFirstName,
    reason,
  });
}
