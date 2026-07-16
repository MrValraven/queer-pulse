import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";

/** Quick-pick pronoun sets offered in the inline editor (custom entry also allowed). */
export const PRONOUN_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "ze/zir",
] as const;

/** Visibility / connect-status options shown as a segmented control on the
 *  hero. `labelKey`/`hintKey` resolve through `t()` — this copy is platform
 *  chrome, not a fetched value, in both demo and live mode. */
export const VISIBILITY_OPTIONS: {
  value: VisibilityMode;
  labelKey: string;
  hintKey: string;
}[] = [
  {
    value: "open",
    labelKey: "members:visibility.open",
    hintKey: "members:visibility.hint.open",
  },
  {
    value: "network",
    labelKey: "members:visibility.network",
    hintKey: "members:visibility.hint.network",
  },
  {
    value: "private",
    labelKey: "members:visibility.private",
    hintKey: "members:visibility.hint.private",
  },
];
