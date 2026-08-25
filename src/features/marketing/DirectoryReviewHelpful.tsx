import { useState } from "react";
import { Link } from "react-router-dom";
import { FiThumbsUp } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useReviewHelpful } from "./api/useReviewHelpful";
import type { Review } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

interface Props {
  review: Review;
  slug: string;
  /** True when the signed-in member wrote this review. The endpoint answers
   *  400 for your own review, so the control never offers the action. */
  isOwnReview: boolean;
  /** Moderation preview: the count is still worth seeing, the action is not
   *  offered. */
  isReadOnly: boolean;
}

/**
 * "Members found this helpful": a real button with the real count.
 *
 * The public reads are CDN-cached and therefore carry no `hasVoted` (one
 * member's vote must never be served to the next reader), so this control
 * assumes nothing: it opens un-voted, moves optimistically on the press, and
 * then takes the mutation response as the truth for both the count and the
 * vote state. Both endpoints are idempotent, so a member who had already voted
 * in an earlier session simply gets their real count back and the optimistic
 * step is corrected in place.
 */
export function DirectoryReviewHelpful({
  review,
  slug,
  isOwnReview,
  isReadOnly,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const helpfulVote = useReviewHelpful(slug);
  const [hasVoted, setHasVoted] = useState(false);
  const [localHelpful, setLocalHelpful] = useState<number | null>(null);

  const count = localHelpful ?? review.helpful;
  const label = t("marketing:directory.detail.reviews.helpfulCta");
  // The accessible name opens with the visible label, then says what the
  // number means, so the count is never a bare digit to a screen reader.
  const ariaLabel = t("marketing:directory.detail.reviews.helpfulAria", {
    count,
  });
  const face = (
    <>
      <FiThumbsUp aria-hidden />
      {label}
      <span className={s.helpfulCount}>{count}</span>
    </>
  );

  if (isReadOnly || isOwnReview) {
    return (
      <span className={s.helpfulStatic}>{face}</span>
    );
  }

  // Logged-out visitors read the page, and the count, exactly as members do.
  // Pressing routes them to sign in, matching how Save already behaves here.
  if (!user) {
    return (
      <Link
        to={routes.signIn}
        className={s.helpfulBtn}
        aria-label={t("marketing:directory.detail.reviews.helpfulSignIn")}
      >
        {face}
      </Link>
    );
  }

  const handlePress = () => {
    if (helpfulVote.isPending) return;
    const isVoting = !hasVoted;
    const previousCount = count;
    setHasVoted(isVoting);
    setLocalHelpful(Math.max(0, previousCount + (isVoting ? 1 : -1)));
    helpfulVote.mutate(
      { reviewId: review.id, isVoting, currentHelpful: previousCount },
      {
        onSuccess: (response) => {
          setHasVoted(response.hasVoted);
          setLocalHelpful(response.helpful);
        },
        onError: () => {
          setHasVoted(!isVoting);
          setLocalHelpful(previousCount);
          showToast(
            t("marketing:directory.detail.reviews.helpfulError"),
            "error",
          );
        },
      },
    );
  };

  return (
    <button
      type="button"
      className={[s.helpfulBtn, hasVoted && s.helpfulBtnOn]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={hasVoted}
      aria-label={ariaLabel}
      onClick={handlePress}
    >
      {face}
    </button>
  );
}
