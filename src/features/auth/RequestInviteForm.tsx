import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateJoinRequest } from "./api/useCreateJoinRequest";
import { isDuplicateJoinRequest, isUnder18Error } from "./api/joinRequest.api";
import { AgeAttestation } from "./AgeAttestation";
import { RequestInviteFields } from "./RequestInviteFields";
import { Under18Notice } from "./Under18Notice";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How the submission ended, so the page can confirm in the right words. */
export type RequestInviteOutcome = "sent" | "already";

export function RequestInviteForm({
  first,
  setFirst,
  onSent,
}: {
  first: string;
  setFirst: (v: string) => void;
  onSent: (outcome: RequestInviteOutcome) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createJoinRequest = useCreateJoinRequest();
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [why, setWhy] = useState("");
  const [mutual, setMutual] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;
  const submitting = createJoinRequest.isPending;
  const canSubmit =
    first.trim().length > 0 &&
    emailValid &&
    why.trim().length > 0 &&
    agreed &&
    is18 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      // The mutual isn't a field on POST /join-requests, so fold it into the
      // message rather than dropping it — the form asks for it and the copy
      // beside it says naming one helps, so a reviewer has to actually see it.
      const named = mutual.trim();
      const message = named
        ? `${why.trim()}\n\n${t("auth:requestInvite.field.mutual.messagePrefix", { name: named })}`
        : why.trim();
      await createJoinRequest.mutateAsync({
        name: first.trim(),
        email: email.trim(),
        city: city.trim() || undefined,
        message,
      });
      onSent("sent");
    } catch (err) {
      // 409: they already asked. That is not a mistake — confirm, don't scold.
      if (isDuplicateJoinRequest(err)) {
        onSent("already");
        return;
      }
      // 403 UNDER_18: the same humane pause the attestation checkbox leads to.
      if (isUnder18Error(err)) {
        setUnder18(true);
        return;
      }
      showToast(t("auth:requestInvite.submitError"), "error");
    }
  }

  // Someone told us they're under 18 — pause on the humane block, not the form.
  if (under18) {
    return (
      <Under18Notice
        onBack={() => setUnder18(false)}
        backLabel={t("auth:requestInvite.under18BackLabel")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <RequestInviteFields
        first={first}
        setFirst={setFirst}
        city={city}
        setCity={setCity}
        email={email}
        setEmail={setEmail}
        emailError={emailError}
        onEmailBlur={() => setTouched(true)}
        why={why}
        setWhy={setWhy}
        mutual={mutual}
        setMutual={setMutual}
      />

      <div className={styles.agreeRow}>
        <input
          id="ri-agree"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="ri-agree">
          <Translation
            i18nKey="auth:requestInvite.agree"
            components={{
              guidelines: (
                <Link
                  to={routes.guidelines}
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            }}
          />
        </label>
      </div>

      <AgeAttestation
        id="ri-age"
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => setUnder18(true)}
      />

      <Button
        type="submit"
        className={styles.authBtn}
        disabled={!canSubmit}
        aria-busy={submitting}
      >
        {submitting ? (
          <Sending label={t("auth:requestInvite.sending")} />
        ) : (
          t("auth:requestInvite.submit")
        )}
      </Button>
    </form>
  );
}
