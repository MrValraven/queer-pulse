import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { usePlatformStatus } from "../../shared/api/usePlatformStatus";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TERMS_VERSION } from "../auth/api/ageAttestation.api";
import type {
  EmailCodeFieldFailure,
  SignupFailure,
} from "../auth/api/emailCodeFailure";
import { EmailCodeErrorText } from "../auth/EmailCodeErrorText";
import { EmailCodeRequestForm } from "../auth/EmailCodeRequestForm";
import { EmailCodeStep } from "../auth/EmailCodeStep";
import { SignInNotice } from "../auth/SignInNotice";
import { noticeForAuthError } from "../auth/signInNotices";
import { useEmailCodeFlow } from "../auth/useEmailCodeFlow";
import emailCodeStyles from "../auth/EmailCode.module.css";
import styles from "./InviteEmailCodeJoin.module.css";

/** Where a new account lands after either way of joining from an invite. */
export const INVITE_SIGNUP_REDIRECT = "/onboarding";

/** The backend's `@MaxLength(100)` on both name fields. */
const NAME_MAX_LENGTH = 100;

export interface InviteEmailCodeJoinProps {
  inviteCode: string;
  is18: boolean;
  onEmailJoined: () => void;
}

/** The flow's `name_required` failure, from the check before sending or from
 *  the server's refusal of the code; null for any other failure. It is only
 *  ever a field failure: the reader never files it as a signup refusal. */
function nameRequiredFailure(
  failure: EmailCodeFieldFailure | null,
): EmailCodeFieldFailure | null {
  return failure?.kind === "reason" && failure.reason === "name_required"
    ? failure
    : null;
}

/** The signup refusal, kept on screen while it folds away. */
function SignupRefusalNotice({ failure }: { failure: SignupFailure | null }) {
  const { t } = useTranslation();
  const [shownFailure, setShownFailure] = useState(failure);
  if (failure !== null && failure !== shownFailure) setShownFailure(failure);
  return (
    <Collapse isOpen={failure !== null}>
      <div className={emailCodeStyles.step}>
        {shownFailure ? (
          <SignInNotice
            notice={noticeForAuthError(shownFailure.reason, t)}
            showSupportLink
          />
        ) : null}
      </div>
    </Collapse>
  );
}

/**
 * Register from an invite with a 6-digit email code. The name fields sit
 * above both steps and stay there, so after a `name_required` refusal the
 * person fixes the name and checks the same code again: a correct code stays
 * valid after a signup refusal.
 */
export function InviteEmailCodeJoin({
  inviteCode,
  is18,
  onEmailJoined,
}: InviteEmailCodeJoinProps) {
  const { t } = useTranslation();
  // The Terms revision in effect, as useCreateJoinRequest.ts reads it.
  const { data: platformStatus } = usePlatformStatus();
  const [isChosen, setIsChosen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const firstNameRef = useRef<HTMLInputElement>(null);
  // The flow has no way to clear its failure, so typing a name dismisses the
  // one on screen; the next refusal is a new object and shows again.
  const [dismissedNameFailure, setDismissedNameFailure] =
    useState<EmailCodeFieldFailure | null>(null);

  const flow = useEmailCodeFlow({
    redirect: INVITE_SIGNUP_REDIRECT,
    validateBeforeRequest: () =>
      firstName.trim() ? null : { kind: "reason", reason: "name_required" },
    getVerifyExtras: () => ({
      invite: inviteCode,
      ageAttested: true,
      termsVersion: platformStatus?.termsVersion ?? TERMS_VERSION,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }),
    onDemoSignedIn: onEmailJoined,
  });

  // A missing first name is worded on the first-name field, where the person
  // acts, and left out of the email field and the code boxes.
  const nameFailure = nameRequiredFailure(flow.fieldFailure);
  const shownNameFailure =
    nameFailure !== dismissedNameFailure ? nameFailure : null;
  const stepFailure = nameFailure ? null : flow.fieldFailure;

  // The address stays in "We sent a code to" while the code step folds away.
  const [shownSentTo, setShownSentTo] = useState(flow.sentTo ?? "");
  if (flow.sentTo !== null && flow.sentTo !== shownSentTo) {
    setShownSentTo(flow.sentTo);
  }

  // Runs after the code boxes hand focus back at the end of a check, so the
  // first-name field keeps it.
  useEffect(() => {
    if (nameFailure) firstNameRef.current?.focus();
  }, [nameFailure]);

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    setDismissedNameFailure(nameFailure);
  };

  return (
    <div className={styles.option}>
      <Button
        type="button"
        variant="ghost"
        className={styles.choose}
        disabled={!is18}
        aria-expanded={isChosen && is18}
        onClick={() => setIsChosen((current) => !current)}
      >
        {t("system:inviteLanding.card.emailCta")}
        <FiChevronDown aria-hidden className={styles.chevron} />
      </Button>
      <Collapse isOpen={isChosen && is18}>
        <div className={styles.join}>
          <div className={styles.nameRow}>
            <FormField
              label={t("system:inviteLanding.card.firstNameLabel")}
              required
              helper={t("system:inviteLanding.card.nameHelper")}
              error={
                shownNameFailure ? (
                  <EmailCodeErrorText failure={shownNameFailure} />
                ) : undefined
              }
            >
              <input
                ref={firstNameRef}
                type="text"
                name="firstName"
                autoComplete="given-name"
                maxLength={NAME_MAX_LENGTH}
                value={firstName}
                onChange={(event) => handleFirstNameChange(event.target.value)}
              />
            </FormField>
            <FormField label={t("system:inviteLanding.card.lastNameLabel")}>
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                maxLength={NAME_MAX_LENGTH}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </FormField>
          </div>
          <SignupRefusalNotice failure={flow.signupFailure} />
          <Collapse isOpen={flow.step === "email"}>
            <div className={emailCodeStyles.step}>
              <EmailCodeRequestForm
                email={flow.email}
                onEmailChange={flow.setEmail}
                shouldAutoFocus={flow.hasReturnedToEmail}
                failure={stepFailure}
                isRequesting={flow.isRequesting}
                onSubmit={() => void flow.requestCode()}
              />
            </div>
          </Collapse>
          <Collapse isOpen={flow.step === "code"}>
            <div className={emailCodeStyles.step}>
              <EmailCodeStep
                sentTo={shownSentTo}
                code={flow.code}
                onCodeChange={flow.setCode}
                onComplete={(code) => void flow.verifyCode(code)}
                failure={stepFailure}
                isVerifying={flow.isVerifying}
                isResending={flow.isRequesting}
                hasResent={flow.hasResent}
                resendAvailableAt={flow.resendAvailableAt}
                onResend={() => void flow.resendCode()}
                onSubmitCode={() => void flow.verifyCode(flow.code)}
                onUseDifferentEmail={flow.switchToDifferentEmail}
              />
            </div>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
