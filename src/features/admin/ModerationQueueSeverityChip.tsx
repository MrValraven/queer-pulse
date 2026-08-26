import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModerationQueueSeverity } from "./api/moderationHealth.api";
import { severityPresentation } from "./moderationQueueHealth";
import { AdminChip } from "./ui";

/**
 * A severity as three signals at once: the word, a react-icons glyph, and the
 * chip's tone (TS-04).
 *
 * NEVER COLOUR ALONE. This is an operational reading taken under pressure, and
 * a moderator who cannot separate amber from red still has to be able to tell
 * "plan to work this" from "the platform is already failing somebody". The word
 * is the primary carrier and is always present; the glyph and the tone are
 * reinforcement on top of it.
 */
export function ModerationQueueSeverityChip({
  severity,
}: {
  severity: ModerationQueueSeverity;
}) {
  const { t } = useTranslation();
  const { tone, Glyph, labelKey } = severityPresentation(severity);
  return (
    <AdminChip tone={tone}>
      <Glyph aria-hidden />
      {t(labelKey)}
    </AdminChip>
  );
}
