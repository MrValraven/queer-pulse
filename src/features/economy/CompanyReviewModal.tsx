import { useState, type FormEvent } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useCreateReview } from "./api/useCompanyMutations";
import type { CompanyReview } from "./companies.data";
import styles from "./WriteReviewModal.module.css";
import shell from "./ApplicationModals.module.css";

/** Star rating picker, 1–5. */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.stars}
      role="radiogroup"
      aria-label={t("economy:companyReview.overallRatingAriaLabel")}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={t("economy:companyReview.starAriaLabel", {
            count: starValue,
          })}
          className={[styles.star, starValue <= value && styles.starOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(starValue)}
        >
          <FiStar size={26} aria-hidden />
        </button>
      ))}
    </div>
  );
}

/**
 * Write a review for a single company. Demo prepends the review to local state
 * (via `onCreated`) and shows the plum-panel success; live POSTs it to
 * /companies/:slug/reviews and lets the invalidated query refetch. A repeat
 * review answers 409 — surfaced as a clear "already reviewed" toast.
 */
export function CompanyReviewModal({
  slug,
  companyName,
  onClose,
  onCreated,
}: {
  slug: string;
  companyName: string;
  onClose: () => void;
  onCreated: (review: CompanyReview) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const create = useCreateReview(slug);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [role, setRole] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit =
    title.trim().length > 0 &&
    rating > 0 &&
    role.trim().length > 0 &&
    (pros.trim().length > 0 || cons.trim().length > 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const body: string[] = [];
    if (pros.trim()) body.push(`The good: ${pros.trim()}`);
    if (cons.trim()) body.push(`The hard parts: ${cons.trim()}`);
    const byline = `${role.trim()} · Rated ${rating}/5 · just now`;
    const review: CompanyReview = {
      title: title.trim(),
      stars: rating,
      byline,
      body,
    };

    setSending(true);
    if (demoMode) {
      setTimeout(() => {
        setSending(false);
        setDone(true);
        onCreated(review);
      }, 900);
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        stars: rating,
        byline,
        body,
      });
      setSending(false);
      setDone(true);
      // Live: the invalidated reviews query refetches with the new review.
    } catch (err) {
      setSending(false);
      if (err instanceof ApiError && err.status === 409) {
        showToast(t("economy:companyReview.toast.alreadyReviewed"), "error");
      } else {
        showToast(t("economy:companyReview.toast.error"), "error");
      }
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:company.reviews.writeReview")}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:companyReview.success.title")}
          em={t("economy:companyReview.success.em")}
          onClose={onClose}
        >
          <Translation
            i18nKey="economy:companyReview.success.body"
            values={{ companyName }}
          />
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={shell.eyebrow}>
            {t("economy:company.reviews.writeReview")}
          </div>
          <h2 className={shell.title}>
            <Translation
              i18nKey="economy:companyReview.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={shell.sub}>{t("economy:companyReview.sub")}</p>

          <div className={shell.field}>
            <label htmlFor="cr-title">
              {t("economy:companyReview.headlineLabel")}
            </label>
            <input
              id="cr-title"
              type="text"
              placeholder={t("economy:companyReview.headlinePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label>{t("economy:companyReview.overallRatingAriaLabel")}</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-role">
              {t("economy:companyReview.roleLabel")}
            </label>
            <input
              id="cr-role"
              type="text"
              placeholder={t("economy:companyReview.rolePlaceholder")}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-pros">
              {t("economy:companyReview.prosLabel")}
            </label>
            <textarea
              id="cr-pros"
              placeholder={t("economy:companyReview.prosPlaceholder")}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-cons">
              {t("economy:companyReview.consLabel")}
            </label>
            <textarea
              id="cr-cons"
              placeholder={t("economy:companyReview.consPlaceholder")}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
            />
          </div>

          <div className={shell.foot}>
            <button
              type="button"
              className={shell.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:companyReview.cancel")}
            </button>
            <Button size="lg" type="submit" disabled={sending || !canSubmit}>
              {sending ? (
                <Sending label={t("economy:companyReview.posting")} />
              ) : (
                t("economy:companyReview.submitCta")
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
