import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";

/** The reason codes the backend sends when a welcome email is refused. Each
 *  maps to `admin:emailTemplates.send.error.<code>` in both catalogs. */
const KNOWN_REASONS = [
  "join_request_not_found",
  "invite_not_usable",
  "welcome_email_not_configured",
  "welcome_email_rejected",
  "welcome_email_unavailable",
] as const;

type KnownReason = (typeof KNOWN_REASONS)[number];

function isKnownReason(reason: string): reason is KnownReason {
  return (KNOWN_REASONS as readonly string[]).includes(reason);
}

/** The `reason` code off a failed send's error body, or null when there is
 *  none (same read the username save uses). */
function reasonCodeOf(error: ApiError): string | null {
  const reason = (error.data as { reason?: unknown } | null | undefined)
    ?.reason;
  return typeof reason === "string" && reason !== "" ? reason : null;
}

/**
 * The one sentence that names why a welcome email did not go out. Every branch
 * names its own cause: a known reason code, a role the caller lacks, an
 * unrecognised code (shown verbatim), a refusal without any code, or a request
 * that never reached the server.
 */
export function welcomeEmailSendErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (!(error instanceof ApiError)) {
    return t("admin:emailTemplates.send.error.unreachable");
  }
  const reason = reasonCodeOf(error);
  if (reason && isKnownReason(reason)) {
    return t(`admin:emailTemplates.send.error.${reason}`);
  }
  if (reason) {
    return t("admin:emailTemplates.send.error.unrecognised", { reason });
  }
  if (error.status === 403) {
    return t("admin:emailTemplates.send.error.forbidden");
  }
  return t("admin:emailTemplates.send.error.noReason", {
    status: String(error.status),
  });
}
