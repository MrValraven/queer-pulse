import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMMITMENTS,
  COMMUNITIES,
  CONTACT,
  FORUM,
  GOVERNANCE,
  ORGS,
} from "./intersectionality.data";
import styles from "./IntersectionalityPage.module.css";

export function IntersectionalityFooter() {
  const { t } = useTranslation();

  return (
    <>
      <Reveal as="section" className={styles.commitSec}>
        <div className="wrap">
          <div className={styles.commitInner}>
            <div className={styles.commitLeft}>
              <h2>
                <Translation
                  i18nKey="resources:intersectionality.commit.heading"
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t("resources:intersectionality.commit.sub")}</p>
              <div className={styles.commitBtns}>
                <Button to={GOVERNANCE} variant="ghost-dark">
                  {t("resources:intersectionality.commit.governanceCta")}{" "}
                  <FiArrowRight aria-hidden />
                </Button>
                <Button to={CONTACT} variant="ghost-dark">
                  {t("resources:intersectionality.commit.accountableCta")}{" "}
                  <FiArrowRight aria-hidden />
                </Button>
              </div>
            </div>
            <div className={styles.commitCards}>
              {COMMITMENTS.map((commitment, i) => (
                <Reveal key={commitment.titleKey} delay={i * 70}>
                  <div className={styles.commitCardD}>
                    <div className={styles.ccdTitle}>
                      {t(commitment.titleKey)}
                    </div>
                    <div className={styles.ccdText}>
                      {t(commitment.textKey)}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className={styles.sec}
        id="orgs"
        style={{ paddingBottom: 100 }}
      >
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="resources:intersectionality.orgs.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:intersectionality.orgs.intro")}</p>
          </div>
          <div className={styles.orgsGrid}>
            {ORGS.map((org, i) => (
              <Reveal key={org.name} delay={Math.min(i, 8) * 60}>
                <div className={styles.orgCard}>
                  <div className={styles.orgFocus}>{t(org.focusKey)}</div>
                  <div className={styles.orgName}>{org.name}</div>
                  <div className={styles.orgText}>{t(org.textKey)}</div>
                  <Link to={org.link.href} className={styles.orgLink}>
                    {t(org.link.labelKey)}{" "}
                    <FiArrowRight aria-hidden />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <Outro
        title={
          <Translation
            i18nKey="resources:intersectionality.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:intersectionality.outro.sub")}
      >
        <Button to={COMMUNITIES} variant="primary" size="lg">
          {t("resources:intersectionality.outro.findCta")}
        </Button>
        <Button to={FORUM} variant="ghost-dark" size="lg">
          {t("resources:intersectionality.outro.forumCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </>
  );
}
