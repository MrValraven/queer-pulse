import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { completeEmailCodeSignIn } from "../../app/providers/signInPending";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EmailCodeChallenge } from "./api/emailCode.api";
import {
  asFieldFailure,
  readEmailCodeFailure,
  type EmailCodeFieldFailure,
  type EmailCodeReason,
  type SignupFailure,
} from "./api/emailCodeFailure";
import { useRequestEmailCode, useVerifyEmailCode } from "./api/useEmailCode";

export interface EmailCodeVerifyExtras {
  invite?: string;
  ageAttested?: boolean;
  termsVersion?: string;
  firstName?: string;
  lastName?: string;
}

export interface UseEmailCodeFlowOptions {
  redirect: string;
  getVerifyExtras?: () => EmailCodeVerifyExtras;
  validateBeforeRequest?: () => EmailCodeFieldFailure | null;
  onDemoSignedIn: () => void;
}

export interface EmailCodeFlow {
  step: "email" | "code";
  email: string;
  setEmail: (value: string) => void;
  sentTo: string | null;
  code: string;
  setCode: (value: string) => void;
  fieldFailure: EmailCodeFieldFailure | null;
  signupFailure: SignupFailure | null;
  isRequesting: boolean;
  isVerifying: boolean;
  hasResent: boolean;
  /** True once the person came back from the code step to change the
   *  address, so the email field takes focus as it reappears. */
  hasReturnedToEmail: boolean;
  resendAvailableAt: string | null;
  requestCode: () => Promise<void>;
  resendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  /** Named without the `use` prefix: rules-of-hooks flags member calls. */
  switchToDifferentEmail: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The reasons that leave the typed code unusable, so the boxes empty. */
const UNUSABLE_CODE_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "code_incorrect",
  "code_expired",
  "code_used_up",
  "code_replaced",
  "code_already_used",
]);

/** The in-app path of an `invite_required` status link, when it points at
 *  the join-request status page; null for any other address. */
function joinRequestStatusPath(failure: SignupFailure): string | null {
  if (failure.reason !== "invite_required" || !failure.statusUrl) return null;
  try {
    const url = new URL(failure.statusUrl, window.location.origin);
    return url.pathname === routes.joinRequestStatus
      ? url.pathname + url.search
      : null;
  } catch {
    return null;
  }
}

/**
 * Email code sign-in for a routed page: ask for a code, check it, resend it,
 * and word every refusal. It navigates, so only pages under the router use it;
 * the reauth dialog has its own hook.
 */
export function useEmailCodeFlow({
  redirect,
  getVerifyExtras,
  validateBeforeRequest,
  onDemoSignedIn,
}: UseEmailCodeFlowOptions): EmailCodeFlow {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { demoMode } = useDemoMode();
  const { mutateAsync: sendCodeRequest, isPending: isRequesting } =
    useRequestEmailCode();
  const { mutateAsync: sendVerify } = useVerifyEmailCode();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<EmailCodeChallenge | null>(null);
  const [code, setCode] = useState("");
  const [fieldFailure, setFieldFailure] =
    useState<EmailCodeFieldFailure | null>(null);
  const [signupFailure, setSignupFailure] = useState<SignupFailure | null>(
    null,
  );
  const [hasResent, setHasResent] = useState(false);
  const [hasReturnedToEmail, setHasReturnedToEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Refs answer "is a call in flight" synchronously: an auto-submit on the
  // sixth digit and a paste in the same tick both read the same render.
  const isVerifyingRef = useRef(false);
  const isRequestingRef = useRef(false);

  const askForCode = async (address: string): Promise<EmailCodeChallenge> => {
    isRequestingRef.current = true;
    try {
      return await sendCodeRequest({ email: address, locale: language });
    } finally {
      isRequestingRef.current = false;
    }
  };

  const requestCode = async () => {
    if (isRequestingRef.current) return;
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      setFieldFailure({ kind: "reason", reason: "email_invalid" });
      return;
    }
    const blocked = validateBeforeRequest?.() ?? null;
    if (blocked) {
      setFieldFailure(blocked);
      return;
    }
    try {
      const next = await askForCode(normalized);
      setSentTo(normalized);
      setChallenge(next);
      setStep("code");
      setCode("");
      setFieldFailure(null);
      setSignupFailure(null);
      setHasResent(false);
      setHasReturnedToEmail(false);
    } catch (error) {
      setFieldFailure(asFieldFailure(readEmailCodeFailure(error)));
    }
  };

  const resendCode = async () => {
    // A verify in flight could still land its refusal on the new code.
    if (isVerifyingRef.current || isRequestingRef.current || sentTo === null) {
      return;
    }
    try {
      const next = await askForCode(sentTo);
      setChallenge(next);
      setCode("");
      setFieldFailure(null);
      setSignupFailure(null);
      setHasResent(true);
    } catch (error) {
      setFieldFailure(asFieldFailure(readEmailCodeFailure(error)));
    }
  };

  const verifyCode = async (submitted: string) => {
    if (isVerifyingRef.current || challenge === null) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);
    setFieldFailure(null);
    setSignupFailure(null);
    try {
      const result = await sendVerify({
        challengeId: challenge.challengeId,
        code: submitted,
        redirect,
        ...getVerifyExtras?.(),
      });
      // Success leaves the page, so the checking state stays on.
      if (demoMode) onDemoSignedIn();
      else completeEmailCodeSignIn(result.redirectTo);
    } catch (error) {
      isVerifyingRef.current = false;
      setIsVerifying(false);
      const failure = readEmailCodeFailure(error);
      if (failure.kind === "signup") {
        const statusPath = joinRequestStatusPath(failure);
        if (statusPath) {
          void navigate(statusPath);
          return;
        }
        // A correct code stays valid after a signup refusal, so the person
        // can fix the field and check the same code again.
        setSignupFailure(failure);
        return;
      }
      setFieldFailure(failure);
      if (
        failure.kind === "reason" &&
        UNUSABLE_CODE_REASONS.has(failure.reason)
      ) {
        setCode("");
      }
    }
  };

  const switchToDifferentEmail = () => {
    // A late refusal from a verify in flight would land under the email field.
    if (isVerifyingRef.current) return;
    setStep("email");
    setSentTo(null);
    setChallenge(null);
    setCode("");
    setFieldFailure(null);
    setSignupFailure(null);
    setHasResent(false);
    setHasReturnedToEmail(true);
  };

  return {
    step,
    email,
    setEmail,
    sentTo,
    code,
    setCode,
    fieldFailure,
    signupFailure,
    isRequesting,
    isVerifying,
    hasResent,
    hasReturnedToEmail,
    resendAvailableAt: challenge?.resendAvailableAt ?? null,
    requestCode,
    resendCode,
    verifyCode,
    switchToDifferentEmail,
  };
}
