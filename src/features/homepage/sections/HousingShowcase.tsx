import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { HousingExplainerCta } from "./HousingExplainerCta";
import { HousingListingStage } from "./HousingListingStage";
import styles from "./HousingShowcase.module.css";

export function HousingShowcase() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();

  return (
    <section className={styles.housing} id="housing">
      <div className="wrap">
        <div className={styles.twoCol}>
          <div>
            <Reveal as="p" className={styles.secEye}>
              {t("homepage:housing.eyebrow")}
            </Reveal>
            <Reveal as="h2" className={styles.secH} delay={40}>
              <Translation
                i18nKey="homepage:housing.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.secBody} delay={80}>
              {t("homepage:housing.subtitle")}
            </Reveal>
            {/* Signed out this is one button that opens the explainer: the
                flatmate board is gated too, so offering it as a second link
                only bounced the visitor to sign-in a second way. */}
            <Reveal className={styles.ctaRow} delay={120}>
              <HousingExplainerCta />
              {loggedIn && (
                <Link to={routes.flatmates} className={styles.ctaAlt}>
                  {t("homepage:housing.secondaryCta")}{" "}
                  <FiArrowRight aria-hidden />
                </Link>
              )}
            </Reveal>
            <Reveal as="p" className={styles.ctaNote} delay={160}>
              {t("homepage:housing.ctaNote")}
            </Reveal>
          </div>

          {/* Illustrative showcase content (fabricated names/listings) —
              shown in both modes to demonstrate the feature; product call,
              not backed by real listing data. */}
          <Reveal delay={100}>
            <HousingListingStage />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
