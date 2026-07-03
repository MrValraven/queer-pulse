import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, FormField, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useCreateJoinRequest } from "./api/useCreateJoinRequest";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalStyle = {
  fontWeight: 400,
  textTransform: "none" as const,
  letterSpacing: 0,
  fontSize: 11,
};

export function RequestInviteForm({
  first,
  setFirst,
  onSent,
}: {
  first: string;
  setFirst: (v: string) => void;
  onSent: () => void;
}) {
  const { showToast } = useToast();
  const createJoinRequest = useCreateJoinRequest();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [why, setWhy] = useState("");
  const [agreed, setAgreed] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;
  const submitting = createJoinRequest.isPending;
  const canSubmit =
    emailValid && why.trim().length > 0 && agreed && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createJoinRequest.mutateAsync(why.trim());
      onSent();
    } catch {
      showToast("Could not send your request — please try again", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.twoCol}>
        <FormField label="Your name">
          <input
            id="ri-first"
            type="text"
            placeholder="Alex"
            autoComplete="given-name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
        </FormField>
        <FormField label="City">
          <input
            id="ri-city"
            type="text"
            placeholder="Lisbon"
            autoComplete="address-level2"
          />
        </FormField>
      </div>

      <FormField
        label="Email"
        required
        error={
          emailError
            ? "That email doesn't look right — mind checking it?"
            : undefined
        }
      >
        <input
          id="ri-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={emailError}
        />
      </FormField>

      <FormField
        label={
          <>
            Anyone here you know <span style={optionalStyle}>(optional)</span>
          </>
        }
        helper="Naming a mutual is the fastest route in — but it's not required."
      >
        <input
          id="ri-mutual"
          type="text"
          placeholder="A member who can vouch for you"
        />
      </FormField>

      <FormField
        label="Why QueerPulse"
        required
        labelAside={`${why.length}/400`}
      >
        <textarea
          id="ri-why"
          maxLength={400}
          placeholder="What you're looking for, and what brings you here. A few honest sentences is plenty."
          value={why}
          onChange={(e) => setWhy(e.target.value)}
        />
      </FormField>

      <div className={styles.agreeRow}>
        <input
          id="ri-agree"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="ri-agree">
          I've read the{" "}
          <Link to={routes.guidelines} onClick={(e) => e.stopPropagation()}>
            community guidelines
          </Link>{" "}
          and I'm here in good faith.
        </label>
      </div>

      <Button
        type="submit"
        className={styles.authBtn}
        disabled={!canSubmit}
        aria-busy={submitting}
      >
        {submitting ? (
          <Sending label="Sending your request…" />
        ) : (
          "Send my request"
        )}
      </Button>
    </form>
  );
}
