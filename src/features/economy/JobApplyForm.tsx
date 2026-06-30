import { useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import type { Job } from "./jobs.data";
import styles from "./JobDetailPage.module.css";

export function JobApplyForm({ job }: { job: Job }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cvName, setCvName] = useState("No file chosen");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function openForm() {
    setOpen(true);
    setTimeout(() => nameRef.current?.focus(), 200);
  }

  function submit() {
    if (!name.trim() || !email.trim()) {
      showToast("Please fill in your name and email.", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setOpen(false);
      showToast(`Application sent to ${job.org}. Good luck!`, "success");
    }, 1600);
  }

  if (submitted) {
    return (
      <div className={styles.applyWrap}>
        <Button
          variant="jade"
          disabled
          style={{ width: "100%", justifyContent: "center" }}
        >
          <FiCheck /> Application sent
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.applyWrap}>
      {!open ? (
        <Button
          variant="primary"
          onClick={openForm}
          style={{ width: "100%", justifyContent: "center" }}
        >
          Apply now →
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setOpen(false)}
          style={{ width: "100%", justifyContent: "center" }}
        >
          Application form ↓
        </Button>
      )}

      {open && (
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              ref={nameRef}
              className={styles.input}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>CV / Portfolio</label>
            <div className={styles.cv}>
              <button
                type="button"
                className={styles.cvBtn}
                onClick={() => fileRef.current?.click()}
              >
                Upload file
              </button>
              <span className={styles.cvName}>{cvName}</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) =>
                  setCvName(e.target.files?.[0]?.name ?? "No file chosen")
                }
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Cover note{" "}
              <span className={styles.labelHint}>· 2–3 sentences</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder={`Tell ${job.org} what draws you to this role and what you'd bring.`}
            />
          </div>
          <div className={styles.formActions}>
            <Button
              variant="primary"
              onClick={submit}
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {submitting ? "Sending…" : "Send application →"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
