import { FiUserCheck, FiUserPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useFollow } from "./api/useFollow";

/**
 * The persona's follow control: a one-tap Follow/Following toggle. Mirrors
 * `SubprofileEndorse` minus the note + endorser cluster — followers are never
 * listed to preserve their anonymity, and the follower count now lives in the
 * hero's shared stat line rather than inline here. Owners can't follow their
 * own persona (`isOwnerViewing`), and a logged-out visitor can't either, so
 * both see nothing instead of the button. `followerCount` still feeds the
 * optimistic follow/unfollow cache updates via `useFollow`.
 */
export function SubprofileFollow({
  subprofileId,
  followerCount,
  viewerFollowing,
  isOwnerViewing,
}: {
  subprofileId: string;
  followerCount: number;
  viewerFollowing: boolean;
  isOwnerViewing: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const { follow, unfollow } = useFollow(subprofileId);

  const canFollow = !isOwnerViewing && (demoMode || loggedIn);
  const pending = follow.isPending || unfollow.isPending;

  async function toggle() {
    if (pending) return;
    try {
      if (viewerFollowing) {
        await unfollow.mutateAsync({ currentFollowerCount: followerCount });
      } else {
        await follow.mutateAsync({ currentFollowerCount: followerCount });
      }
    } catch {
      showToast(t("subprofiles:hero.follow.error"), "error");
    }
  }

  if (!canFollow) return null;

  return (
    <Button
      variant={viewerFollowing ? "jade" : "ghost"}
      size="md"
      aria-pressed={viewerFollowing}
      onClick={() => void toggle()}
      disabled={pending}
    >
      {viewerFollowing ? (
        <>
          <FiUserCheck aria-hidden />
          {t("subprofiles:hero.follow.following")}
        </>
      ) : (
        <>
          <FiUserPlus aria-hidden />
          {t("subprofiles:hero.follow.cta")}
        </>
      )}
    </Button>
  );
}
