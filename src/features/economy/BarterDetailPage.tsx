import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Avatar, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  BARTERS,
  CATS,
  BADGE_KEY,
  getMemberInfo,
  postedDaysText,
  type Mode,
} from "./barter.data";
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

export function BarterDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const b = BARTERS.find((x) => x.id === id);
  const loading = useSimulatedLoad();
  if (!b) return <Navigate to={routes.barter} replace />;

  const info = getMemberInfo(b);
  const firstName = info.name.split(" ")[0] ?? info.name;
  const headline = b.mode === "seeking" ? b.want : b.offer;
  const catLabelKey = CATS.find((c) => c.value === b.cat)?.labelKey;
  const catLabel = catLabelKey
    ? t(catLabelKey)
    : t("economy:barter.cat.fallback");
  const posted = postedDaysText(b.days, t);

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.barter} className={styles.back}>
          {t("economy:barterDetail.back")}
        </Link>

        {loading ? (
          <BarterDetailSkeleton />
        ) : (
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
              <Avatar initials={info.initials} tint={info.tint} size={56} />
              <div>
                <div className={styles.provName}>{info.name}</div>
                <div className={styles.provRole}>
                  {info.hood
                    ? t("economy:barterDetail.locationWithHood", {
                        hood: info.hood,
                      })
                    : t("economy:barterDetail.locationLisbon")}
                </div>
              </div>
              <div className={styles.provAction}>
                <span className={styles.now}>
                  {t("economy:barterDetail.repliesFast")}
                </span>
                <Link to={routes.messages} className={styles.provLink}>
                  {t("economy:barterDetail.messageCta", { firstName })}
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
                <BarterProposeCard name={info.name} firstName={firstName} />

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
        )}
      </div>
    </PageShell>
  );
}
