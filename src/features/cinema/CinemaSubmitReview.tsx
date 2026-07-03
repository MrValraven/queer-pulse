import { FiCheck } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import { FORMATS, REVENUE_MODELS } from "./cinemaSubmit.data";
import type { SubmitForm } from "./useSubmitForm";
import { FbHead } from "./CinemaSubmitParts";
import styles from "./CinemaSubmitPage.module.css";

function Row({
  k,
  value,
  onEdit,
}: {
  k: string;
  value: string;
  onEdit: () => void;
}) {
  const empty = !value.trim();
  return (
    <div className={styles.reviewRow}>
      <span className={styles.rvK}>{k}</span>
      <span
        className={[styles.rvV, empty && styles.rvEmpty]
          .filter(Boolean)
          .join(" ")}
      >
        {empty ? "Not added yet" : value}
      </span>
      <button type="button" className={styles.rvEdit} onClick={onEdit}>
        Edit
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
  const { draft, set } = form;
  const format = FORMATS.find((f) => f.value === draft.format)?.label ?? "";
  const revenue =
    REVENUE_MODELS.find((m) => m.value === draft.revenue)?.label ?? "";
  const notes = draft.notes.filter((n) => n.topic.trim()).length;

  return (
    <div className={styles.formBlock}>
      <FbHead
        num={5}
        title="Review"
        titlePost="& submit"
        sub="One last look. You can edit any answer, or send it to the team now."
      />

      <div className={styles.reviewList}>
        <Row k="Title" value={draft.title} onEdit={() => onEdit(0)} />
        <Row
          k="Year · runtime"
          value={[draft.year, draft.runtime && `${draft.runtime} min`]
            .filter(Boolean)
            .join(" · ")}
          onEdit={() => onEdit(0)}
        />
        <Row k="Format" value={format} onEdit={() => onEdit(0)} />
        <Row
          k="Origin"
          value={[draft.country, draft.language].filter(Boolean).join(" · ")}
          onEdit={() => onEdit(0)}
        />
        <Row
          k="Content notes"
          value={notes ? `${notes} added` : ""}
          onEdit={() => onEdit(0)}
        />
        <Row k="Poster" value={draft.poster ?? ""} onEdit={() => onEdit(0)} />
        <Row k="Screener" value={draft.screener} onEdit={() => onEdit(0)} />
        <Row
          k="Captions"
          value={draft.captionLangs.join(", ")}
          onEdit={() => onEdit(1)}
        />
        <Row
          k="Rights confirmed"
          value={draft.rightsConfirmed ? "Yes" : ""}
          onEdit={() => onEdit(2)}
        />
        <Row k="Revenue model" value={revenue} onEdit={() => onEdit(3)} />
      </div>

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
          <span className={styles.confirmText}>
            <strong>I agree to the co-op distribution terms</strong> — 80% of
            every rent and buy comes to me, 100% of tips, paid weekly,
            non-exclusive, cancellable anytime.
          </span>
        </button>
      </FormField>
    </div>
  );
}
