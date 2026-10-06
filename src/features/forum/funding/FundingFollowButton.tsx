import { FiBell, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useTopicFollow } from "../../topics/api/useTopicFollow";
import { FOLLOW_TOAST_KEYS, OPEN_CALLS_TOPIC_TAG } from "./funding.data";

/**
 * Hear about every new open call. The server tags each call `open-call`, and
 * following that topic is what `TopicFollowNotificationsListener` fans out
 * to; this button is the whole of the frontend's part. The label carries the
 * state, so it needs no `aria-pressed`.
 */
export function FundingFollowButton() {
  const { t } = useTranslation();
  const { isFollowing, isPending, toggle } = useTopicFollow(
    OPEN_CALLS_TOPIC_TAG,
    { successToastKeys: FOLLOW_TOAST_KEYS },
  );
  return (
    // `aria-disabled` while the request runs keeps focus on the button, where
    // `disabled` would drop it to the page; the click is guarded instead.
    <Button
      variant={isFollowing ? "ghost" : "primary"}
      aria-disabled={isPending || undefined}
      onClick={() => {
        if (!isPending) toggle();
      }}
    >
      {isFollowing ? <FiCheck aria-hidden /> : <FiBell aria-hidden />}
      {t(
        isFollowing
          ? "forum:funding.follow.following"
          : "forum:funding.follow.follow",
      )}
    </Button>
  );
}
