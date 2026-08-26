import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiLock, FiShield, FiUnlock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useLockThread, useSetThreadOfficial } from "./api/useForumMutations";
import { LockThreadModal } from "./LockThreadModal";
import { ThreadFollowButton } from "./ThreadFollowButton";
import type { Thread } from "./forum.data";
import styles from "./ThreadPage.module.css";

/** The breadcrumb bar above a thread: a "back to forum" link plus the thread's
 * category name. `categoryName` is already translated by the caller. When the
 * viewer is a moderator (`thread.canLock`), a lock/unlock control sits at the end
 * of the bar; when the viewer is an admin, a "QueerPulse Official" toggle joins
 * it. Demo threads never carry `canLock`/the real session role, so both
 * controls are live-only. */
export function ThreadTopbar({
  categoryName,
  thread,
}: {
  categoryName?: string;
  thread?: Pick<
    Thread,
    "slug" | "isLocked" | "canLock" | "author" | "isSubscribed"
  >;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { role } = useAuth();
  const { lock, unlock, isPending } = useLockThread();
  const { setOfficial, isPending: officialPending } = useSetThreadOfficial();
  const [lockPromptOpen, setLockPromptOpen] = useState(false);

  const canLock = !!thread?.canLock && !!thread.slug;
  const isLocked = !!thread?.isLocked;
  const canSetOfficial = role === "admin" && !!thread?.slug;
  const isOfficial = !!thread?.author.official;

  // Locking opens a small prompt for an optional reason note (shown on the
  // locked banner); unlocking needs no reason and fires straight away.
  function toggleLock() {
    if (!thread?.slug) return;
    if (!isLocked) {
      setLockPromptOpen(true);
      return;
    }
    unlock(thread.slug, {
      onSuccess: () => showToast(t("forum:toast.threadUnlocked"), "success"),
      onError: () => showToast(t("forum:toast.error"), "error"),
    });
  }

  function confirmLock(reason: string) {
    if (!thread?.slug) return;
    lock(thread.slug, reason, {
      onSuccess: () => {
        setLockPromptOpen(false);
        showToast(t("forum:toast.threadLocked"), "success");
      },
      onError: () => showToast(t("forum:toast.error"), "error"),
    });
  }

  function toggleOfficial() {
    if (!thread?.slug) return;
    const marking = !isOfficial;
    setOfficial(thread.slug, marking, {
      onSuccess: () =>
        showToast(
          t(
            marking
              ? "forum:toast.threadMarkedOfficial"
              : "forum:toast.threadUnmarkedOfficial",
          ),
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
            <FiChevronLeft aria-hidden="true" />
            {t("forum:threadPage.breadcrumbForum")}
          </Link>
          <span className={styles.sep} />
          <span className={styles.topCat}>{categoryName}</span>
          {thread && (
            <div className={styles.topbarActions}>
              {/* Follow is for everyone reading, not only staff — it is the
                  whole point of SOC-13 that a thread you neither started nor
                  replied to can still reach you. */}
              <ThreadFollowButton thread={thread} />
              {canSetOfficial && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleOfficial}
                  disabled={officialPending}
                >
                  <FiShield aria-hidden />
                  {t(
                    isOfficial
                      ? "forum:topbar.unmarkOfficial"
                      : "forum:topbar.markOfficial",
                  )}
                </Button>
              )}
              {canLock && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleLock}
                  disabled={isPending}
                >
                  {isLocked ? <FiUnlock aria-hidden /> : <FiLock aria-hidden />}
                  {t(
                    isLocked
                      ? "forum:topbar.unlockThread"
                      : "forum:topbar.lockThread",
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {lockPromptOpen && (
        <LockThreadModal
          busy={isPending}
          onConfirm={confirmLock}
          onClose={() => setLockPromptOpen(false)}
        />
      )}
    </section>
  );
}
