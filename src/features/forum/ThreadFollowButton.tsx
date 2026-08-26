import { useState } from "react";
import { FiBell, FiBellOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFollowThread } from "./api/useForumMutations";
import type { Thread } from "./forum.data";

/**
 * Follow / unfollow a thread (SOC-13).
 *
 * Before this, the only way to hear about a thread was to have started it or to
 * have replied in it: a question you asked and then walked away from, or a
 * thread you were reading closely without posting, simply dropped out of your
 * life. Following is the manual half of the same mechanism that now auto-follows
 * an author on create and a member on reply.
 *
 * DEMO holds the pressed state locally, seeded from the mock thread's
 * `isSubscribed` (absent, so false): demo has no session to own a subscription
 * and the mutation no-ops. LIVE reads the flag off the thread DTO, which the
 * mutation's invalidation refreshes, so the button is never optimistic about a
 * preference the server owns.
 */
export function ThreadFollowButton({
  thread,
}: {
  thread: Pick<Thread, "slug" | "isSubscribed">;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { setFollowing, isPending } = useFollowThread();
  const [isDemoFollowing, setIsDemoFollowing] = useState(!!thread.isSubscribed);

  const isFollowing = demoMode ? isDemoFollowing : !!thread.isSubscribed;

  function toggle() {
    const next = !isFollowing;
    if (demoMode) {
      setIsDemoFollowing(next);
      showToast(
        t(next ? "forum:follow.followedToast" : "forum:follow.unfollowedToast"),
        "success",
      );
      return;
    }
    if (!thread.slug) return;
    setFollowing(thread.slug, next, {
      onSuccess: () =>
        showToast(
          t(
            next
              ? "forum:follow.followedToast"
              : "forum:follow.unfollowedToast",
          ),
          "success",
        ),
      onError: () => showToast(t("forum:toast.error"), "error"),
    });
  }

  // Live threads always carry a slug; a demo mock thread never does, and demo
  // is handled entirely above.
  if (!demoMode && !thread.slug) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isFollowing}
    >
      {isFollowing ? <FiBellOff aria-hidden /> : <FiBell aria-hidden />}
      {t(isFollowing ? "forum:follow.unfollowCta" : "forum:follow.followCta")}
    </Button>
  );
}
