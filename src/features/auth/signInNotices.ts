import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiCloudOff,
  FiHeart,
  FiMail,
  FiUserPlus,
  FiWifiOff,
} from "react-icons/fi";
import type { BackendProbe } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";

export type FailedProbe = Extract<BackendProbe, { ok: false }>;

export type Notice = { Icon: IconType; title: string; body: string };

/**
 * Map a `?error=<code>` from the backend's Google callback to a notice.
 *
 * The callback is a full-page redirect, so a failed sign-in comes back as a
 * navigation to this page rather than a response we can read; the code in the
 * query is the only thing that survives the round trip. Codes come from
 * `SignupRejectedError.reason`, the `state` nonce check, and `OAuthCallbackError`
 * (which reflects Google's own `?error=`, so unknown values reach us and fall
 * through to the generic notice; never render the raw code).
 */
export function noticeForAuthError(code: string, t: TFunction): Notice {
  switch (code) {
    case "invite_required":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteRequired.title"),
        body: t("auth:signIn.notice.inviteRequired.body"),
      };
    case "invite_invalid":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteInvalid.title"),
        body: t("auth:signIn.notice.inviteInvalid.body"),
      };
    // The invite was addressed to a specific email and the Google account that
    // just signed in doesn't match it; sign in with that address, or ask anew.
    case "invite_email_mismatch":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.inviteEmailMismatch.title"),
        body: t("auth:signIn.notice.inviteEmailMismatch.body"),
      };
    // The person who sent the invite is no longer active on QueerPulse, so their
    // invite can't bring someone in. Not the visitor's fault; point them onward.
    case "invite_inviter_inactive":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteInviterInactive.title"),
        body: t("auth:signIn.notice.inviteInviterInactive.body"),
      };
    // This address is on the erasure suppression list: they deleted their
    // account, and silently re-creating it would undo that. Not an error on
    // their part, so the copy stays warm and points at a human, not a retry.
    case "account_suppressed":
      return {
        Icon: FiHeart,
        title: t("auth:signIn.notice.accountSuppressed.title"),
        body: t("auth:signIn.notice.accountSuppressed.body"),
      };
    // The backend refused a NEW account because the 18+ box wasn't ticked.
    // Reachable if someone hits /auth/google directly, bypassing the invite
    // landing page where the checkbox lives.
    case "age_attestation_required":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.ageAttestationRequired.title"),
        body: t("auth:signIn.notice.ageAttestationRequired.body"),
      };
    // A NEW account was refused because this email address already belongs to
    // one. Identity here is keyed on `googleId`, so this is someone whose
    // address is on an account created through a different Google identity (a
    // work vs personal account with the same address, or a re-created Google
    // account). Retrying the same way can't work, so the copy says so and the
    // support link below carries them to a human.
    case "email_in_use":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.emailInUse.title"),
        body: t("auth:signIn.notice.emailInUse.body"),
      };
    case "access_denied":
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.accessDenied.title"),
        body: t("auth:signIn.notice.accessDenied.body"),
      };
    case "no_email":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.noEmail.title"),
        body: t("auth:signIn.notice.noEmail.body"),
      };
    case "email_unverified":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.emailUnverified.title"),
        body: t("auth:signIn.notice.emailUnverified.body"),
      };
    // Registration is switched off platform-wide, or the platform is locked
    // (lockdown also closes signups). Existing members are unaffected; this
    // only ever reaches a brand-new account attempt.
    case "registration_disabled":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.registrationDisabled.title"),
        body: t("auth:signIn.notice.registrationDisabled.body"),
      };
    case "invalid_state":
    case "oauth_failed":
    default:
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.oauthFailed.title"),
        body: t("auth:signIn.notice.oauthFailed.body"),
      };
  }
}

/** Map each probe failure to a specific, no-blame notice for the member. */
export function noticeFor(err: FailedProbe, t: TFunction): Notice {
  switch (err.reason) {
    case "offline":
      return {
        Icon: FiWifiOff,
        title: t("auth:signIn.notice.offline.title"),
        body: t("auth:signIn.notice.offline.body"),
      };
    case "server":
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.serverError.title"),
        body: t("auth:signIn.notice.serverError.body", {
          status: err.status ? ` (${err.status})` : "",
        }),
      };
    case "unreachable":
    default:
      return {
        Icon: FiCloudOff,
        title: t("auth:signIn.notice.unreachable.title"),
        body: t("auth:signIn.notice.unreachable.body"),
      };
  }
}
