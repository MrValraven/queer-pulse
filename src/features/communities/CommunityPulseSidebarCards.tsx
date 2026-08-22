import { Link } from "react-router-dom";
import { FiBriefcase, FiMessageCircle } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes, thread as threadPath } from "../../app/routeMap";
import type { CommunityPulseResult } from "./api/useCommunityPulse";
import styles from "./CommunityDetailPage.module.css";

/**
 * The sidebar's "From this community" cards — recent discussion threads and
 * open volunteer opportunities filed to this community (`GET
 * /communities/:slug/pulse`). Split out of `CommunitySidebar` to keep that
 * component under the repo's 200-line limit.
 *
 * A quiet, secondary surface: nothing renders when there's genuinely nothing
 * to show (no empty-state clutter next to the much more prominent "Next
 * gathering" card), and a fetch failure degrades to a small inline note
 * rather than a full error panel — this mirrors how little space a sidebar
 * card has to spend on its own chrome.
 */
export function CommunityPulseSidebarCards({
  pulse,
}: {
  pulse: CommunityPulseResult;
}) {
  const { t } = useTranslation();
  const { threads, opportunities, isLoading, isError } = pulse;

  if (
    !isLoading &&
    !isError &&
    threads.length === 0 &&
    opportunities.length === 0
  ) {
    return null;
  }

  return (
    <>
      {(isLoading || isError || threads.length > 0) && (
        <div className={styles.sbC}>
          <div className={styles.sbLbl}>
            {t("communities:detail.sidebar.communityThreads")}
          </div>
          {isLoading ? (
            <>
              <SkeletonLine height={13} style={{ marginBottom: 12 }} />
              <SkeletonLine height={13} width="70%" />
            </>
          ) : isError ? (
            <p className={styles.sbEMeta}>
              {t("communities:detail.sidebar.pulseError")}
            </p>
          ) : (
            threads.map((th) => (
              <Link
                key={th.id}
                to={threadPath(th.slug || th.id)}
                className={styles.sbRelItem}
              >
                <div
                  className={styles.sbRelIc}
                  style={{
                    background: "rgba(var(--jade-rgb),.12)",
                    color: "var(--jade)",
                  }}
                >
                  <FiMessageCircle aria-hidden />
                </div>
                <div>
                  <div className={styles.sbRelName}>{th.title}</div>
                  <div className={styles.sbRelCt}>
                    {t("communities:detail.thread.replies", {
                      count: th.replyCount,
                    })}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {(isLoading || isError || opportunities.length > 0) && (
        <div className={styles.sbC}>
          <div className={styles.sbLbl}>
            {t("communities:detail.sidebar.communityOpportunities")}
          </div>
          {isLoading ? (
            <SkeletonLine height={13} width="65%" />
          ) : isError ? (
            <p className={styles.sbEMeta}>
              {t("communities:detail.sidebar.pulseError")}
            </p>
          ) : (
            opportunities.map((opp) => (
              <Link
                key={opp.slug}
                to={`${routes.volunteer}/opportunity/${opp.slug}`}
                className={styles.sbRelItem}
              >
                <div
                  className={styles.sbRelIc}
                  style={{
                    background: "rgba(var(--accent-rgb),.12)",
                    color: "var(--accent-ink)",
                  }}
                >
                  <FiBriefcase aria-hidden />
                </div>
                <div>
                  <div className={styles.sbRelName}>{opp.role}</div>
                  <div className={styles.sbRelCt}>{opp.org}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </>
  );
}
