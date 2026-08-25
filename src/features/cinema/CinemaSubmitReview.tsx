import { FiCheck } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  CAPTION_LANGS,
  COUNTRIES,
  FORMATS,
  LANGUAGES,
  REVENUE_MODELS,
  type OptionKeyDef,
} from "./cinemaSubmit.data";
import type { SubmitForm } from "./useSubmitForm";
import { FbHead } from "./CinemaSubmitParts";
import styles from "./CinemaSubmitPage.module.css";

/** Resolve a stored canonical value (e.g. `"pt"`) back to its translated
 * label for display — never render the raw stored value itself. */
function resolveOptionLabel(
  options: OptionKeyDef[],
  value: string,
  t: TFunction,
): string {
  const match = options.find((option) => option.value === value);
  return match ? t(match.labelKey) : "";
}

function Row({
  fieldLabel,
  value,
  onEdit,
}: {
  fieldLabel: string;
  value: string;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const empty = !value.trim();
  return (
    <div className={styles.reviewRow}>
      <span className={styles.rvK}>{fieldLabel}</span>
      <span
        className={[styles.rvV, empty && styles.rvEmpty]
          .filter(Boolean)
          .join(" ")}
      >
        {empty ? t("cinema:submit.review.value.notAddedYet") : value}
      </span>
      <button type="button" className={styles.rvEdit} onClick={onEdit}>
        {t("cinema:submit.review.editCta")}
      </button>
    </div>
  );
}

/** Step 5 — a scannable summary of the draft plus the co-op agreement. */
export function CinemaSubmitReview({
  form,
  onEdit,
}: {
  form: SubmitForm;
  onEdit: (step: number) => void;
}) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const format = resolveOptionLabel(FORMATS, draft.format, t);
  const revenue = resolveOptionLabel(REVENUE_MODELS, draft.revenue, t);
  const country = resolveOptionLabel(COUNTRIES, draft.country, t);
  const language = resolveOptionLabel(LANGUAGES, draft.language, t);
  const captionLangs = draft.captionLangs
    .map((captionLangValue) =>
      resolveOptionLabel(CAPTION_LANGS, captionLangValue, t),
    )
    .join(", ");
  const notesAddedCount = draft.notes.filter((note) =>
    note.topic.trim(),
  ).length;
  const runtimeLabel = draft.runtime
    ? t("cinema:submit.review.value.runtimeMinutes", {
        minutes: draft.runtime,
      })
    : "";

  return (
    <div className={styles.formBlock}>
      <FbHead
        num={5}
        heading={t("cinema:submit.form.review.heading")}
        sub={t("cinema:submit.form.review.sub")}
      />

      <div className={styles.reviewList}>
        <Row
          fieldLabel={t("cinema:submit.review.field.title")}
          value={draft.title}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.yearRuntime")}
          value={[draft.year, runtimeLabel].filter(Boolean).join(" · ")}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.format")}
          value={format}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.origin")}
          value={[country, language].filter(Boolean).join(" · ")}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.contentNotes")}
          value={
            notesAddedCount
              ? t("cinema:submit.review.value.notesAdded", {
                  count: notesAddedCount,
                })
              : ""
          }
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.poster")}
          value={draft.poster ?? ""}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.screener")}
          value={draft.screener}
          onEdit={() => onEdit(0)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.captions")}
          value={captionLangs}
          onEdit={() => onEdit(1)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.rightsConfirmed")}
          value={
            draft.rightsConfirmed ? t("cinema:submit.review.value.yes") : ""
          }
          onEdit={() => onEdit(2)}
        />
        <Row
          fieldLabel={t("cinema:submit.review.field.revenueModel")}
          value={revenue}
          onEdit={() => onEdit(3)}
        />
      </div>

      {/* i18n sweep: binding legal representation, same reasoning as the
          Step 3 rights checkbox — deliberately left English, not routed
          through t(). Flagged in the sweep report. */}
      <FormField className={styles.agreeField}>
        <button
          type="button"
          onClick={() => set("agreed", !draft.agreed)}
          aria-pressed={draft.agreed}
          className={[styles.confirm, draft.agreed && styles.confirmOn]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.confirmBox} aria-hidden>
            {draft.agreed && <FiCheck size={13} />}
          </span>
          {/* eslint-disable local/no-literal-string -- binding legal representation, deliberately left English per the comment above; not routed through t() */}
          <span className={styles.confirmText}>
            <strong>I agree to the co-op distribution terms</strong>: 80% of
            every rent and buy comes to me, 100% of tips, paid weekly,
            non-exclusive, cancellable anytime.
          </span>
          {/* eslint-enable local/no-literal-string */}
        </button>
      </FormField>
    </div>
  );
}
