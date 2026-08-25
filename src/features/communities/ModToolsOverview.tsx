import { FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModToolsInsights } from "./ModToolsInsights";
import type { ModSection } from "./modToolsNav.data";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsShell.module.css";

/**
 * The console's landing pane: the community's numbers, plus the one question a
 * moderator actually opens mod tools to answer: is anything waiting on me?
 *
 * The queues themselves live one rail item away, so this only counts them and
 * hands over. When both are empty it says so rather than showing two rows of
 * zeroes, because "nothing to do" is the answer, and a zero makes you read it
 * twice to work that out.
 */
export function ModToolsOverview({
  slug,
  requestCount,
  reportCount,
  onOpenSection,
}: {
  slug: string;
  requestCount: number;
  reportCount: number;
  /** Jumps the rail to a queue. Same handler the rail itself uses, so the
   *  URL's `?mod=` stays the single source of truth for which pane is open. */
  onOpenSection: (section: ModSection) => void;
}) {
  const { t } = useTranslation();
  const hasWork = requestCount > 0 || reportCount > 0;

  return (
    <div>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.overview.attention.label")}
      </div>
      {hasWork ? (
        <div className={styles.attention}>
          {requestCount > 0 && (
            <AttentionRow
              label={t(
                "communities:detail.modtools.overview.attention.requests",
                {
                  count: requestCount,
                },
              )}
              count={requestCount}
              onClick={() => onOpenSection("requests")}
            />
          )}
          {reportCount > 0 && (
            <AttentionRow
              label={t(
                "communities:detail.modtools.overview.attention.reports",
                {
                  count: reportCount,
                },
              )}
              count={reportCount}
              onClick={() => onOpenSection("reports")}
            />
          )}
        </div>
      ) : (
        <div className={styles.attention}>
          <EmptyState
            compact
            icon={<FiCheckCircle />}
            title={t(
              "communities:detail.modtools.overview.attention.clear.title",
            )}
            description={t(
              "communities:detail.modtools.overview.attention.clear.description",
            )}
          />
        </div>
      )}

      <ModToolsInsights slug={slug} />
    </div>
  );
}

/** One waiting queue: what it is, how many, and the way into it. */
function AttentionRow({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.attentionRow} onClick={onClick}>
      <span className={styles.attentionLabel}>{label}</span>
      <span className={styles.attentionCount}>{count}</span>
      <FiChevronRight aria-hidden />
    </button>
  );
}
