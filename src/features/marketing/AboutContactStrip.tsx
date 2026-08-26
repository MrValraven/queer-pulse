import { useState } from "react";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AboutLinkModal } from "./AboutLinkModal";
import s from "./AboutPage.module.css";

/**
 * The "who's behind this" closing strip. Contact stays a real link because it
 * starts a flow, while the governance button opens the same reference dialog
 * the stand section's links use, so a reader can see how the platform is run
 * without leaving the page they're being asked to trust.
 */
export function AboutContactStrip() {
  const { t } = useTranslation();
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);

  return (
    <Reveal className={s.contactStrip} delay={60}>
      <div className={s.csText}>
        <h3>
          <Translation
            i18nKey="marketing:about.contactStrip.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("marketing:about.contactStrip.body")}</p>
      </div>
      <div className={s.csActions}>
        <Button to={routes.contact}>
          {t("marketing:about.contactStrip.contactCta")}
        </Button>
        <Button variant="ghost" onClick={() => setIsGovernanceOpen(true)}>
          {t("marketing:about.contactStrip.governanceCta")}
        </Button>
      </div>
      {isGovernanceOpen && (
        <AboutLinkModal
          topic="governanceOverview"
          onClose={() => setIsGovernanceOpen(false)}
        />
      )}
    </Reveal>
  );
}
