import { Link } from "react-router-dom";
import { FiLock, FiUnlock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useLockThread } from "./api/useForumMutations";
import type { Thread } from "./forum.data";
import styles from "./ThreadPage.module.css";

/** The breadcrumb bar above a thread: a "back to forum" link plus the thread's
 * category name. `categoryName` is already translated by the caller. When the
 * viewer is a moderator (`thread.canLock`), a lock/unlock control sits at the end
 * of the bar. Demo threads never carry `canLock`, so the control is live-only. */
export function ThreadTopbar({
  categoryName,
  thread,
}: {
  categoryName?: string;
  thread?: Pick<Thread, "slug" | "isLocked" | "canLock">;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { lock, unlock, isPending } = useLockThread();

  const canLock = !!thread?.canLock && !!thread.slug;
  const isLocked = !!thread?.isLocked;

  function toggleLock() {
    if (!thread?.slug) return;
    const locking = !isLocked;
    const action = locking ? lock : unlock;
    action(thread.slug, {
      onSuccess: () =>
        showToast(
          t(locking ? "forum:toast.threadLocked" : "forum:toast.threadUnlocked"),
          "success",
        ),
      onError: () => showToast(t("forum:toast.error"), "error"),
    });
  }

  return (
    <section className={styles.topbar}>
      <div className="wrap">
        <div className={styles.topbarInner}>
          <Link to={routes.forum} className={styles.back}>
            <svg
              width={14}
              height={14}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="10,4 6,8 10,12" />
            </svg>
            {t("forum:threadPage.breadcrumbForum")}
          </Link>
          <span className={styles.sep} />
          <span className={styles.topCat}>{categoryName}</span>
          {canLock && (
            <Button
              type="button"
              variant="ghost"
              onClick={toggleLock}
              disabled={isPending}
              style={{ marginLeft: "auto" }}
            >
              {isLocked ? <FiUnlock aria-hidden /> : <FiLock aria-hidden />}
              {t(
                isLocked ? "forum:topbar.unlockThread" : "forum:topbar.lockThread",
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
