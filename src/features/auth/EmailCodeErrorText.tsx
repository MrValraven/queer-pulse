import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  EmailCodeFieldFailure,
  EmailCodeReason,
} from "./api/emailCodeFailure";
import { isReadableTime, retryAtLabel } from "./retryAtLabel";

/** One catalog string per reason, named in the contract file. */
const REASON_KEYS: Record<EmailCodeReason, string> = {
  email_invalid: "auth:emailCode.error.emailInvalid",
  too_many_codes: "auth:emailCode.error.tooManyCodes",
  network_busy: "auth:emailCode.error.networkBusy",
  resend_too_soon: "auth:emailCode.error.resendTooSoon",
  email_send_failed: "auth:emailCode.error.emailSendFailed",
  code_incorrect: "auth:emailCode.error.codeIncorrect",
  code_expired: "auth:emailCode.error.codeExpired",
  code_used_up: "auth:emailCode.error.codeUsedUp",
  code_replaced: "auth:emailCode.error.codeReplaced",
  code_already_used: "auth:emailCode.error.codeAlreadyUsed",
  too_many_attempts: "auth:emailCode.error.tooManyAttempts",
  account_recovery_review: "auth:emailCode.error.accountRecoveryReview",
  name_required: "auth:emailCode.error.nameRequired",
  email_code_unavailable: "auth:emailCode.error.emailCodeUnavailable",
};

/** The reasons whose copy carries a "write to us" link to the contact page. */
const CONTACT_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "account_recovery_review",
  "email_code_unavailable",
]);

const THROTTLED_KEY = "auth:emailCode.error.throttled";

type ReasonFailure = Extract<EmailCodeFieldFailure, { kind: "reason" }>;

/** The reasons whose copy names the moment the refusal lifts, and where that
 *  moment comes from in the failure. */
const TIMED_REASONS: Partial<
  Record<EmailCodeReason, (failure: ReasonFailure) => string | undefined>
> = {
  too_many_codes: (failure) => failure.retryAt,
  network_busy: (failure) => failure.retryAt,
  too_many_attempts: (failure) => failure.retryAt,
  resend_too_soon: (failure) => failure.resendAvailableAt,
};

/**
 * The words for one email-code failure. It renders under
 * ReauthCompletionProvider too, above the router, so the contact link is a
 * plain anchor and nothing here imports the router.
 */
export function EmailCodeErrorText({
  failure,
}: {
  failure: EmailCodeFieldFailure;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  if (failure.kind === "throttled") return <>{t(THROTTLED_KEY)}</>;
  if (failure.kind === "network") {
    return <>{t("auth:emailCode.error.network")}</>;
  }
  if (failure.kind === "unexpected") {
    return (
      <>{t("auth:emailCode.error.unexpected", { status: failure.status })}</>
    );
  }

  const { reason } = failure;
  if (CONTACT_REASONS.has(reason)) {
    return (
      <Translation
        i18nKey={REASON_KEYS[reason]}
        // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the translated link text at render.
        components={{ a: <a href={routes.contact} /> }}
      />
    );
  }
  if (reason === "code_incorrect" && failure.attemptsLeft !== undefined) {
    return (
      <>
        {t("auth:emailCode.error.codeIncorrectAttempts", {
          count: failure.attemptsLeft,
        })}
      </>
    );
  }
  const readTime = TIMED_REASONS[reason];
  if (readTime) {
    const iso = readTime(failure);
    // Without a readable time, the throttled copy says "wait a minute".
    if (!isReadableTime(iso)) return <>{t(THROTTLED_KEY)}</>;
    return <>{t(REASON_KEYS[reason], { time: retryAtLabel(iso, format) })}</>;
  }
  return <>{t(REASON_KEYS[reason])}</>;
}
