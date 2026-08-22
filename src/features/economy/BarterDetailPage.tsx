import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiRepeat } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Avatar, EmptyState, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  CATS,
  BADGE_KEY,
  getMemberInfo,
  postedDaysText,
  type Mode,
} from "./barter.data";
import { useBarterListing } from "./api/useBarter";
import { BarterProposeCard } from "./BarterProposeCard";
import { BarterDetailSkeleton } from "./BarterDetailSkeleton";
import styles from "./BarterDetailPage.module.css";

const STEPS: { id: string; titleKey: string; textKey: string }[] = [
  {
    id: "propose",
    titleKey: "economy:barterDetail.steps.propose.title",
    textKey: "economy:barterDetail.steps.propose.text",
  },
  {
    id: "agree",
    titleKey: "economy:barterDetail.steps.agree.title",
    textKey: "economy:barterDetail.steps.agree.text",
  },
  {
    id: "exchange",
    titleKey: "economy:barterDetail.steps.exchange.title",
    textKey: "economy:barterDetail.steps.exchange.text",
  },
  {
    id: "vouch",
    titleKey: "economy:barterDetail.steps.vouch.title",
    textKey: "economy:barterDetail.steps.vouch.text",
  },
];

const SUBLINE_KEY: Record<Mode, string> = {
  offering: "economy:barterDetail.sub.offering",
  seeking: "economy:barterDetail.sub.seeking",
  both: "economy:barterDetail.sub.both",
};

/** The page frame every state shares: the shell, the page column, and the back
 *  link to the board. */
function BarterDetailFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.barter} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("economy:barterDetail.back")}
        </Link>
        {children}
      </div>
    </PageShell>
  );
}

export function BarterDetailPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { id } = useParams();
  const listingQuery = useBarterListing(id);
  const simulatedLoading = useSimulatedLoad();

  const b = listingQuery.data ?? null;
  const loading = demoMode ? simulatedLoading : listingQuery.isLoading;

  if (loading || (!b && !listingQuery.isFetched)) {
    return (
      <BarterDetailFrame>
        <BarterDetailSkeleton />
      </BarterDetailFrame>
    );
  }

  // A live listing that is gone — withdrawn, or its poster and the reader have
  // blocked each other — answers 404, which lands here as no data. Say so
  // plainly instead of bouncing the reader back to the board unexplained.
  if (!b) {
    if (demoMode) return <Navigate to={routes.barter} replace />;
    return (
      <BarterDetailFrame>
        <EmptyState
          icon={<FiRepeat />}
          title={t("economy:barterDetail.goneLive.title")}
          description={t("economy:barterDetail.goneLive.description")}
          action={{
            label: t("economy:barterDetail.emptyLive.cta"),
            to: routes.barter,
          }}
        />
      </BarterDetailFrame>
    );
  }

  const info = getMemberInfo(b);
  const firstName = info.name.split(" ")[0] ?? info.name;
  const headline = b.mode === "seeking" ? b.want : b.offer;
  const catLabelKey = CATS.find((c) => c.value === b.category)?.labelKey;
  const catLabel = catLabelKey
    ? t(catLabelKey)
    : t("economy:barter.cat.fallback");
  const posted = postedDaysText(b.days, t);

  return (
    <BarterDetailFrame>
      <FadeIn>
        <header className={styles.head}>
          <div className={styles.eyebrow}>
            <span className={styles.kind}>{t(BADGE_KEY[b.mode])}</span>
            <span className={styles.sep}>·</span>
            <span>{catLabel}</span>
            <span className={styles.sep}>·</span>
            <span>{posted}</span>
          </div>
          <h1 className={styles.h1}>{headline}</h1>
          <p className={styles.sub}>{t(SUBLINE_KEY[b.mode])}</p>
        </header>

        <div className={styles.provider}>
          <Avatar
            initials={info.initials}
            tint={info.tint}
            size={56}
            src={b.avatarUrl ?? undefined}
          />
          <div>
            <div className={styles.provName}>{info.name}</div>
            {/* Rendered only when the poster shares their neighbourhood (the
                server gates it on their own `hoodVisible`). When they don't,
                the line goes entirely rather than falling back to a location
                nobody stated. */}
            {info.hood && (
              <div className={styles.provRole}>
                {t("economy:barterDetail.locationWithHood", {
                  hood: info.hood,
                })}
              </div>
            )}
          </div>
          <div className={styles.provAction}>
            <span className={styles.now}>
              {t("economy:barterDetail.repliesFast")}
            </span>
            <Link to={routes.messages} className={styles.provLink}>
              {t("economy:barterDetail.messageCta", { firstName })}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            {b.offer && (
              <section className={styles.sec}>
                <h2 className={styles.secTitle}>
                  <Translation
                    i18nKey="economy:barterDetail.section.offering"
                    components={{ em: <em /> }}
                  />
                </h2>
                <div className={`${styles.block} ${styles.offer}`}>
                  <div className={styles.blockLabel}>
                    {t("economy:barter.card.offeringLabel")}
                  </div>
                  <div className={styles.blockSkill}>{b.offer}</div>
                  <p className={styles.blockText}>{b.offerDetail}</p>
                </div>
              </section>
            )}

            {b.want && (
              <section className={styles.sec}>
                <h2 className={styles.secTitle}>
                  <Translation
                    i18nKey="economy:barterDetail.section.lookingFor"
                    components={{ em: <em /> }}
                  />
                </h2>
                <div className={`${styles.block} ${styles.want}`}>
                  <div className={styles.blockLabel}>
                    {t("economy:barter.card.wantLabel")}
                  </div>
                  <div className={styles.blockSkill}>{b.want}</div>
                  <p className={styles.blockText}>{b.wantDetail}</p>
                </div>
              </section>
            )}

            <section className={styles.sec}>
              <h2 className={styles.secTitle}>
                <Translation
                  i18nKey="economy:barterDetail.section.howItWorks"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.steps}>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={styles.stepCard}>
                    <div className={styles.stepN}>
                      0<em>{i + 1}</em>
                    </div>
                    <h4>{t(s.titleKey)}</h4>
                    <p>{t(s.textKey)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.side}>
            <BarterProposeCard
              listingId={b.id}
              name={info.name}
              firstName={firstName}
              isOwner={Boolean(b.isOwner)}
              hasProposed={Boolean(b.hasProposed)}
            />

            <div className={styles.sideCard}>
              <h4>{t("economy:barterDetail.sidebar.quickFacts")}</h4>
              <div className={styles.infoRow}>
                <span>{t("economy:barterDetail.sidebar.type")}</span>
                <b>{t(BADGE_KEY[b.mode])}</b>
              </div>
              <div className={styles.infoRow}>
                <span>{t("economy:barterDetail.sidebar.category")}</span>
                <b>{catLabel}</b>
              </div>
              <div className={styles.infoRow}>
                <span>{t("economy:barterDetail.sidebar.posted")}</span>
                <b>{posted}</b>
              </div>
              {info.hood && (
                <div className={styles.infoRow}>
                  <span>{t("economy:barterDetail.sidebar.area")}</span>
                  <b>{info.hood}</b>
                </div>
              )}
            </div>

            <div className={styles.sideCard}>
              <h4>{t("economy:barterDetail.sidebar.tagged")}</h4>
              <div className={styles.tagsRow}>
                {b.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </FadeIn>
    </BarterDetailFrame>
  );
}
