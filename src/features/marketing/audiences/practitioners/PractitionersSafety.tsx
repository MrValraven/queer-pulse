import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceFaq } from "../shared/AudienceFaq";
import { AudiencePointGrid } from "../shared/AudiencePointGrid";
import { AudienceSection } from "../shared/AudienceSection";
import { Translation } from "../../../../shared/i18n/Translation";
import {
  PRACTITIONER_FAQ,
  PRACTITIONER_SAFETY_POINTS,
} from "./practitionersLanding.data";

/** "Safe by design": who sees the page, how it stands apart from the
 *  member's own profile, how people reach them, and what the page says about
 *  a therapist's registration number (stated by the therapist, never
 *  checked by QueerPulse). */
export function PractitionersSafety() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="safety"
      eyebrow={t("audiences:safety.eyebrow")}
      title={t("forPractitioners:safety.title")}
      lede={t("forPractitioners:safety.lede")}
      tone="wash"
    >
      <AudiencePointGrid points={PRACTITIONER_SAFETY_POINTS} />
    </AudienceSection>
  );
}

/** "Questions": three answers checked against the persona code. */
export function PractitionersFaq() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="questions"
      eyebrow={t("audiences:faq.eyebrow")}
      title={
        <Translation
          i18nKey="audiences:faq.title"
          components={{ em: <em /> }}
        />
      }
      tone="cream"
    >
      <AudienceFaq items={PRACTITIONER_FAQ} />
    </AudienceSection>
  );
}
