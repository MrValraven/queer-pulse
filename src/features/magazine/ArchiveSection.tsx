import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EmptyState,
  FadeIn,
  SegmentedControl,
  SkeletonLine,
} from "../../shared/components/ui";
import styles from "./IssuesPage.module.css";
import type { Issue, Tint } from "./issues.data";

const ISSUE = routes.issue;
/** Skeleton tiles to show while the live archive loads and no rows exist yet. */
const ARCHIVE_SKELETON_COUNT = 8;

/** Maps an issue's tint to its CSS-module class key. Stays here (not in the data
 *  file) because the keys are resolved against the local `styles` import. */
const TINT_CLASS: Record<Tint, string> = {
  a: "tintA",
  b: "tintB",
  c: "tintC",
  d: "tintD",
};

function IssueTileSkeleton() {
  return (
    <div className={styles.tile} aria-hidden>
      <SkeletonLine
        height="auto"
        style={{ aspectRatio: "3 / 4", borderRadius: 14, marginBottom: 16 }}
      />
      <SkeletonLine width="40%" height={11} style={{ marginBottom: 7 }} />
      <SkeletonLine width="70%" height={24} style={{ marginBottom: 6 }} />
      <SkeletonLine width="50%" height={13} />
    </div>
  );
}

function IssueRowSkeleton() {
  return (
    <div className={styles.listRow} aria-hidden>
      <SkeletonLine width={40} height={28} />
      <div>
        <SkeletonLine width="55%" height={22} style={{ marginBottom: 8 }} />
        <SkeletonLine width="85%" height={14} />
      </div>
      <SkeletonLine width="80%" height={14} />
    </div>
  );
}

/** Archive of past issues, switchable between a cover grid and a compact list. */
export function ArchiveSection({
  view,
  onView,
  issuesList,
  loading,
  errored,
  onRetry,
}: {
  view: "grid" | "list";
  onView: (view: "grid" | "list") => void;
  issuesList: Issue[];
  loading: boolean;
  errored: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const skeletonCount = issuesList.length || ARCHIVE_SKELETON_COUNT;
  return (
    <section className={styles.arch}>
      <div className={styles.archH}>
        <h2>
          <Translation
            i18nKey="magazine:issues.archiveHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <SegmentedControl
          value={view}
          onChange={(next) => onView(next as "grid" | "list")}
          label={t("magazine:issues.archiveHeading")}
          options={[
            { value: "grid", label: t("magazine:issues.viewCoversCta") },
            { value: "list", label: t("magazine:issues.viewListCta") },
          ]}
        />
      </div>

      {errored ? (
        <EmptyState
          title={t("magazine:issues.archiveErrorTitle")}
          description={t("magazine:issues.archiveErrorBody")}
          action={{
            label: t("magazine:issues.archiveRetryCta"),
            onClick: onRetry,
          }}
        />
      ) : !loading && issuesList.length === 0 ? (
        <EmptyState
          title={t("magazine:issues.archiveEmptyTitle")}
          description={t("magazine:issues.archiveEmptyBody")}
        />
      ) : view === "grid" ? (
        <div className={styles.grid}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <IssueTileSkeleton key={index} />
              ))
            : issuesList.map((issue, index) => (
                <FadeIn
                  as={Link}
                  to={ISSUE}
                  className={styles.tile}
                  key={issue.number}
                  delay={Math.min(index, 8) * 60}
                >
                  <div
                    className={`${styles.tileCover} ${styles[TINT_CLASS[issue.tint]]}`}
                  >
                    {issue.cover}
                  </div>
                  <div
                    className={[
                      styles.tileNum,
                      issue.current && styles.tileNumCurrent,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {issue.numberLabel}
                  </div>
                  <div className={styles.tileH}>{issue.title}</div>
                  <div className={styles.tileDate}>{issue.date}</div>
                </FadeIn>
              ))}
        </div>
      ) : (
        <div className={styles.list}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <IssueRowSkeleton key={index} />
              ))
            : issuesList.map((issue, index) => (
                <FadeIn
                  as={Link}
                  to={ISSUE}
                  className={styles.listRow}
                  key={issue.number}
                  delay={Math.min(index, 8) * 60}
                >
                  <div className={styles.listNum}>
                    {issue.current ? <em>{issue.number}</em> : issue.number}
                  </div>
                  <div>
                    <div className={styles.listH}>{issue.title}</div>
                    <div className={styles.listDek}>{issue.dek}</div>
                  </div>
                  <div className={styles.listMeta}>
                    <b>{issue.meta.season}</b>
                    {issue.meta.detail}
                  </div>
                </FadeIn>
              ))}
        </div>
      )}
    </section>
  );
}
