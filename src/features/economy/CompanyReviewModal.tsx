import { useState, type FormEvent } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
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
        showToast("You've already reviewed this company.", "error");
      } else {
        showToast("We couldn't post your review. Please try again.", "error");
      }
    }
  }

  return (
    <ModalShell onClose={onClose} success={done} ariaLabel="Write a review">
      {done ? (
        <SuccessPanel title="Review" em="posted." onClose={onClose}>
          Thank you — your review of {companyName} is live. {companyName}{" "}
          can&apos;t edit or remove what you wrote.
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={shell.eyebrow}>Write a review</div>
          <h2 className={shell.title}>
            What was it <em>actually like?</em>
          </h2>
          <p className={shell.sub}>
            Your honest account helps the next queer person decide whether to
            take the interview. Verified by membership.
          </p>

          <div className={shell.field}>
            <label htmlFor="cr-title">Headline</label>
            <input
              id="cr-title"
              type="text"
              placeholder="Sum it up in a line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label>Overall rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-role">Your role / tenure</label>
            <input
              id="cr-role"
              type="text"
              placeholder="e.g. Designer, 2 years in role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-pros">What worked — the good</label>
            <textarea
              id="cr-pros"
              placeholder="Pronouns respected, real inclusion, leadership that gets it…"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
            />
          </div>

          <div className={shell.field}>
            <label htmlFor="cr-cons">What was hard — the rest</label>
            <textarea
              id="cr-cons"
              placeholder="Where the follow-through fell short…"
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
