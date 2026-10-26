import { useRef, useState, type RefObject } from "react";
import { useAuth } from "../../app/providers/authContext";
import { Button, Collapse, Modal, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EmailCodeErrorText } from "../auth/EmailCodeErrorText";
import { EmailCodeStep } from "../auth/EmailCodeStep";
import { useResendCountdown } from "../auth/useResendCountdown";
import styles from "../auth/EmailCode.module.css";
import type { ReauthDialogRequest } from "./api/reauthDialogStore";
import { beginGoogleReauth } from "./api/useReauthToken";
import { useFocusStaysOnTop } from "./useFocusStaysOnTop";
import { useReauthCodeFlow } from "./useReauthCodeFlow";
import reauthStyles from "./ReauthCodeModal.module.css";

/**
 * "Confirm it's you": emails a code to the account's own address on open and
 * checks it in place. Mounted by ReauthCodeDialog above the router, so nothing
 * here links or navigates.
 */
export function ReauthCodeModal({
  request,
  onClose,
}: {
  request: ReauthDialogRequest;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const anchorRef = useRef<HTMLDivElement>(null);
  useFocusStaysOnTop(anchorRef);
  // A reopen with a kept code opens on its first box. One stable object, read
  // inside Modal's focus effect after the boxes mount; with no boxes yet,
  // Modal's own first-focusable rule applies.
  const [firstCodeBoxRef] = useState<RefObject<HTMLElement | null>>(() => ({
    get current() {
      return (
        anchorRef.current?.querySelector<HTMLElement>("input:not(:disabled)") ??
        null
      );
    },
  }));
  const flow = useReauthCodeFlow({
    onConfirmed: request.onConfirmed,
    onClose,
  });
  const { sentTo, failure, isRequesting } = flow;
  // A timed refusal of the first request names when asking again works.
  const retrySecondsLeft = useResendCountdown(flow.retryAvailableAt);

  return (
    <Modal
      title={t("settings:reauth.dialog.title")}
      sub={t("settings:reauth.dialog.lead")}
      onClose={onClose}
      initialFocusRef={firstCodeBoxRef}
    >
      <div ref={anchorRef} className={reauthStyles.body}>
        <div role="status">
          <Collapse isOpen={sentTo === null && isRequesting}>
            <div className={reauthStyles.sending}>
              <p className={styles.status}>
                <Spinner /> {t("settings:reauth.dialog.sending")}
              </p>
            </div>
          </Collapse>
        </div>
        <Collapse isOpen={sentTo === null && failure !== null}>
          <div className={styles.form}>
            <p role="alert" className={styles.status}>
              {failure ? <EmailCodeErrorText failure={failure} /> : null}
            </p>
            <div className={styles.actions}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isRequesting || retrySecondsLeft > 0}
                onClick={() => void flow.requestCode()}
              >
                {t("settings:reauth.dialog.sendCode")}
              </Button>
            </div>
          </div>
        </Collapse>
        <Collapse isOpen={sentTo !== null}>
          {sentTo !== null ? (
            <EmailCodeStep
              sentTo={sentTo}
              code={flow.code}
              onCodeChange={flow.setCode}
              onComplete={(value) => void flow.verifyCode(value)}
              failure={failure}
              isVerifying={flow.isVerifying}
              isResending={isRequesting}
              hasResent={flow.hasResent}
              resendAvailableAt={flow.resendAvailableAt}
              onResend={() => void flow.requestCode()}
              onSubmitCode={() => void flow.verifyCode(flow.code)}
            />
          ) : null}
        </Collapse>
      </div>
      {!flow.isDemo && user?.hasGoogle !== false ? (
        <div className={reauthStyles.alternative}>
          <p className={styles.or}>{t("auth:emailCode.or")}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={reauthStyles.alternativeButton}
            onClick={() => void beginGoogleReauth()}
          >
            {t("settings:reauth.dialog.googleCta")}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}
