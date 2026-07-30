import { useMemo, useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { ReviewStarRating } from "./ReviewStarRating";
import { useCreateReview } from "./api/useCompanyMutations";
import type { EmployerCard } from "./api/companies.adapters";
import shell from "./ApplicationModals.module.css";

/**
 * The live-mode "write a review" flow for the employer-reviews page. Unlike the
 * demo `WriteReviewModal` (which mutates local mock state), this posts to
 * POST /companies/:slug/reviews via `useCreateReview` for the chosen company,
 * mapping the form to a `CreateReviewDto`; the mutation invalidates the reviews
 * query so a subsequent CompanyPage visit shows the new review. A repeat review
 * answers 409, surfaced as a clear "already reviewed" toast.
 */
export function LiveWriteReviewModal({
  companies,
  initialSlug,
  onClose,
}: {
  companies: EmployerCard[];
  initialSlug?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Only companies with a resolved slug can receive a review (the endpoint is
  // keyed by slug); drop any card that lacks one.
  const reviewable = useMemo(
    () => companies.filter((company) => Boolean(company.slug)),
    [companies],
  );

  const [slug, setSlug] = useState(initialSlug ?? reviewable[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [role, setRole] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const create = useCreateReview(slug);
  const companyName =
    reviewable.find((company) => company.slug === slug)?.name ?? "";

  const canSubmit =
    slug.length > 0 &&
    title.trim().length > 0 &&
    rating > 0 &&
    role.trim().length > 0 &&
    (pros.trim().length > 0 || cons.trim().length > 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    const body: string[] = [];
    if (pros.trim()) body.push(`The good: ${pros.trim()}`);
    if (cons.trim()) body.push(`The hard parts: ${cons.trim()}`);
    const byline = `${role.trim()} · Rated ${rating}/5 · just now`;

    setSending(true);
    try {
      await create.mutateAsync({ title: title.trim(), stars: rating, byline, body });
      setSending(false);
      setDone(true);
    } catch (error) {
      setSending(false);
      if (error instanceof ApiError && error.status === 409) {
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
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className={shell.eyebrow}>
            {t("economy:writeReviewModal.eyebrow")}
          </div>
          <h2 className={shell.title}>
            <Translation
              i18nKey="economy:companyReview.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={shell.sub}>{t("economy:companyReview.sub")}</p>

          <div className={shell.field}>
            <label htmlFor="lwr-company">
              {t("economy:writeReviewModal.companyLabel")}
            </label>
            <select
              id="lwr-company"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            >
              {reviewable.map((company) => (
                <option key={company.slug} value={company.slug ?? ""}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className={shell.field}>
            <label htmlFor="lwr-title">
              {t("economy:companyReview.headlineLabel")}
            </label>
            <input
              id="lwr-title"
              type="text"
              placeholder={t("economy:companyReview.headlinePlaceholder")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label>{t("economy:companyReview.overallRatingAriaLabel")}</label>
            <ReviewStarRating value={rating} onChange={setRating} />
          </div>

          <div className={shell.field}>
            <label htmlFor="lwr-role">
              {t("economy:companyReview.roleLabel")}
            </label>
            <input
              id="lwr-role"
              type="text"
              placeholder={t("economy:companyReview.rolePlaceholder")}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="lwr-pros">
              {t("economy:companyReview.prosLabel")}
            </label>
            <textarea
              id="lwr-pros"
              placeholder={t("economy:companyReview.prosPlaceholder")}
              value={pros}
              onChange={(event) => setPros(event.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="lwr-cons">
              {t("economy:companyReview.consLabel")}
            </label>
            <textarea
              id="lwr-cons"
              placeholder={t("economy:companyReview.consPlaceholder")}
              value={cons}
              onChange={(event) => setCons(event.target.value)}
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
