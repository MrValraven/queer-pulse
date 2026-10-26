import { useEffect, useRef, useState } from "react";
import { useIsPresent } from "motion/react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReauthCodeChallenge } from "../auth/api/emailCode.api";
import {
  asFieldFailure,
  readEmailCodeFailure,
  type EmailCodeFieldFailure,
  type EmailCodeReason,
} from "../auth/api/emailCodeFailure";
import {
  useRequestReauthCode,
  useVerifyReauthCode,
} from "../auth/api/useEmailCode";
import {
  forgetReauthChallenge,
  readLiveReauthChallenge,
  rememberReauthChallenge,
} from "./api/reauthDialogStore";
import { cacheReauthToken } from "./api/useReauthToken";

export interface ReauthCodeFlow {
  sentTo: string | null;
  code: string;
  setCode: (value: string) => void;
  failure: EmailCodeFieldFailure | null;
  isRequesting: boolean;
  isVerifying: boolean;
  hasResent: boolean;
  resendAvailableAt: string | null;
  /** When a refused request may be asked again (a timed refusal), else null. */
  retryAvailableAt: string | null;
  /** Demo has no Google round trip to offer: its session refresh fails and
   *  would send the person to sign-in. */
  isDemo: boolean;
  requestCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
}

/** The reasons that leave the typed code unusable, so the boxes empty
 *  (the same rule as the sign-in flow). */
const UNUSABLE_CODE_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "code_incorrect",
  "code_expired",
  "code_used_up",
  "code_replaced",
  "code_already_used",
]);

/** The reasons after which the kept challenge's code can never verify, so a
 *  later open asks for a new one. */
const DEAD_CHALLENGE_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "code_expired",
  "code_used_up",
  "code_replaced",
  "code_already_used",
  "too_many_attempts",
]);

const RESEND_TOO_SOON: ReadonlySet<EmailCodeReason> = new Set([
  "resend_too_soon",
]);

/** The refusals that name when asking for a code works again. */
const TIMED_REQUEST_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "too_many_codes",
  "network_busy",
  "resend_too_soon",
]);

function hasReason(
  failure: EmailCodeFieldFailure,
  reasons: ReadonlySet<EmailCodeReason>,
): boolean {
  return failure.kind === "reason" && reasons.has(failure.reason);
}

/** When a refused request may be asked again, or `null` when it may be asked
 *  at once. The caps send `retryAt`, the cooldown `resendAvailableAt`. */
function retryTimeOf(failure: EmailCodeFieldFailure | null): string | null {
  if (failure?.kind !== "reason") return null;
  if (!TIMED_REQUEST_REASONS.has(failure.reason)) return null;
  return failure.retryAt ?? failure.resendAvailableAt ?? null;
}

/**
 * The step-up code dialog's state: one code emailed to the account's own
 * address when the dialog opens (or the kept code from a moment ago, see
 * `rememberReauthChallenge`), a resend, and the check. It mounts above
 * the router, so it never navigates. Busy flags are local state with refs
 * beside them: the refs answer "is a call in flight" in the same tick (an
 * auto-submit and a paste together), and the state survives StrictMode's
 * resubscribe, which can leave a mutation's own `isPending` stale.
 */
export function useReauthCodeFlow({
  onConfirmed,
  onClose,
}: {
  onConfirmed?: () => void;
  onClose: () => void;
}): ReauthCodeFlow {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { mutateAsync: sendRequest } = useRequestReauthCode();
  const { mutateAsync: sendVerify } = useVerifyReauthCode();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const ownerId = user?.id ?? null;
  const isPresent = useIsPresent();

  // A reopen inside the resend cooldown picks up the code already sent.
  const [challenge, setChallenge] = useState<ReauthCodeChallenge | null>(() =>
    readLiveReauthChallenge(ownerId),
  );
  const [code, setCode] = useState("");
  const [failure, setFailure] = useState<EmailCodeFieldFailure | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const isRequestingRef = useRef(false);
  const isVerifyingRef = useRef(false);
  const hasRequestedOnOpenRef = useRef(false);
  // False once the dialog starts its exit or unmounts.
  const isActiveRef = useRef(false);

  const requestCode = async () => {
    if (isRequestingRef.current || isVerifyingRef.current) return;
    isRequestingRef.current = true;
    setIsRequesting(true);
    // Before the first code arrives the refusal has its own line, which
    // folds away while the new request is on its way.
    if (challenge === null) setFailure(null);
    try {
      const next = await sendRequest(language);
      if (ownerId) rememberReauthChallenge(next, ownerId);
      setHasResent(challenge !== null);
      setChallenge(next);
      setCode("");
      setFailure(null);
    } catch (error) {
      const next = asFieldFailure(readEmailCodeFailure(error));
      // A code asked for a moment ago is still on its way: show its boxes.
      const kept =
        challenge === null &&
        hasReason(next, RESEND_TOO_SOON) &&
        readLiveReauthChallenge(ownerId);
      if (kept) setChallenge(kept);
      else setFailure(next);
    } finally {
      isRequestingRef.current = false;
      setIsRequesting(false);
    }
  };

  const verifyCode = async (submitted: string) => {
    if (isVerifyingRef.current || isRequestingRef.current) return;
    if (challenge === null) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);
    setFailure(null);
    try {
      const result = await sendVerify({
        challengeId: challenge.challengeId,
        code: submitted,
      });
      cacheReauthToken(result.reauthToken, result.expiresAt);
      forgetReauthChallenge();
      // A dialog already closing must not close the one opened after it.
      if (!isActiveRef.current) return;
      // A caller with `onConfirmed` shows its own outcome; every other caller
      // waits for the member to press its button again, and the toast says so.
      if (onConfirmed) onConfirmed();
      else showToast(t("settings:reauth.dialog.confirmed"), "success");
      // Closing leaves the checking state on while the dialog plays its exit.
      onClose();
    } catch (error) {
      isVerifyingRef.current = false;
      setIsVerifying(false);
      const next = asFieldFailure(readEmailCodeFailure(error));
      setFailure(next);
      if (hasReason(next, UNUSABLE_CODE_REASONS)) setCode("");
      if (hasReason(next, DEAD_CHALLENGE_REASONS)) forgetReauthChallenge();
    }
  };

  useEffect(() => {
    isActiveRef.current = isPresent;
    return () => {
      isActiveRef.current = false;
    };
  }, [isPresent]);

  // One code per open, and none when a kept code is still on its way.
  // StrictMode runs this effect twice on the same component, and the ref
  // keeps the second run from asking again (which would only come back
  // `resend_too_soon`).
  useEffect(() => {
    if (hasRequestedOnOpenRef.current) return;
    hasRequestedOnOpenRef.current = true;
    if (challenge !== null) return;
    // Sending the email is the external effect; the busy flag it sets is
    // what the dialog shows while it is on its way.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void requestCode();
    // Runs once per dialog: each open mounts a fresh dialog keyed on its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sentTo: challenge?.email ?? null,
    code,
    setCode,
    failure,
    isRequesting,
    isVerifying,
    hasResent,
    resendAvailableAt: challenge?.resendAvailableAt ?? null,
    retryAvailableAt: retryTimeOf(failure),
    isDemo: demoMode,
    requestCode,
    verifyCode,
  };
}
