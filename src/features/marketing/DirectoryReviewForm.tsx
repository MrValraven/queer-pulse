import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useSubmitReview } from "./api/useSubmitReview";
import s from "./DirectorySpacePage.module.css";

const STARS = [1, 2, 3, 4, 5];

/**
 * "Write a review" form for a directory listing. Member-only: logged-out
 * visitors (the directory is a public page) see a prompt to sign in instead of
 * the form. Submits through `useSubmitReview`, which POSTs in live mode and
 * patches the cached detail in demo mode.
 */
export function DirectoryReviewForm({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const submit = useSubmitReview(slug);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

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

  const canSubmit = stars >= 1 && text.trim().length > 0 && !submit.isPending;
  const shown = hover || stars;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    submit.mutate(
      { stars, text: text.trim() },
      {
        onSuccess: () => {
          setStars(0);
          setHover(0);
          setText("");
          showToast(
            t("marketing:directory.detail.review.successToast"),
            "success",
          );
        },
        onError: () =>
          showToast(
            t("marketing:directory.detail.review.errorToast"),
            "error",
          ),
      },
    );
  };

  return (
    <form className={s.reviewForm} onSubmit={handleSubmit}>
      <div className={s.reviewFormTitle}>
        {t("marketing:directory.detail.review.formTitle")}
      </div>
      <div
        className={s.starPick}
        role="radiogroup"
        aria-label={t("marketing:directory.detail.review.starsAria")}
      >
        {STARS.map((value) => (
          <button
            key={value}
            type="button"
            className={s.starBtn}
            aria-label={t("marketing:directory.detail.review.starAria", {
              count: value,
            })}
            aria-pressed={value <= stars}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(value)}
            onBlur={() => setHover(0)}
            onClick={() => setStars(value)}
          >
            <FiStar className={value <= shown ? s.starPicked : undefined} />
          </button>
        ))}
      </div>
      <textarea
        className={s.reviewInput}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("marketing:directory.detail.review.placeholder")}
        rows={3}
        maxLength={2000}
      />
      <div className={s.reviewFormActions}>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {submit.isPending
            ? t("marketing:directory.detail.review.submitting")
            : t("marketing:directory.detail.review.submit")}
        </Button>
      </div>
    </form>
  );
}
