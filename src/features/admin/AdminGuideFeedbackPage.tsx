import {
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useAdminGuideFeedback } from "./api/useAdminGuideFeedback";
import type { AdminGuideRatingDTO } from "./api/adminGuideFeedback.api";
import styles from "./AdminSubmissionList.module.css";

function ratioTone(ratio: number): AdminTone {
  if (ratio < 0.5) return "danger";
  if (ratio < 0.75) return "amber";
  return "jade";
}

function GuideFeedbackRow({ row }: { row: AdminGuideRatingDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{row.contentKey}</span>
          <AdminChip tone={ratioTone(row.ratio)} dot>
            {Math.round(row.ratio * 100)}%
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminGuideFeedback.row.counts", {
            helpful: row.helpfulCount,
            notHelpful: row.notHelpfulCount,
          })}
        </div>
      </div>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={72}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Read-only admin view of guide helpful/not-helpful feedback (CNT-18): every
 * rated guide content key, worst-ratio-first, so editors see which guides
 * are failing members first. Standalone rather than folded into a
 * consolidated reporting dashboard (ADM-17 doesn't exist yet). Demo mode
 * reads the colocated fixture; live mode calls `GET
 * /admin/resources/guide-ratings`.
 */
export function AdminGuideFeedbackPage() {
  const { t } = useTranslation();
  const { rows, isLoading, isError, refetch } = useAdminGuideFeedback();

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminGuideFeedback.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminGuideFeedback.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminGuideFeedback.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminGuideFeedback.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          // A one-line error was easy to skim past next to the equally quiet
          // "no guide ratings yet" line. The panel + retry makes the two
          // states impossible to confuse (DES-22).
          <LoadErrorState
            onRetry={refetch}
            title={t("admin:adminGuideFeedback.loadError.title")}
            description={t("admin:adminGuideFeedback.loadError.body")}
          />
        ) : rows.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminGuideFeedback.empty")}
          </p>
        ) : (
          <div className={styles.rows}>
            {rows.map((row, index) => (
              <FadeIn key={row.contentKey} delay={Math.min(index, 8) * 50}>
                <GuideFeedbackRow row={row} />
              </FadeIn>
            ))}
          </div>
        )}
      </FadeIn>
    </AdminShell>
  );
}
