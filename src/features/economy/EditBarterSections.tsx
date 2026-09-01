import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiLock, FiRepeat } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EditBarterPage.module.css";

/** The frame every state of the edit page shares: the shell, the column, and
 *  the way back to the swaps you posted. */
export function EditBarterFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.myBarter} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("economy:barterEdit.back")}
        </Link>
        {children}
      </div>
    </PageShell>
  );
}

export function EditBarterSkeleton() {
  return (
    <div className={styles.card} aria-busy="true">
      <SkeletonLine width={140} height={20} />
      <SkeletonLine width="70%" height={28} style={{ marginTop: 12 }} />
      <SkeletonLine width="100%" height={44} style={{ marginTop: 24 }} />
      <SkeletonLine width="100%" height={44} style={{ marginTop: 16 }} />
      <SkeletonLine width="100%" height={96} style={{ marginTop: 16 }} />
    </div>
  );
}

/**
 * The fetch itself failed. Never collapsed into "this swap is gone": an outage
 * and a deleted post are different answers, and only one of them is worth
 * retrying.
 */
export function EditBarterLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      onRetry={onRetry}
      title={t("economy:barterEdit.loadError.title")}
      description={t("economy:barterEdit.loadError.body")}
    />
  );
}

/** The swap is not there: withdrawn, or its poster and the reader have blocked
 *  each other. */
export function EditBarterGone() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiRepeat />}
      title={t("economy:barterEdit.gone.title")}
      description={t("economy:barterEdit.gone.body")}
      action={{
        label: t("economy:barterEdit.gone.cta"),
        to: routes.myBarter,
      }}
    />
  );
}

/** Somebody else's swap. The server answers 403 rather than 404 here, so the
 *  page says what is actually true instead of pretending the post is missing. */
export function EditBarterNotYours() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiLock />}
      title={t("economy:barterEdit.notYours.title")}
      description={t("economy:barterEdit.notYours.body")}
      action={{
        label: t("economy:barterEdit.notYours.cta"),
        to: routes.barter,
      }}
    />
  );
}

/**
 * Shown above the form while somebody is still waiting on this swap. Editing is
 * allowed, and this is what makes the consequence visible: a headline change
 * moves the ground under an offer that has already been made, so the people who
 * made it are told the listing changed.
 */
export function EditBarterPendingNotice({ count }: { count: number }) {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <p className={styles.notice} role="status">
      <FiAlertCircle aria-hidden />
      <span>{t("economy:barterEdit.pendingNotice", { count })}</span>
    </p>
  );
}
