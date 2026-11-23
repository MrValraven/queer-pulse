import { useTranslation } from "../../shared/i18n/useTranslation";
import { EmailCodeStep } from "./EmailCodeStep";
import { JoinRequestCodeErrorText } from "./JoinRequestCodeErrorText";
import type { RequestInviteCode } from "./useRequestInviteCode";
import styles from "./auth.module.css";

/**
 * The request-invite form's second step (SEC-10): six boxes for the code that
 * confirms the address. The request is filed the moment a correct code is
 * checked; the filled-in form waits one step back for a change of address.
 */
export function RequestInviteCodeStep({ flow }: { flow: RequestInviteCode }) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="ri-code-lead" className={styles.screenIn}>
      <p id="ri-code-lead" className={styles.sub}>
        {t("auth:requestInvite.codeStep.lead")}
      </p>
      <EmailCodeStep
        sentTo={flow.sentTo ?? ""}
        code={flow.code}
        onCodeChange={flow.setCode}
        onComplete={(typed) => void flow.verifyCode(typed)}
        failure={flow.codeFailure}
        isVerifying={flow.isVerifying}
        isResending={flow.isRequesting}
        hasResent={flow.hasResent}
        resendAvailableAt={flow.resendAvailableAt}
        onResend={() => void flow.resendCode()}
        onSubmitCode={() => void flow.verifyCode(flow.code)}
        onUseDifferentEmail={flow.returnToForm}
        verifyLabel={t("auth:requestInvite.codeStep.verifyCta")}
        failureText={
          flow.codeFailure ? (
            <JoinRequestCodeErrorText failure={flow.codeFailure} />
          ) : undefined
        }
      />
    </section>
  );
}
