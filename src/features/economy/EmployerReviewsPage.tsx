import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMPANIES, HOW, type Company } from "./employerReviews.data";
import { EmployerReviewCard } from "./EmployerReviewCard";
import { EmployerReviewSkeleton } from "./EmployerReviewSkeleton";
import { EmployerGrid } from "./EmployerGrid";
import {
  EmployerVerifyBox,
  EmployerWriteBox,
} from "./EmployerReviewsSections";
import { WriteReviewModal, type SubmittedReview } from "./WriteReviewModal";
import { LiveWriteReviewModal } from "./LiveWriteReviewModal";
import { useCompanies } from "./api/useCompanies";
import styles from "./EmployerReviewsPage.module.css";

const INVITE = routes.requestInvite;

export function EmployerReviewsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  // Demo renders the fabricated COMPANIES through EmployerReviewCard; live pulls
  // real employers from GET /companies and links each through to its CompanyPage
  // (where the full profile + reviews — and its own review flow — live).
  const [companies, setCompanies] = useState<Company[]>(
    demoMode ? COMPANIES : [],
  );
  const liveEmployers = useCompanies();
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
                {t("economy:employerReviews.recent.browseCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
              <Button variant="ghost" onClick={() => setWriteFor("")}>
                {t("economy:employerReviews.recent.writeCta")}{" "}
                <FiArrowRight aria-hidden />
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
          ) : liveEmployers.items.length === 0 ? (
            <EmptyState
              icon={<FiShield />}
              title={t("economy:employerReviews.emptyLive.title")}
              description={t("economy:employerReviews.emptyLive.description")}
              action={{
                label: (
                  <>
                    {t("economy:employerReviews.recent.writeCta")}{" "}
                    <FiArrowRight aria-hidden />
                  </>
                ),
                onClick: () => setWriteFor(""),
              }}
            />
          ) : (
            <EmployerGrid
              employers={liveEmployers.items}
              hasNextPage={liveEmployers.hasNextPage}
              fetchNextPage={liveEmployers.fetchNextPage}
              isFetchingNextPage={liveEmployers.isFetchingNextPage}
            />
          )}

          <EmployerVerifyBox />

          <EmployerWriteBox onWrite={() => setWriteFor("")} />
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

      {writeFor !== null &&
        (demoMode ? (
          <WriteReviewModal
            companies={companies}
            initialCompany={writeFor || undefined}
            onClose={() => setWriteFor(null)}
            onSubmit={addReview}
          />
        ) : (
          <LiveWriteReviewModal
            companies={liveEmployers.items}
            initialSlug={writeFor || undefined}
            onClose={() => setWriteFor(null)}
          />
        ))}
    </PageShell>
  );
}
