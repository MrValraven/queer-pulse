import { useState, type FormEvent } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import type { Company, Review } from "./employerReviews.data";
import styles from "./WriteReviewModal.module.css";
import shell from "./ApplicationModals.module.css";

export interface SubmittedReview {
  /** Company the review is about. */
  companyName: string;
  review: Review;
}

/** Star rating picker, 1–5. */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className={styles.stars} role="radiogroup" aria-label="Overall rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className={[styles.star, n <= value && styles.starOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(n)}
        >
          <FiStar size={26} aria-hidden />
        </button>
      ))}
    </div>
  );
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
        <SuccessPanel title="Review" em="posted." onClose={onClose}>
          Thank you — your anonymous review of {company} is live. Your name is
          never stored with it, and {company} can't edit or remove what you
          wrote.
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={shell.eyebrow}>Write a review · anonymous</div>
          <h2 className={shell.title}>
            What was it <em>actually like?</em>
          </h2>
          <p className={shell.sub}>
            Your honest account helps the next queer person decide whether to
            take the interview. Verified by membership, never attached to your
            name.
          </p>

          <div className={shell.field}>
            <label htmlFor="wr-company">Company</label>
            <select
              id="wr-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={shell.field}>
            <label>Overall rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-role">Your role / team</label>
            <input
              id="wr-role"
              type="text"
              placeholder="e.g. Engineering, Design, Operations"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-pros">What worked — the good</label>
            <textarea
              id="wr-pros"
              placeholder="Pronouns respected, real trans healthcare, leadership that gets it…"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="wr-cons">What was hard — the rest</label>
            <textarea
              id="wr-cons"
              placeholder="Pride logo with no follow-through, HR that didn't know how to help…"
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
              ← Cancel
            </button>
            <Button size="lg" type="submit" disabled={sending || !canSubmit}>
              {sending ? <Sending label="Posting…" /> : "Post review →"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
