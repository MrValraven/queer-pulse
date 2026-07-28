import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { FiShield } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMPANIES,
  HOW,
  RULE_KEYS,
  VERIFY,
  type Company,
} from "./employerReviews.data";
import { EmployerReviewCard } from "./EmployerReviewCard";
import { EmployerReviewSkeleton } from "./EmployerReviewSkeleton";
import { WriteReviewModal, type SubmittedReview } from "./WriteReviewModal";
import styles from "./EmployerReviewsPage.module.css";

const INVITE = routes.requestInvite;

export function EmployerReviewsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  // Live mode has no real employer-review backend yet, so the seed stays empty
  // and the fabricated COMPANIES only populate the demo experience.
  const [companies, setCompanies] = useState<Company[]>(
    demoMode ? COMPANIES : [],
  );
  // null = closed; string = open, pre-selecting that company; '' = open, no preselect.
  const [writeFor, setWriteFor] = useState<string | null>(null);

  const addReview = ({ companyName, review }: SubmittedReview) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.name === companyName
          ? {
              ...c,
              reviews: [review, ...c.reviews],
              reviewCount: c.reviewCount + 1,
            }
          : c,
      ),
    );
  };

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>
            <span className={styles.live} />
            {t("economy:employerReviews.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="economy:employerReviews.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>
            {t("economy:employerReviews.hero.lead")}
          </p>
        </div>
      </header>

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                <Translation
                  i18nKey="economy:employerReviews.how.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.sub}>
                {t("economy:employerReviews.how.sub")}
              </div>
            </div>
          </div>
          <div className={styles.howGrid}>
            {HOW.map((howItem) => (
              <div className={styles.howItem} key={howItem.n}>
                <div className={styles.howN}>{howItem.n}</div>
                <div className={styles.howTitle}>{t(howItem.titleKey)}</div>
                <div className={styles.howDesc}>{t(howItem.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                <Translation
                  i18nKey="economy:employerReviews.recent.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.sub}>
                {t("economy:employerReviews.recent.sub")}
              </div>
            </div>
            <div className={styles.secActions}>
              <Button to={routes.jobs} variant="ghost">
                {t("economy:employerReviews.recent.browseCta")}
              </Button>
              <Button variant="ghost" onClick={() => setWriteFor("")}>
                {t("economy:employerReviews.recent.writeCta")}
              </Button>
            </div>
          </div>
          {demoMode ? (
            <div className={styles.companyGrid}>
              {loading
                ? Array.from({ length: 6 }).map((_, skeletonIndex) => (
                    <EmployerReviewSkeleton key={skeletonIndex} />
                  ))
                : companies.map((company, companyIndex) => (
                    <FadeIn
                      key={company.name}
                      delay={Math.min(companyIndex, 8) * 60}
                    >
                      <EmployerReviewCard
                        company={company}
                        onWriteReview={() => setWriteFor(company.name)}
                      />
                    </FadeIn>
                  ))}
            </div>
          ) : (
            <EmptyState
              icon={<FiShield />}
              title={t("economy:employerReviews.emptyLive.title")}
              description={t("economy:employerReviews.emptyLive.description")}
              action={{
                label: t("economy:employerReviews.recent.writeCta"),
                onClick: () => setWriteFor(""),
              }}
            />
          )}

          <div className={styles.verifyBox}>
            <div className={styles.verifyHead}>
              <span className={styles.verifyIcon} aria-hidden>
                <FiShield />
              </span>
              <h3>
                <Translation
                  i18nKey="economy:employerReviews.verify.title"
                  components={{ em: <em /> }}
                />
              </h3>
            </div>
            <div className={styles.verifyGrid}>
              {VERIFY.map((verifyItem) => (
                <div className={styles.verifyItem} key={verifyItem.labelKey}>
                  <div className={styles.verifyLabel}>
                    {t(verifyItem.labelKey)}
                  </div>
                  <div className={styles.verifyDesc}>
                    {t(verifyItem.descKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.writeBox} id="write">
            <div>
              <h2>
                <Translation
                  i18nKey="economy:employerReviews.write.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t("economy:employerReviews.write.body")}</p>
              <Button
                variant="primary"
                className={styles.writeBtn}
                onClick={() => setWriteFor("")}
              >
                {t("economy:employerReviews.recent.writeCta")}
              </Button>
              <div className={styles.writeNote}>
                {t("economy:employerReviews.write.note")}
              </div>
            </div>
            <div className={styles.writeRules}>
              <div className={styles.rulesTitle}>
                {t("economy:employerReviews.write.rulesTitle")}
              </div>
              {RULE_KEYS.map((ruleKey) => (
                <div className={styles.rule} key={ruleKey}>
                  <div className={styles.ruleDot} />
                  {t(ruleKey)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="economy:employerReviews.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:employerReviews.outro.sub")}
      >
        <Button to={INVITE} variant="primary" size="lg">
          {t("economy:employerReviews.outro.cta")}
        </Button>
      </Outro>

      {writeFor !== null && (
        <WriteReviewModal
          companies={companies}
          initialCompany={writeFor || undefined}
          onClose={() => setWriteFor(null)}
          onSubmit={addReview}
        />
      )}
    </PageShell>
  );
}
