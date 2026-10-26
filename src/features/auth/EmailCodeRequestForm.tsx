import { useEffect, useRef, type FormEvent } from "react";
import { Button, FormField, Sending } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EmailCodeFieldFailure } from "./api/emailCodeFailure";
import { EmailCodeErrorText } from "./EmailCodeErrorText";
import styles from "./EmailCode.module.css";

export interface EmailCodeRequestFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  failure: EmailCodeFieldFailure | null;
  isRequesting: boolean;
  isDisabled?: boolean;
  /** Focus the field as it mounts: set when the person comes back from the
   *  code step to change the address (WCAG 2.4.3). */
  shouldAutoFocus?: boolean;
  onSubmit: () => void;
}

/** The first step: one email field and the button that sends the code. */
export function EmailCodeRequestForm({
  email,
  onEmailChange,
  failure,
  isRequesting,
  isDisabled = false,
  shouldAutoFocus = false,
  onSubmit,
}: EmailCodeRequestFormProps) {
  const { t } = useTranslation();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldAutoFocus) emailRef.current?.focus();
    // Mount only: the step swap mounts a fresh form, then the person steers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <FormField
        label={t("auth:emailCode.emailLabel")}
        helper={t("auth:emailCode.emailHelper")}
        error={failure ? <EmailCodeErrorText failure={failure} /> : undefined}
      >
        <input
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t("auth:emailCode.emailPlaceholder")}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </FormField>
      <Button
        type="submit"
        variant="primary"
        disabled={isRequesting || isDisabled}
      >
        {isRequesting ? (
          <Sending label={t("auth:emailCode.requesting")} />
        ) : (
          t("auth:emailCode.requestCta")
        )}
      </Button>
    </form>
  );
}
