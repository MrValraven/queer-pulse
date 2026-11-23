import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EmailCodeChallenge } from "./api/emailCode.api";
import {
  readEmailCodeFailure,
  type EmailCodeFieldFailure,
  type EmailCodeReason,
} from "./api/emailCodeFailure";
import { isDuplicateJoinRequest, isUnder18Error } from "./api/joinRequest.api";
import {
  useCreateJoinRequest,
  type JoinRequestVars,
} from "./api/useCreateJoinRequest";
import { useRequestJoinRequestCode } from "./api/useRequestJoinRequestCode";
import { requestInviteErrorCopy } from "./authActionErrors";
import type { RequestInviteOutcome } from "./RequestInviteForm";

/** The form fields, without the code that confirms the address. */
export type RequestInviteFormVars = Omit<
  JoinRequestVars,
  "challengeId" | "code"
>;

/** The reasons that leave the typed code unusable, so the boxes empty. */
const UNUSABLE_CODE_REASONS: ReadonlySet<EmailCodeReason> = new Set([
  "code_incorrect",
  "code_expired",
  "code_used_up",
  "code_replaced",
  "code_already_used",
]);

type ReasonFailure = Extract<EmailCodeFieldFailure, { kind: "reason" }>;

export interface UseRequestInviteCodeOptions {
  /** The form as it stands when the code is checked. */
  getFormVars: () => RequestInviteFormVars;
  onSent: (outcome: RequestInviteOutcome, statusToken: string | null) => void;
  onUnder18: () => void;
}

export interface RequestInviteCode {
  /** The address the code went to; null while the form is showing. */
  sentTo: string | null;
  code: string;
  setCode: (value: string) => void;
  /** A refusal of the code request, shown under the form's button. */
  requestFailure: ReasonFailure | null;
  /** A refusal of the typed code, shown under the boxes. */
  codeFailure: ReasonFailure | null;
  isRequesting: boolean;
  isVerifying: boolean;
  hasResent: boolean;
  resendAvailableAt: string | null;
  requestCode: (email: string) => Promise<void>;
  resendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  /** Back to the filled-in form to change the address. */
  returnToForm: () => void;
  /** True once the applicant came back from the code step to change the
   *  address, so the email field takes focus as the form reappears. */
  hasReturnedToForm: boolean;
  /** Spends that focus request, so a later remount of the form (back from
   *  the under-18 pause) leaves focus where it lands. */
  clearReturnedToForm: () => void;
}

/**
 * SEC-10: the applicant confirms the address with a 6-digit email code
 * before the request is filed. Email-code refusals are worded inline through
 * `JoinRequestCodeErrorText`, which gives the join flow its own lines where
 * the sign-in ones would mislead (codes switched off, a spent code, a busy
 * network); the join-request refusals (requests paused, the 30-day
 * cooldown, rejected details, the filing throttle, a lost connection) are toasted
 * through `requestInviteErrorCopy`, as the form did before the code step. A
 * 409 is a confirmation, and `UNDER_18` hands over to the pause screen.
 */
export function useRequestInviteCode({
  getFormVars,
  onSent,
  onUnder18,
}: UseRequestInviteCodeOptions): RequestInviteCode {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { mutateAsync: sendCodeRequest, isPending: isRequesting } =
    useRequestJoinRequestCode();
  const { mutateAsync: fileJoinRequest } = useCreateJoinRequest();

  const [sentTo, setSentTo] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<EmailCodeChallenge | null>(null);
  const [code, setCode] = useState("");
  const [requestFailure, setRequestFailure] = useState<ReasonFailure | null>(
    null,
  );
  const [codeFailure, setCodeFailure] = useState<ReasonFailure | null>(null);
  const [hasResent, setHasResent] = useState(false);
  const [hasReturnedToForm, setHasReturnedToForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Refs answer "is a call in flight" synchronously: an auto-submit on the
  // sixth digit and a paste in the same tick both read the same render.
  const isVerifyingRef = useRef(false);
  const isRequestingRef = useRef(false);

  /** The email-code refusal in an error, or null after toasting any other. */
  const reasonOrToast = (error: unknown): ReasonFailure | null => {
    const failure = readEmailCodeFailure(error);
    if (failure.kind === "reason") return failure;
    const cause = requestInviteErrorCopy(error);
    showToast(t(cause.key, cause.values), "error");
    return null;
  };

  const askForCode = async (address: string): Promise<EmailCodeChallenge> => {
    isRequestingRef.current = true;
    try {
      return await sendCodeRequest({ email: address, locale: language });
    } finally {
      isRequestingRef.current = false;
    }
  };

  const requestCode = async (email: string) => {
    if (isRequestingRef.current) return;
    const address = email.trim().toLowerCase();
    setRequestFailure(null);
    try {
      const next = await askForCode(address);
      setChallenge(next);
      setSentTo(address);
      setCode("");
      setCodeFailure(null);
      setHasResent(false);
      setHasReturnedToForm(false);
    } catch (error) {
      setRequestFailure(reasonOrToast(error));
    }
  };

  const resendCode = async () => {
    // A check in flight could still land its refusal on the new code.
    if (isVerifyingRef.current || isRequestingRef.current || !sentTo) return;
    try {
      const next = await askForCode(sentTo);
      setChallenge(next);
      setCode("");
      setCodeFailure(null);
      setHasResent(true);
    } catch (error) {
      setCodeFailure(reasonOrToast(error));
    }
  };

  const verifyCode = async (typed: string) => {
    if (isVerifyingRef.current || challenge === null) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);
    setCodeFailure(null);
    try {
      const created = await fileJoinRequest({
        ...getFormVars(),
        challengeId: challenge.challengeId,
        code: typed,
      });
      onSent("sent", created.statusToken);
    } catch (error) {
      // 409: they already asked. That is a confirmation; no new row means no
      // new token, so the screen renders without a reference code.
      if (isDuplicateJoinRequest(error)) {
        onSent("already", null);
        return;
      }
      if (isUnder18Error(error)) {
        setHasReturnedToForm(false);
        onUnder18();
        return;
      }
      const failure = reasonOrToast(error);
      setCodeFailure(failure);
      if (failure && UNUSABLE_CODE_REASONS.has(failure.reason)) setCode("");
    } finally {
      isVerifyingRef.current = false;
      setIsVerifying(false);
    }
  };

  const returnToForm = () => {
    // A late refusal from a check in flight would land on the form.
    if (isVerifyingRef.current) return;
    setSentTo(null);
    setChallenge(null);
    setCode("");
    setCodeFailure(null);
    setHasResent(false);
    setHasReturnedToForm(true);
  };

  return {
    sentTo,
    code,
    setCode,
    requestFailure,
    codeFailure,
    isRequesting,
    isVerifying,
    hasResent,
    resendAvailableAt: challenge?.resendAvailableAt ?? null,
    requestCode,
    resendCode,
    verifyCode,
    returnToForm,
    hasReturnedToForm,
    clearReturnedToForm: () => setHasReturnedToForm(false),
  };
}
