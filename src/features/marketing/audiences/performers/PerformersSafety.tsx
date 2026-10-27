import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudiencePointGrid } from "../shared/AudiencePointGrid";
import { AudienceSection } from "../shared/AudienceSection";
import { SAFETY_POINTS } from "./performersLanding.data";

/**
 * "Safe by design": who can see a persona (open, network, just you), linked
 * or standalone, and co-owners who manage it with you once they accept.
 */
export function PerformersSafety() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="safety"
      eyebrow={t("audiences:safety.eyebrow")}
      title={t("forPerformers:safety.title")}
      lede={t("forPerformers:safety.lede")}
      tone="wash"
    >
      <AudiencePointGrid points={SAFETY_POINTS} />
    </AudienceSection>
  );
}
