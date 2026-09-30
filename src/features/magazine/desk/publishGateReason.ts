import type { TFunction } from "../../../shared/i18n/types";
import { CARE_GATE_OPEN_CODE } from "../api/piecePublish.api";

/**
 * PRD-467: the publish gate's labels and refusal reasons arrive from the
 * server as English sentences with no per-item code (see
 * `computePublishGate`, `articlePublishBlockers` and `deckPublishBlockers` in
 * the backend's `magazine-piece-response.ts`). The sentences are fixed, so
 * each one maps to its own catalog key here. Two of them carry editor-written
 * text after a fixed prefix (a subject's name, a sensitivity check's label);
 * that text is kept as written and only the prefix is translated.
 */
const EXACT_REASON_KEYS: Record<string, string> = {
  "Care record not started": "magazine:piece.gateReason.careNotStarted",
  "Sensitivity read not started":
    "magazine:piece.gateReason.sensitivityNotStarted",
  "Content notes written": "magazine:piece.gateReason.contentNotes",
  "The article needs a standfirst.":
    "magazine:piece.gateReason.articleStandfirst",
  "Every image needs alt text.": "magazine:piece.gateReason.articleImageAlt",
  "The deck has not been started yet.":
    "magazine:piece.gateReason.deckNotStarted",
  "The deck has no slides yet.": "magazine:piece.gateReason.deckNoSlides",
  "Every image slide needs alt text.": "magazine:piece.gateReason.deckSlideAlt",
  "The cover image needs a description.":
    "magazine:piece.gateReason.deckCoverDescription",
};

const CONSENT_PREFIX = "Consent: ";
const SENSITIVITY_CHECK_PREFIX = "Sensitivity read: ";

/**
 * The label or refusal reason in the member's language, or `null` when the
 * server sent a sentence this map does not know yet.
 */
function knownGateReason(reason: string, t: TFunction): string | null {
  const exactKey = EXACT_REASON_KEYS[reason];
  if (exactKey) return t(exactKey);
  if (reason.startsWith(CONSENT_PREFIX)) {
    return t("magazine:piece.gateReason.consent", {
      name: reason.slice(CONSENT_PREFIX.length),
    });
  }
  if (reason.startsWith(SENSITIVITY_CHECK_PREFIX)) {
    return t("magazine:piece.gateReason.sensitivityCheck", {
      check: reason.slice(SENSITIVITY_CHECK_PREFIX.length),
    });
  }
  return null;
}

/**
 * A publish-gate item's label for display. An unknown label is shown as the
 * server wrote it in English, and in any other language as the care gate's
 * generic line for its state (done, or still open), so a ticked row never
 * reads as an open one.
 */
export function publishGateLabel(
  label: string,
  isDone: boolean,
  t: TFunction,
  language: string,
): string {
  const known = knownGateReason(label, t);
  if (known !== null) return known;
  if (isEnglish(language)) return label;
  return isDone
    ? t("magazine:piece.gateReason.unknownCareItemDone")
    : t("magazine:piece.gateReason.unknownCareItem");
}

/**
 * Every refusal reason for display, one line each. Unknown sentences keep the
 * server's words in English; in any other language they collapse into one
 * generic line for the refusal's kind (care gate, or piece not ready).
 */
export function publishRefusalReasons(
  reasons: string[],
  refusalCode: string,
  t: TFunction,
  language: string,
): string[] {
  const lines: string[] = [];
  for (const reason of reasons) {
    const known = knownGateReason(reason, t);
    const line =
      known ??
      (isEnglish(language)
        ? reason
        : refusalCode === CARE_GATE_OPEN_CODE
          ? t("magazine:piece.gateReason.unknownCareItem")
          : t("magazine:piece.gateReason.unknownNotReady"));
    if (!lines.includes(line)) lines.push(line);
  }
  return lines;
}

function isEnglish(language: string): boolean {
  return language.toLowerCase().startsWith("en");
}
