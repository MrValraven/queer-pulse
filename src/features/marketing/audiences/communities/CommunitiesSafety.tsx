import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../../../app/routeMap";
import { Button } from "../../../../shared/components/ui/Button";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudiencePointGrid } from "../shared/AudiencePointGrid";
import { AudienceSection } from "../shared/AudienceSection";
import { SAFETY_POINTS } from "./communitiesLanding.data";
import styles from "./CommunitiesLanding.module.css";

/**
 * "Safe by design": the pieces that keep a community in its own people's
 * hands, then the code of conduct every community sits under. The code of
 * conduct is a public page, so a guest can follow the link too.
 */
export function CommunitiesSafety() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="safety"
      eyebrow={t("audiences:safety.eyebrow")}
      title={t("forCommunities:safety.title")}
      lede={t("forCommunities:safety.lede")}
      tone="paper"
    >
      <AudiencePointGrid points={SAFETY_POINTS} />
      <div className={styles.conduct}>
        <p className={styles.conductText}>
          {t("forCommunities:safety.conduct.body")}
        </p>
        <Button variant="ghost" to={routes.codeOfConduct}>
          {t("forCommunities:safety.conduct.cta")}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </AudienceSection>
  );
}
