import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  EmailCodeFieldFailure,
  EmailCodeReason,
} from "./api/emailCodeFailure";
import { EmailCodeErrorText } from "./EmailCodeErrorText";
import { isReadableTime, retryAtLabel } from "./retryAtLabel";

/**
 * The join-request flow's own lines for the email-code reasons whose sign-in
 * wording would mislead an applicant: codes switched off (sign-in points at
 * Google, which cannot file a request), a spent code (sign-in says "sign in
 * again") and a busy network (sign-in talks about sign-in codes).
 */
const JOIN_REASON_KEYS: Partial<Record<EmailCodeReason, string>> = {
  email_code_unavailable: "auth:requestInvite.codeError.emailCodeUnavailable",
  code_already_used: "auth:requestInvite.codeError.codeAlreadyUsed",
  network_busy: "auth:requestInvite.codeError.networkBusy",
};

/** The words for one email-code failure on the request-invite form. */
export function JoinRequestCodeErrorText({
  failure,
}: {
  failure: EmailCodeFieldFailure;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const key =
    failure.kind === "reason" ? JOIN_REASON_KEYS[failure.reason] : undefined;
  if (failure.kind !== "reason" || !key) {
    return <EmailCodeErrorText failure={failure} />;
  }
  if (failure.reason === "network_busy") {
    // Without a readable time, the shared throttled line says "wait a minute".
    if (!isReadableTime(failure.retryAt)) {
      return <>{t("auth:emailCode.error.throttled")}</>;
    }
    return <>{t(key, { time: retryAtLabel(failure.retryAt, format) })}</>;
  }
  return <>{t(key)}</>;
}
