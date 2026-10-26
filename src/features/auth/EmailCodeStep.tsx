import {
  Button,
  CodeInput,
  Collapse,
  FormField,
  Sending,
  Spinner,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EmailCodeFieldFailure } from "./api/emailCodeFailure";
import { EmailCodeErrorText } from "./EmailCodeErrorText";
import { useResendCountdown } from "./useResendCountdown";
import styles from "./EmailCode.module.css";

const CODE_LENGTH = 6;

export interface EmailCodeStepProps {
  sentTo: string;
  code: string;
  onCodeChange: (value: string) => void;
  onComplete: (code: string) => void;
  failure: EmailCodeFieldFailure | null;
  isVerifying: boolean;
  isResending: boolean;
  hasResent: boolean;
  resendAvailableAt: string | null;
  onResend: () => void;
  /** "Check this code": verify the boxes' current code again. */
  onSubmitCode: () => void;
  /** Omitted in the reauth dialog, where the address is the account's own. */
  onUseDifferentEmail?: () => void;
}

/**
 * The second step: six boxes for the code, the resend countdown and the way
 * back. It renders under ReauthCompletionProvider too, above the router, so
 * nothing here links or navigates.
 */
export function EmailCodeStep({
  sentTo,
  code,
  onCodeChange,
  onComplete,
  failure,
  isVerifying,
  isResending,
  hasResent,
  resendAvailableAt,
  onResend,
  onSubmitCode,
  onUseDifferentEmail,
}: EmailCodeStepProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const secondsLeft = useResendCountdown(resendAvailableAt);
  const codeLabel = t("auth:emailCode.codeLabel");

  return (
    <div className={styles.form}>
      <p className={styles.sentTo}>
        <Translation
          i18nKey="auth:emailCode.sentTo"
          values={{ email: sentTo }}
          components={{ strong: <strong /> }}
        />
      </p>
      <div>
        {/* The error sits right under the boxes and the spam hint after it:
            `.codeField` reorders FormField's helper below its error, so the
            boxes keep both in their description. */}
        <FormField
          className={styles.codeField}
          label={codeLabel}
          helper={t("auth:emailCode.spamHint")}
          error={failure ? <EmailCodeErrorText failure={failure} /> : undefined}
        >
          {/* A new code remounts the boxes, so their autofocus lands on the
              first box after a resend (WCAG 2.4.3). */}
          <CodeInput
            key={resendAvailableAt ?? "first-code"}
            value={code}
            onChange={onCodeChange}
            onComplete={onComplete}
            label={codeLabel}
            shouldAutoFocus
            isDisabled={isVerifying}
          />
        </FormField>
        {/* The live regions stay mounted so each line is announced as it
            folds in; Collapse only animates the content. */}
        <div role="status">
          <Collapse isOpen={isVerifying}>
            <p className={styles.status}>
              <Spinner /> {t("auth:emailCode.verifying")}
            </p>
          </Collapse>
        </div>
        <div role="status">
          <Collapse isOpen={hasResent && !failure && !isVerifying}>
            <p className={styles.status}>
              {t("auth:emailCode.resent", { email: sentTo })}
            </p>
          </Collapse>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="primary"
          className={styles.fullWidth}
          disabled={code.length !== CODE_LENGTH || isVerifying}
          onClick={onSubmitCode}
        >
          {t("auth:emailCode.verifyCta")}
        </Button>
        {/* A block, so the countdown's Collapse opens under the row without
            a flex gap, across the full width so it stays on one line. */}
        <div>
          <div className={styles.secondaryActions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.fullWidth}
              disabled={secondsLeft > 0 || isResending || isVerifying}
              onClick={onResend}
            >
              {isResending ? (
                <Sending label={t("auth:emailCode.resending")} />
              ) : (
                t("auth:emailCode.resendCta")
              )}
            </Button>
            {onUseDifferentEmail ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={styles.fullWidth}
                disabled={isVerifying}
                onClick={onUseDifferentEmail}
              >
                {t("auth:emailCode.differentEmailCta")}
              </Button>
            ) : null}
          </div>
          <Collapse isOpen={secondsLeft > 0}>
            <p className={styles.countdown}>
              <Translation
                i18nKey="auth:emailCode.resendIn"
                values={{ count: secondsLeft }}
                slots={{
                  count: (
                    <RollingNumber
                      className={styles.countdownNumber}
                      value={format.number(secondsLeft)}
                      numericValue={secondsLeft}
                    />
                  ),
                }}
              />
            </p>
          </Collapse>
        </div>
      </div>
    </div>
  );
}
