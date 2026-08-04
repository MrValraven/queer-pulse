import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Avatar, ImageSlot, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { DEMO_ISSUE_COVER, ISSUE_COVER_IMG } from "./issue.data";
import styles from "./IssuePage.module.css";

export interface IssueCoverProps {
  /** Live-sourced from GET /magazine/issues/:number (or the demo mock, passed
   *  in by `IssuePage`). There are intentionally NO default values: a missing
   *  or failed live fetch must render a skeleton/empty state, never fabricated
   *  cover copy. */
  number?: string;
  title?: ReactNode;
  dek?: ReactNode;
  publishedLabel?: string;
  /** Demo mode alone renders the fabricated season line, stat counts and the
   *  editor's letter — none of which has a backend analogue. */
  demoMode: boolean;
  /** Live fetch still in flight — show placeholders instead of empty copy. */
  loading?: boolean;
}

export function IssueCover({
  number,
  title,
  dek,
  publishedLabel,
  demoMode,
  loading = false,
}: IssueCoverProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.cover}>
        <div className={styles.coverInner}>
          <Link to={routes.magazine} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("magazine:issue.backToAllIssues")}
          </Link>
          <div className={styles.spread}>
            <div>
              <div className={styles.metaRow}>
                <span className={styles.num}>
                  <Translation
                    i18nKey="magazine:issue.badge"
                    values={{ number: number ?? "" }}
                    components={{ em: <em /> }}
                  />
                </span>
                {/* Content: this issue's own season line — demo-only, no
                    backend analogue. */}
                {demoMode && (
                  <span className={styles.numL}>{DEMO_ISSUE_COVER.season}</span>
                )}
                <span className={styles.pill}>
                  {t("magazine:issue.currentPill")}
                </span>
              </div>
              <h1 className={styles.h1}>
                {loading ? <SkeletonLine width="70%" height={48} /> : title}
              </h1>
              <p className={styles.dek}>
                {loading ? (
                  <>
                    <SkeletonLine
                      width="95%"
                      height={18}
                      style={{ marginBottom: 8 }}
                    />
                    <SkeletonLine width="80%" height={18} />
                  </>
                ) : (
                  dek
                )}
              </p>
              <div className={styles.stats}>
                {/* Feature/page/contributor counts have no backend analogue —
                    demo mode only. */}
                {demoMode && (
                  <>
                    <span>
                      <b>
                        {t("magazine:issue.stats.featuresCount", {
                          count: DEMO_ISSUE_COVER.featureCount,
                        })}
                      </b>
                    </span>
                    <span>
                      <b>
                        {t("magazine:issue.stats.pagesCount", {
                          count: DEMO_ISSUE_COVER.pageCount,
                        })}
                      </b>
                    </span>
                    <span>
                      <b>
                        {t("magazine:issue.stats.contributorsCount", {
                          count: DEMO_ISSUE_COVER.contributorCount,
                        })}
                      </b>
                    </span>
                  </>
                )}
                {publishedLabel && (
                  <span>
                    {t("magazine:issue.stats.publishedPrefix")}{" "}
                    <b>{publishedLabel}</b>
                  </span>
                )}
              </div>
            </div>
            <ImageSlot
              tint="coral"
              radius={18}
              src={ISSUE_COVER_IMG}
              alt={t("magazine:issue.coverAlt", { number: number ?? "" })}
              placeholder={t("magazine:issue.coverAlt", { number: number ?? "" })}
              style={{ aspectRatio: "3/4", height: "auto" }}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* The editor's letter is an authored essay with no backend analogue —
          demo mode only, never fabricated into a live issue. */}
      {demoMode && (
        <section className={styles.letter}>
          <div className={styles.letterInner}>
            <div className={styles.letterEyebrow}>
              {t("magazine:issue.letterEyebrow")}
            </div>
            <h2>
              The body is <em>a political object.</em> So is the appointment.
            </h2>
            <p>
              We started reporting this issue because half of the people in our
              community say they're putting off a doctor's visit. Not because
              they don't have insurance. Because they're tired of explaining
              themselves at a desk.
            </p>
            <p>
              Twelve writers, three months, fourteen interviews, two clinics
              visited at 2am. The result is an issue we could only have made
              together — Sara Pinheiro's cover piece on the trans health
              protocol, an interview with the woman who fixed an entire clinic
              by being <em>kind on purpose</em>.
            </p>
            <p>Read it in any order. Lend it to your GP.</p>
            <div className={styles.sign}>
              <Avatar initials="MR" tint="coral" size={42} />
              <div>
                <div className={styles.signName}>Marta Reis</div>
                <div className={styles.signRole}>
                  Editor in chief · QueerPulse Magazine
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
