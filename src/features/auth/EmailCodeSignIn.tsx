import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SignupFailure } from "./api/emailCodeFailure";
import { EmailCodeRequestForm } from "./EmailCodeRequestForm";
import { EmailCodeStep } from "./EmailCodeStep";
import { SignInNotice } from "./SignInNotice";
import { noticeForAuthError } from "./signInNotices";
import { useEmailCodeFlow } from "./useEmailCodeFlow";
import styles from "./EmailCode.module.css";

/**
 * The email code option under the Google button: an "or" divider, the
 * address field, then the six code boxes once a code is on its way. A
 * signup refusal (no invite, registration paused) reuses the Google
 * callback's notice copy, since the backend refuses both ways for the same
 * reasons.
 */
export function EmailCodeSignIn({ dest }: { dest: string }) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const flow = useEmailCodeFlow({
    redirect: dest,
    onDemoSignedIn: () => {
      signIn(dest);
      void navigate(dest);
    },
  });
  const { signupFailure, sentTo } = flow;

  // The last refusal and the last address stay rendered while their Collapse
  // folds away, so the words hold until the panel is gone. Adjusted during
  // render, the pattern React documents for a value that follows a changing
  // one.
  const [shownFailure, setShownFailure] = useState<SignupFailure | null>(
    signupFailure,
  );
  if (signupFailure !== null && signupFailure !== shownFailure) {
    setShownFailure(signupFailure);
  }
  const [shownSentTo, setShownSentTo] = useState(sentTo ?? "");
  if (sentTo !== null && sentTo !== shownSentTo) setShownSentTo(sentTo);

  return (
    // No flex gap here: each panel carries its own top margin inside its
    // Collapse, so the space opens and folds with the panel.
    <div>
      <p className={styles.or}>{t("auth:emailCode.or")}</p>
      <Collapse isOpen={signupFailure !== null}>
        <div className={styles.step}>
          {shownFailure ? (
            <SignInNotice
              notice={noticeForAuthError(shownFailure.reason, t)}
              showSupportLink
            />
          ) : null}
        </div>
      </Collapse>
      <Collapse isOpen={flow.step === "email"}>
        <div className={styles.step}>
          <EmailCodeRequestForm
            email={flow.email}
            onEmailChange={flow.setEmail}
            shouldAutoFocus={flow.hasReturnedToEmail}
            failure={flow.fieldFailure}
            isRequesting={flow.isRequesting}
            onSubmit={() => void flow.requestCode()}
          />
        </div>
      </Collapse>
      <Collapse isOpen={flow.step === "code"}>
        <div className={styles.step}>
          <EmailCodeStep
            sentTo={shownSentTo}
            code={flow.code}
            onCodeChange={flow.setCode}
            onComplete={(code) => void flow.verifyCode(code)}
            failure={flow.fieldFailure}
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
  );
}
