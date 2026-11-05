import { FiSearch } from "react-icons/fi";
import { EmptyState, LoadErrorState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QuizshowStudioBack,
  type QuizshowStudioBackLink,
} from "./QuizshowStudioTopBar";
import topBarStyles from "./QuizshowStudioTopBar.module.css";
import styles from "./QuizshowStudio.module.css";

const SKELETON_THUMBNAIL_COUNT = 5;
/** "We couldn't load the quiz": the description under a named reason, or the title when there is none. */
const LOAD_ERROR_KEY = "quizshow:builder.loadError";

/** A reason that names something gone (`quizshow:errors.game_not_found`, say): trying again cannot bring it back. */
function isNotFoundReason(reasonKey: string | null): boolean {
  return reasonKey?.endsWith("_not_found") ?? false;
}

/** The bar before a quiz has loaded: only the way back, with the title's placeholder while it loads. */
function QuizshowStudioBareBar({
  backLink,
  isLoading,
}: {
  backLink: QuizshowStudioBackLink;
  isLoading: boolean;
}) {
  return (
    <header className={topBarStyles.bar}>
      <div className={topBarStyles.lead}>
        <QuizshowStudioBack backLink={backLink} />
        {isLoading && <span className={styles.skeletonTitle} aria-hidden />}
      </div>
    </header>
  );
}

/** The studio's shape while the quiz loads: the bar, a rail of slide outlines, the canvas and the inspector. */
export function QuizshowStudioLoading({
  backLink,
}: {
  backLink: QuizshowStudioBackLink;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.workspace} data-has-quiz aria-busy="true">
      <h1 className={styles.visuallyHidden}>{t("quizshow:studio.heading")}</h1>
      <QuizshowStudioBareBar backLink={backLink} isLoading />
      <div className={styles.skeletonRail} aria-hidden>
        <span className={styles.skeletonRow} />
        {Array.from({ length: SKELETON_THUMBNAIL_COUNT }, (_unused, index) => (
          <span key={index} className={styles.skeletonThumb} />
        ))}
      </div>
      <div className={styles.canvasCell}>
        <div className={styles.skeletonCanvas} aria-hidden />
        <p className={styles.visuallyHidden} role="status">
          {t("quizshow:studio.loading")}
        </p>
      </div>
      <div className={styles.inspectorCell}>
        <div className={styles.skeletonInspector} aria-hidden>
          <span className={styles.skeletonRow} />
          <span className={styles.skeletonBlock} />
          <span className={styles.skeletonRow} />
        </div>
      </div>
    </div>
  );
}

/**
 * A first load that never arrived: the reason, the way back, and Try again.
 * When the reason says the quiz's owner is gone, the way back is the action.
 */
export function QuizshowStudioError({
  backLink,
  reasonKey,
  onRetry,
  isRetrying,
}: {
  backLink: QuizshowStudioBackLink;
  reasonKey: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.workspace} data-has-quiz={false}>
      <h1 className={styles.visuallyHidden}>{t("quizshow:studio.heading")}</h1>
      <QuizshowStudioBareBar backLink={backLink} isLoading={false} />
      <div className={styles.canvasCell}>
        <div className={styles.errorPanel}>
          {isNotFoundReason(reasonKey) ? (
            <EmptyState
              icon={<FiSearch fill="none" />}
              headingLevel={2}
              title={t(reasonKey ?? LOAD_ERROR_KEY)}
              action={{ label: t(backLink.labelKey), to: backLink.to }}
            />
          ) : (
            <LoadErrorState
              title={t(reasonKey ?? LOAD_ERROR_KEY)}
              description={
                reasonKey === null || reasonKey === LOAD_ERROR_KEY
                  ? undefined
                  : t(LOAD_ERROR_KEY)
              }
              onRetry={onRetry}
              isRetrying={isRetrying}
              headingLevel={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}
