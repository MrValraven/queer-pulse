import { type ReactNode, useId, useMemo } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiDisc, FiWifiOff } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioReasonCopyKey } from "../studio/studioReason";
import { STUDIO_FADE } from "../studio/studioMotion";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import css from "./StudioAdminPickDialog.module.css";
import { StudioAdminReleaseResultRow } from "./StudioAdminReleaseResultRow";
import { StudioAdminSearchError } from "./StudioAdminSearchError";

const SKELETON_ROWS = ["one", "two", "three", "four", "five"] as const;
const SKELETON_COVER_STYLE = { flex: "none", borderRadius: "var(--radius-8)" };

type ResultsView = "loading" | "error" | "offline" | "empty" | "list";

/** A centred icon over one quiet line: the empty and offline states. */
function ResultsStateLine({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={css.resultsState}>
      {icon}
      <p className={css.resultsStateLine} role="status">
        {children}
      </p>
    </div>
  );
}

/** The browsing area of the pick dialog, in one fixed frame so the dialog
 *  keeps its height: the newest releases under "Just released" while the
 *  search is blank, the matches once it is not, and a skeleton, the
 *  reason a search failed or paused offline, or a quiet empty line in
 *  between. Releases already taken sort to the end, in server order. */
export function StudioAdminReleaseResults({
  results,
  isBlankTerm,
  isLoading,
  isRefreshing,
  isPaused,
  isError,
  error,
  onRetry,
  chosenId,
  takenIds,
  takenLabel,
  onChoose,
}: {
  results: AdminStudioReleaseCardDTO[];
  /** True when `results` answer a blank search: the newest releases. */
  isBlankTerm: boolean;
  /** The first read runs and nothing is shown yet. */
  isLoading: boolean;
  /** A newer search runs while the last answer stays on screen. */
  isRefreshing: boolean;
  /** The device is offline and react-query holds the read until it is back. */
  isPaused: boolean;
  isError: boolean;
  /** Why the search failed, for the line that names it. */
  error: unknown;
  onRetry: () => void;
  chosenId: string | null;
  /** Releases already on the shelf: shown with a chip and impossible to choose. */
  takenIds: ReadonlySet<string>;
  /** The chip on a taken release, by shelf: "Featured now" or "On this shelf". */
  takenLabel: string;
  onChoose: (release: AdminStudioReleaseCardDTO) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const orderedResults = useMemo(
    () => [
      ...results.filter((release) => !takenIds.has(release.id)),
      ...results.filter((release) => takenIds.has(release.id)),
    ],
    [results, takenIds],
  );
  const view: ResultsView = isError
    ? "error"
    : isPaused
      ? "offline"
      : results.length > 0
        ? "list"
        : isLoading
          ? "loading"
          : "empty";
  const fade = reducedMotion ? { duration: 0 } : STUDIO_FADE;
  // Offline or failed, the held answer may be the newest releases while a
  // typed search waits, so the heading steps aside and the state line speaks.
  const headingKey =
    view === "error" || view === "offline"
      ? null
      : isBlankTerm
        ? "admin:studioAdmin.pickDialog.recentHeading"
        : "admin:studioAdmin.pickDialog.resultsLabel";
  const hasHeading = headingKey !== null;

  let body: ReactNode;
  if (view === "loading")
    body = (
      <div className={css.skeletonList}>
        <p className="visuallyHidden" role="status">
          {t("admin:studioAdmin.pickDialog.searching")}
        </p>
        {SKELETON_ROWS.map((rowKey) => (
          <div key={rowKey} className={css.skeletonRow} aria-hidden>
            <SkeletonLine width={44} height={44} style={SKELETON_COVER_STYLE} />
            <div className={css.skeletonText}>
              <SkeletonLine width="55%" height={14} />
              <SkeletonLine width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  else if (view === "error")
    body = (
      <div className={css.resultsState}>
        <FiAlertCircle className={css.resultsStateIcon} aria-hidden />
        <StudioAdminSearchError
          className={css.resultsStateLine}
          error={error}
          isRetrying={isRefreshing || isLoading}
          onRetry={onRetry}
        />
      </div>
    );
  else if (view === "offline")
    body = (
      <ResultsStateLine
        icon={<FiWifiOff className={css.resultsStateIcon} aria-hidden />}
      >
        {t(studioReasonCopyKey("offline", "load"))}
      </ResultsStateLine>
    );
  else if (view === "empty")
    body = (
      <ResultsStateLine
        icon={<FiDisc className={css.resultsStateIcon} aria-hidden />}
      >
        {t(
          isBlankTerm
            ? "admin:studioAdmin.pickDialog.noRecent"
            : "admin:studioAdmin.pickDialog.noResults",
        )}
      </ResultsStateLine>
    );
  else
    body = (
      <ul
        className={css.results}
        aria-labelledby={headingId}
        aria-busy={isRefreshing || undefined}
      >
        {orderedResults.map((release) => (
          <StudioAdminReleaseResultRow
            key={release.id}
            release={release}
            isChosen={chosenId === release.id}
            isTaken={takenIds.has(release.id)}
            takenLabel={takenLabel}
            onChoose={onChoose}
          />
        ))}
      </ul>
    );

  return (
    <section
      className={css.resultsArea}
      aria-labelledby={hasHeading ? headingId : undefined}
    >
      <h4
        id={headingId}
        className={css.resultsHeading}
        aria-hidden={!hasHeading || undefined}
      >
        <AnimatePresence mode="wait" initial={false}>
          {hasHeading ? (
            <m.span
              key={headingKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {t(headingKey)}
            </m.span>
          ) : null}
        </AnimatePresence>
      </h4>
      <div className={css.resultsFrame}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={view}
            className={
              view === "list"
                ? `${css.resultsScroll} ${css.resultsScrollList}`
                : css.resultsScroll
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: isRefreshing && view === "list" ? 0.6 : 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {body}
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
