import { useState, type FormEvent, type ReactNode } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Sending } from "./ModalKit";
import { ReviewStarRating } from "./ReviewStarRating";
import shell from "./ApplicationModals.module.css";

/** The field values the three review modals collect and hand to their submit. */
export interface ReviewFormValues {
  /** Headline — only collected when `showTitle` is set. */
  title: string;
  rating: number;
  role: string;
  pros: string;
  cons: string;
}

/**
 * The copy that differs between the demo/live review modals. Labels shared by
 * all three (title heading, rating aria, pros/cons labels, cancel, submit) are
 * resolved inside ReviewForm so callers only thread the strings that vary.
 */
export interface ReviewFormCopy {
  eyebrow: string;
  sub: string;
  roleLabel: string;
  rolePlaceholder: string;
  prosPlaceholder: string;
  consPlaceholder: string;
  /** Only used when `showTitle` is set. */
  headlineLabel?: string;
  headlinePlaceholder?: string;
}

/**
 * The shared body of the three company-review modals — the eyebrow/title/sub,
 * the rating + role + pros/cons inputs, validation, and the submit footer. It
 * owns the field state and, on a valid submit, hands the collected values to the
 * injected `onSubmit` (already demo- or live-specific in each modal). Modal-owned
 * pieces stay out here: the company `<select>` arrives via `companySelect`, and
 * `submitDisabled` lets a modal veto submit on its own state (e.g. no slug). The
 * modal keeps the shell + plum SuccessPanel; ReviewForm renders only the form.
 */
export function ReviewForm({
  idPrefix,
  copy,
  showTitle = false,
  companySelect,
  submitDisabled = false,
  sending,
  onSubmit,
  onClose,
}: {
  /** Prefix for field ids so labels bind correctly per modal (e.g. "wr"). */
  idPrefix: string;
  copy: ReviewFormCopy;
  /** Render the headline field (live/company modals) — the demo one omits it. */
  showTitle?: boolean;
  /** Modal-owned company picker rendered above the shared fields. */
  companySelect?: ReactNode;
  /** Extra gate merged into canSubmit for modal-owned state (company/slug). */
  submitDisabled?: boolean;
  sending: boolean;
  onSubmit: (values: ReviewFormValues) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [role, setRole] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const fieldsValid =
    rating > 0 &&
    role.trim().length > 0 &&
    (pros.trim().length > 0 || cons.trim().length > 0) &&
    (!showTitle || title.trim().length > 0);
  const canSubmit = fieldsValid && !submitDisabled;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title, rating, role, pros, cons });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={shell.eyebrow}>{copy.eyebrow}</div>
      <h2 className={shell.title}>
        <Translation
          i18nKey="economy:companyReview.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={shell.sub}>{copy.sub}</p>

      {companySelect}

      {showTitle && (
        <div className={shell.field}>
          <label htmlFor={`${idPrefix}-title`}>{copy.headlineLabel}</label>
          <input
            id={`${idPrefix}-title`}
            type="text"
            placeholder={copy.headlinePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      )}

      <div className={shell.field}>
        <label>{t("economy:companyReview.overallRatingAriaLabel")}</label>
        <ReviewStarRating value={rating} onChange={setRating} />
      </div>

      <div className={shell.field}>
        <label htmlFor={`${idPrefix}-role`}>{copy.roleLabel}</label>
        <input
          id={`${idPrefix}-role`}
          type="text"
          placeholder={copy.rolePlaceholder}
          value={role}
          onChange={(event) => setRole(event.target.value)}
        />
      </div>

      <div className={shell.field}>
        <label htmlFor={`${idPrefix}-pros`}>
          {t("economy:companyReview.prosLabel")}
        </label>
        <textarea
          id={`${idPrefix}-pros`}
          placeholder={copy.prosPlaceholder}
          value={pros}
          onChange={(event) => setPros(event.target.value)}
        />
      </div>

      <div className={shell.field}>
        <label htmlFor={`${idPrefix}-cons`}>
          {t("economy:companyReview.consLabel")}
        </label>
        <textarea
          id={`${idPrefix}-cons`}
          placeholder={copy.consPlaceholder}
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
          <FiArrowLeft aria-hidden />{" "}
          {t("economy:companyReview.cancel")}
        </button>
        <Button size="lg" type="submit" disabled={sending || !canSubmit}>
          {sending ? (
            <Sending label={t("economy:companyReview.posting")} />
          ) : (
            <>
              {t("economy:companyReview.submitCta")}{" "}
              <FiArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
