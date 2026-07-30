import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { ReviewStarRating } from "./ReviewStarRating";
import { useSubmitFlow } from "./modalFlow";
import type { Company, Review } from "./employerReviews.data";
import shell from "./ApplicationModals.module.css";

export interface SubmittedReview {
  /** Company the review is about. */
  companyName: string;
  review: Review;
}

/**
 * Real "Write a review" flow: pick a company, rate it, name your role, and
 * leave pros + cons. On submit it prepends an anonymous review to that company
 * and shows the plum-panel success.
 */
export function WriteReviewModal({
  companies,
  initialCompany,
  onClose,
  onSubmit,
}: {
  companies: Company[];
  initialCompany?: string;
  onClose: () => void;
  onSubmit: (review: SubmittedReview) => void;
}) {
  const { t } = useTranslation();
  const [company, setCompany] = useState(
    initialCompany ?? companies[0]?.name ?? "",
  );
  const [rating, setRating] = useState(0);
  const [role, setRole] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const { submit, sending, done } = useSubmitFlow();

  const canSubmit =
    company.trim().length > 0 &&
    rating > 0 &&
    role.trim().length > 0 &&
    (pros.trim().length > 0 || cons.trim().length > 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const parts: string[] = [];
    if (pros.trim()) parts.push(`The good: ${pros.trim()}`);
    if (cons.trim()) parts.push(`The hard parts: ${cons.trim()}`);
    const review: Review = {
      text: `"${parts.join(" ")}"`,
      meta: [role.trim(), `Rated ${rating}/5`, "just now"],
    };
    submit(() => onSubmit({ companyName: company, review }));
  };

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:companyReview.success.title")}
          em={t("economy:companyReview.success.em")}
          onClose={onClose}
        >
          <Translation
            i18nKey="economy:writeReviewModal.success.body"
            values={{ company }}
          />
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={shell.eyebrow}>
            {t("economy:writeReviewModal.eyebrow")}
          </div>
          <h2 className={shell.title}>
            <Translation
              i18nKey="economy:companyReview.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={shell.sub}>{t("economy:writeReviewModal.sub")}</p>

          <div className={shell.field}>
            <label htmlFor="wr-company">
              {t("economy:writeReviewModal.companyLabel")}
            </label>
            <select
              id="wr-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              {companies.map((companyOption) => (
                <option key={companyOption.name}>{companyOption.name}</option>
              ))}
            </select>
          </div>

          <div className={shell.field}>
            <label>{t("economy:companyReview.overallRatingAriaLabel")}</label>
            <ReviewStarRating value={rating} onChange={setRating} />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-role">
              {t("economy:writeReviewModal.roleLabel")}
            </label>
            <input
              id="wr-role"
              type="text"
              placeholder={t("economy:writeReviewModal.rolePlaceholder")}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-pros">
              {t("economy:companyReview.prosLabel")}
            </label>
            <textarea
              id="wr-pros"
              placeholder={t("economy:writeReviewModal.prosPlaceholder")}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-cons">
              {t("economy:companyReview.consLabel")}
            </label>
            <textarea
              id="wr-cons"
              placeholder={t("economy:writeReviewModal.consPlaceholder")}
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
