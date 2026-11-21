import { useLayoutEffect } from "react";
import {
  RULE_PRESET_KEYS,
  slugify,
  type CommunityDraft,
} from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";

/**
 * Fills what the quick flow's last step needs while that step is open: the
 * handle from the name when the handle is blank, and the preset shared values
 * when the draft holds none (a desktop draft that cleared every value). It
 * runs again whenever either gap reappears, so a newer draft loaded onto this
 * step is filled too. Typing never blanks the handle (`slugify` returns a
 * fallback) and this step has no control that removes values, so a refill only
 * follows a load. Both go through `form.prefill`, which counts as no edit and
 * saves nothing. A layout effect, so the first paint already holds the values
 * and shows no missing chips for them.
 */
export function useQuickOpenPrefill(form: CommunityForm): void {
  const { draft, prefill } = form;
  const shouldFillHandle = !draft.handle.trim() && draft.name.trim().length > 0;
  const shouldFillRules = draft.rules.length === 0;
  useLayoutEffect(() => {
    if (!shouldFillHandle && !shouldFillRules) return;
    const patch: Partial<CommunityDraft> = {};
    if (shouldFillHandle) patch.handle = slugify(draft.name);
    if (shouldFillRules) patch.rules = [...RULE_PRESET_KEYS];
    prefill(patch);
  }, [shouldFillHandle, shouldFillRules, draft.name, prefill]);
}
