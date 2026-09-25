import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useSubmitReview } from "./api/useSubmitReview";
import { DirectoryReviewComposer } from "./DirectoryReviewComposer";
import s from "./DirectorySpacePage.module.css";

/**
 * "Write a review" for a directory listing. Member-only: logged-out visitors
 * (the directory is a public page) see a prompt to sign in instead of the
 * form, matching how Save routes them. Submits through `useSubmitReview`,
 * which POSTs in live mode and patches the cached detail in demo mode.
 *
 * The form itself lives in `DirectoryReviewComposer`, shared with the edit
 * flow so writing and rewriting a review offer the same stars, words and
 * photo. A `resetKey` remounts the composer after a successful post, which
 * clears it back to empty.
 *
 * Mounted inside `DirectoryReviewFormDisclosure` (rendered by
 * `DirectoryReviewsSection`), which owns the open/closed state and stays
 * mounted while collapsed (hidden via the `hidden` attribute) so an
 * in-progress draft survives a collapse. `onCancel` and
 * `onPosted` let that parent return the panel to its collapsed state; both
 * are optional so the component still works wherever it is rendered always
 * open, without a collapse affordance.
 */
export function DirectoryReviewForm({
  slug,
  onCancel,
  onPosted,
}: {
  slug: string;
  /** Present only when the caller offers a way to dismiss the form without
   *  posting; threaded straight to the composer's own Cancel button. */
  onCancel?: () => void;
  /** Called once a post succeeds, after the success toast is queued, so the
   *  caller can collapse the panel and move focus. */
  onPosted?: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const submitReview = useSubmitReview(slug);
  const [resetKey, setResetKey] = useState(0);

  if (!user) {
    return (
      <div className={s.reviewSignIn}>
        {t("marketing:directory.detail.review.signInPrompt")}{" "}
        <Link to={routes.signIn}>
          {t("marketing:directory.detail.review.signInCta")}
        </Link>
      </div>
    );
  }

  return (
    <DirectoryReviewComposer
      key={resetKey}
      title={t("marketing:directory.detail.review.formTitle")}
      submitLabel={t("marketing:directory.detail.review.submit")}
      pendingLabel={t("marketing:directory.detail.review.submitting")}
      isPending={submitReview.isPending}
      onCancel={onCancel}
      onSubmit={(values) =>
        submitReview.mutate(values, {
          onSuccess: () => {
            setResetKey((current) => current + 1);
            showToast(
              t("marketing:directory.detail.review.successToast"),
              "success",
            );
            onPosted?.();
          },
          onError: () =>
            showToast(
              t("marketing:directory.detail.review.errorToast"),
              "error",
            ),
        })
      }
    />
  );
}
