import { OPEN_TO_PRESETS, type OpenToId } from "../members/openTo.data";

/** i18n Pattern A — chrome options for the "what's this about?" picker.
 *  `id` is the stable value the field stores; `labelKey` resolves via `t()`. */
export const REASONS: { id: string; labelKey: string }[] = [
  { id: "collaborate", labelKey: "connect:form.reasonCollaborate" },
  { id: "advice", labelKey: "connect:form.reasonAdvice" },
  { id: "sawPost", labelKey: "connect:form.reasonSawPost" },
  { id: "shouldMeet", labelKey: "connect:form.reasonShouldMeet" },
  { id: "somethingElse", labelKey: "connect:form.reasonSomethingElse" },
];

const OPEN_TO_LABEL_KEY = new Map<OpenToId, string>(
  OPEN_TO_PRESETS.map((preset) => [preset.id, preset.labelKey]),
);
const REASON_LABEL_KEY = new Map(
  REASONS.map((reason) => [reason.id, reason.labelKey]),
);

/**
 * Decode a stored connect `reason` to display text. Values are one of:
 *  - `open:<id>`      → an "open to" preset (translated)
 *  - `custom:<label>` → the member's own words (verbatim, untranslated)
 *  - a bare REASONS id → a generic reason (translated)
 * Returns null for an empty or unrecognised value so callers skip rendering —
 * mirrors `reasonValue()` in openTo.data.ts, which produces these strings.
 */
export function reasonLabel(
  reason: string | undefined,
  t: (key: string) => string,
): string | null {
  if (!reason) return null;
  if (reason.startsWith("custom:")) {
    return reason.slice("custom:".length) || null;
  }
  if (reason.startsWith("open:")) {
    const key = OPEN_TO_LABEL_KEY.get(reason.slice("open:".length) as OpenToId);
    return key ? t(key) : null;
  }
  const key = REASON_LABEL_KEY.get(reason);
  return key ? t(key) : null;
}

/** How long the success panel lingers before closing itself. */
export const AUTO_CLOSE_SECONDS = 6;
