import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes, businessPath } from "../../app/routeMap";
import { useSafeSpace } from "./api/useSafeSpaces";
import { type RemovedSpace } from "./safeSpaces";
import styles from "./SafeSpaceDetailPage.module.css";

const SAFETY = routes.safety;
const VERIFIED_COUNT = 47;

function emName(name: string) {
  const words = name.split(" ");
  const last = words.pop();
  return { lead: words.join(" "), last };
}

/**
 * The delisting accountability narrative for a safe space removed for a
 * safety violation — reason, timeline, "what now". This stays on the safety
 * hub rather than merging into the directory: a removed space isn't a live
 * directory listing, so `DirectorySpacePage` has nothing to show for it.
 */
function RemovedView({ s }: { s: RemovedSpace }) {
  const { t } = useTranslation();
  const { lead, last } = emName(s.name);
  return (
    <div className={styles.page}>
      <Link to={routes.safeSpaces} className={styles.back}>
        {t("safety:spaces.detail.backLink")}
      </Link>

      <div className={styles.removedBanner}>
        <div className={styles.removedSeal}>
          <svg viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} />
            <line x1={8} y1={8} x2={16} y2={16} />
            <line x1={16} y1={8} x2={8} y2={16} />
          </svg>
        </div>
        <div className={styles.removedEyebrow}>
          {t("safety:spaces.detail.removedEyebrow", {
            type: s.typeLabel,
            hood: s.neighbourhood,
          })}
        </div>
        <h1 className={styles.removedTitle}>
          {lead && `${lead} `}
          <em>{last}.</em>
        </h1>
        <p className={styles.removedReason}>{s.reason}</p>
        <div className={styles.removedMetaRow}>
          <div className={styles.removedMeta}>
            <b>{s.removedDate}</b>
            {t("safety:spaces.detail.removedMeta.removed")}
          </div>
          <div className={styles.removedMeta}>
            <b>{s.listedSince}</b>
            {t("safety:spaces.detail.removedMeta.listedSince")}
          </div>
          <div className={styles.removedMeta}>
            <b>{s.flags}</b>
            {t("safety:spaces.detail.removedMeta.flags")}
          </div>
        </div>
      </div>

      <div className={styles.removedBody}>
        <div>
          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.whyRemovedTitle"
                components={{ em: <em /> }}
              />
            </h2>
            {s.reasonLong.map((p, i) => (
              <p className={styles.reasonP} key={i}>
                {p}
              </p>
            ))}
          </section>

          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.howHappenedTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.secSub}>
              {t("safety:spaces.detail.howHappenedSub")}
            </p>
            <div className={styles.timeline}>
              {s.timeline.map((item, i) => (
                <div className={styles.tlItem} key={i}>
                  <div className={styles.tlDot} />
                  <div className={styles.tlDate}>{item.date}</div>
                  <div className={styles.tlEvent}>{item.event}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.whatNowCard}>
            <h3>{t("safety:spaces.detail.whatNowTitle")}</h3>
            <p>{s.whatNow}</p>
          </div>

          <div className={styles.sideCard}>
            <h4>{t("safety:spaces.detail.hadExperienceTitle")}</h4>
            <div
              className={styles.addr}
              style={{
                marginBottom: 12,
                fontSize: 13.5,
                color: "var(--ink-60)",
              }}
            >
              {t("safety:spaces.detail.hadExperienceBody")}
            </div>
            <Button variant="ghost" className={styles.sideFull} to={SAFETY}>
              {t("safety:spaces.detail.fileReportCta")}
            </Button>
          </div>

          <div className={[styles.sideCard, styles.sharePlum].join(" ")}>
            <h4>{t("safety:spaces.detail.lookingForTitle")}</h4>
            <p>
              {t("safety:spaces.detail.lookingForBody", {
                count: VERIFIED_COUNT,
              })}
            </p>
            <Button
              variant="ghost-dark"
              className={styles.sideFull}
              to={routes.safeSpaces}
            >
              {t("safety:spaces.detail.seeVerifiedCta")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Branching detail page for `/local/safe-spaces/:slug` (and the legacy
 * `/safe-space/:slug` alias). A safe space is either:
 *  - REMOVED: delisted for a safety violation — keeps its accountability
 *    narrative here on the hub (`RemovedView`), since it's not a live
 *    directory listing.
 *  - verified (or any other live listing): redirects to the merged
 *    directory detail (`businessPath`), which renders the trust section
 *    inline as of Task 7 — `VerifiedView`'s old markup lives there now via
 *    the extracted `SafeSpaceTrustBanner`/`SafeSpacePromisesList`/
 *    `SafeSpaceVouchesList`/`SafeSpaceVerifiedAside` components.
 */
export function SafeSpaceDetailPage() {
  const { slug } = useParams();
  const { space, isLoading } = useSafeSpace(slug);

  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.page} aria-busy="true">
          <SkeletonLine width={120} height={14} />
          <SkeletonLine width="40%" height={30} style={{ marginTop: 16 }} />
          <SkeletonLine width="70%" height={16} style={{ marginTop: 16 }} />
          <SkeletonLine width="55%" height={16} style={{ marginTop: 10 }} />
        </div>
      </PageShell>
    );
  }

  if (!space) return <Navigate to={routes.safeSpaces} replace />;

  if (space.kind === "removed") {
    return (
      <PageShell>
        <RemovedView s={space.data} />
      </PageShell>
    );
  }

  return <Navigate to={businessPath(slug ?? "")} replace />;
}
