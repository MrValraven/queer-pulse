import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Collapse, Sending } from "../../shared/components/ui";
import { focusFirstErrorAfterRender } from "../../shared/lib/focusFirstError";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { parseJoinRequestSource } from "./api/joinRequestSource";
import { AgeAttestation } from "./AgeAttestation";
import { RequestInviteAgreeRow } from "./RequestInviteAgreeRow";
import { RequestInviteCodeStep } from "./RequestInviteCodeStep";
import { JoinRequestCodeErrorText } from "./JoinRequestCodeErrorText";
import { RequestInviteFields } from "./RequestInviteFields";
import { Under18Notice } from "./Under18Notice";
import { useRequestInviteCode } from "./useRequestInviteCode";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How the submission ended, so the page can confirm in the right words. */
export type RequestInviteOutcome = "sent" | "already";

/**
 * The form an applicant fills in to ask for an invite. Sending it emails a
 * 6-digit code that confirms the address (SEC-10); the request is filed once
 * the code is checked, on the step that replaces the form.
 */
export function RequestInviteForm({
  first,
  setFirst,
  onSent,
  onCodeStepChange,
}: {
  first: string;
  setFirst: (v: string) => void;
  /**
   * `statusToken` is the applicant's one-and-only key to their own status, and
   * it exists solely inside the 201 this form just received. It is null on the
   * `"already"` (409) path, which creates no row and therefore mints no token.
   */
  onSent: (outcome: RequestInviteOutcome, statusToken: string | null) => void;
  /** Told when the code step opens and closes, so the page can fold away
   *  its intro while the applicant types the code. */
  onCodeStepChange?: (isCodeStep: boolean) => void;
}) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // Which CTA sent them here, read once from `?from=`. Unknown/absent → null, so
  // a hand-edited param never becomes a stored source.
  const source = parseJoinRequestSource(searchParams.get("from"));
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [why, setWhy] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [socialProfile, setSocialProfile] = useState("");
  const [mutual, setMutual] = useState("");
  const [mutualTouched, setMutualTouched] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);
  // Flipped by the first rejected submit. Until then, only the blur-driven
  // `touched` check speaks up — we don't scold someone for fields they simply
  // haven't reached yet.
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const codeFlow = useRequestInviteCode({
    getFormVars: () => ({
      name: first.trim(),
      city: city.trim() || undefined,
      message: why.trim(),
      mutualMemberEmail: mutual.trim() || undefined,
      heardFrom: heardFrom.trim(),
      socialProfile: socialProfile.trim() || undefined,
      source: source ?? undefined,
    }),
    onSent,
    onUnder18: () => setUnder18(true),
  });

  const isCodeStep = codeFlow.sentTo !== null;
  useEffect(() => {
    onCodeStepChange?.(isCodeStep);
  }, [isCodeStep, onCodeStepChange]);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailEmpty = email.trim().length === 0;
  const emailError = (touched || attempted) && !emailEmpty && !emailValid;
  const emailMissing = attempted && emailEmpty;
  // The mutual is optional, but if given it must be a valid email — that's the
  // whole point of asking for it (a name we can't match doesn't help a reviewer).
  const mutualEmpty = mutual.trim().length === 0;
  const mutualValid = EMAIL_RE.test(mutual.trim());
  const mutualError =
    (mutualTouched || attempted) && !mutualEmpty && !mutualValid;
  const firstMissing = attempted && first.trim().length === 0;
  const whyMissing = attempted && why.trim().length === 0;
  const heardFromMissing = attempted && heardFrom.trim().length === 0;
  const consentMissing = attempted && !agreed;
  const ageMissing = attempted && !is18;
  const submitting = codeFlow.isRequesting;
  const canSubmit =
    first.trim().length > 0 &&
    emailValid &&
    (mutualEmpty || mutualValid) &&
    why.trim().length > 0 &&
    heardFrom.trim().length > 0 &&
    agreed &&
    is18 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!canSubmit) {
      // The submit button stays enabled precisely so we can get here: reveal
      // every outstanding error at once, then move focus to the first one.
      // Returning silently (or disabling the button) leaves a keyboard or
      // screen-reader user with no idea why nothing happened.
      setAttempted(true);
      focusFirstErrorAfterRender(formRef.current);
      return;
    }
    await codeFlow.requestCode(email);
  }

  // Someone told us they're under 18: pause on the humane block.
  if (under18) {
    return (
      <Under18Notice
        onBack={() => setUnder18(false)}
        backLabel={t("auth:requestInvite.under18BackLabel")}
      />
    );
  }

  // The code is on its way: the filled-in form waits one step back.
  if (isCodeStep) return <RequestInviteCodeStep flow={codeFlow} />;

  return (
    <form
      ref={formRef}
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <RequestInviteFields
        first={first}
        setFirst={setFirst}
        city={city}
        setCity={setCity}
        email={email}
        setEmail={setEmail}
        emailError={emailError}
        emailMissing={emailMissing}
        onEmailBlur={() => setTouched(true)}
        heardFrom={heardFrom}
        setHeardFrom={setHeardFrom}
        socialProfile={socialProfile}
        setSocialProfile={setSocialProfile}
        heardFromMissing={heardFromMissing}
        firstMissing={firstMissing}
        whyMissing={whyMissing}
        why={why}
        setWhy={setWhy}
        mutual={mutual}
        setMutual={setMutual}
        mutualError={mutualError}
        onMutualBlur={() => setMutualTouched(true)}
        shouldFocusEmail={codeFlow.hasReturnedToForm}
      />

      <RequestInviteAgreeRow
        agreed={agreed}
        onAgree={() => setAgreed(true)}
        invalid={consentMissing}
      />

      <AgeAttestation
        id="ri-age"
        invalid={ageMissing}
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => {
          codeFlow.clearReturnedToForm();
          setUnder18(true);
        }}
      />

      {/* `aria-disabled`: the control must stay focusable and clickable so an
          invalid submit can answer with errors and focus. It still renders as
          dimmed, since Button.module.css styles `[aria-disabled="true"]`
          exactly like `:disabled`. */}
      <Button
        type="submit"
        className={styles.authBtn}
        aria-disabled={!canSubmit}
        aria-busy={submitting}
      >
        {submitting ? (
          <Sending label={t("auth:emailCode.requesting")} />
        ) : (
          t("auth:emailCode.requestCta")
        )}
      </Button>
      {/* Stays mounted so the refusal is announced as it folds in. */}
      <div role="alert">
        <Collapse isOpen={codeFlow.requestFailure !== null}>
          {codeFlow.requestFailure ? (
            <p className={styles.fieldError}>
              <JoinRequestCodeErrorText failure={codeFlow.requestFailure} />
            </p>
          ) : null}
        </Collapse>
      </div>
    </form>
  );
}
