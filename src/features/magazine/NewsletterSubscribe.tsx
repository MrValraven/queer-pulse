import { useState, type FormEvent } from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { STREAM_LABEL, type Stream } from "./newsletterArchive.data";
import styles from "./NewsletterArchivePage.module.css";

interface Props {
  /** The stream currently selected via the tabs — pre-selected in the form. */
  stream: Stream | "all";
}

export function NewsletterSubscribe({ stream }: Props) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{
    email: string;
    stream: Stream | "all";
  } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone({ email: email.trim(), stream });
    showToast("Almost there — check your inbox to confirm", "success");
    setEmail("");
  }

  if (done) {
    return (
      <div className={styles.subDone} role="status">
        <span className={styles.subDoneIcon} aria-hidden>
          <FiCheckCircle />
        </span>
        <div>
          <h3 className={styles.subDoneTitle}>
            One more <em>step.</em>
          </h3>
          <p className={styles.subDoneBody}>
            We'll send <strong>{STREAM_LABEL[done.stream]}</strong> to{" "}
            <strong>{done.email}</strong>.
          </p>
          <p className={styles.subDoneNext}>
            <FiMail aria-hidden /> Check your inbox to confirm — the link
            expires in 48 hours. You can change which streams you get from any
            email.
          </p>
          <Button variant="ghost-dark" onClick={() => setDone(null)}>
            Subscribe another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className={styles.sub} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">
          Subscribe →
        </Button>
      </form>
      <p className={styles.subFoot}>
        {stream === "all" ? (
          "Pick which newsletters you want in step 2. "
        ) : (
          <>
            You'll get <strong>{STREAM_LABEL[stream]}</strong> — adjust in step
            2.{" "}
          </>
        )}
        Unsubscribe one-tap from any email. We never share your address.
      </p>
    </>
  );
}
