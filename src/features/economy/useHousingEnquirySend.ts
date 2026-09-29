import { createElement, useState, type ReactElement } from "react";
import { ApiError } from "../../shared/api/client";
import { isAccountRestricted, reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { messageRequestErrorKey } from "../messages/api/firstContactError";
import { StepUpVerificationModal } from "./StepUpVerificationModal";
import { useSendHousingEnquiry } from "./api/useSendHousingEnquiry";
import {
  verificationRequiredFrom,
  type VerificationLevel,
} from "./api/verification.api";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";

/** Nest's throttler answers with its exception name, which is not copy. */
function isThrottlerNoise(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.message.trim().startsWith("ThrottlerException")
  );
}

interface HousingEnquirySendState {
  send: (body: string) => void;
  isPending: boolean;
  /** Inline refusal for the composer, or null. */
  errorMessage: string | null;
  isSent: boolean;
  /** The thread the enquiry landed in; null in demo and without a ref. */
  sentConversationId: string | null;
  /** The pledge or phone step-up prompt to render in place of the composer
   *  while a gate is open, or null. Accepting either retries the same body. */
  gate: ReactElement | null;
}

/**
 * The housing enquiry's send and every way it can be refused, kept out of
 * `HousingEnquiryModal` so the modal stays a thin door onto the shared
 * composer.
 *
 * The mutation is `silentError`, so each refusal is said once, here:
 * - the affirming pledge and the phone step-up (`createEnquiry`'s two gates)
 *   open their own prompts and retry the send once passed;
 * - a coded first-contact refusal (a paused account) gets its shared copy;
 * - a restricted account gets the shared appeal copy;
 * - any other 4xx with a real sentence (own listing, no lister left) repeats
 *   the backend's words, as the directory door does;
 * - everything else gets the housing generic.
 */
export function useHousingEnquirySend(
  listingRef: string | null,
  recipientName: string,
): HousingEnquirySendState {
  const { t } = useTranslation();
  const sendEnquiry = useSendHousingEnquiry();
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const [stepUp, setStepUp] = useState<{
    level: VerificationLevel;
    body: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [sentConversationId, setSentConversationId] = useState<string | null>(
    null,
  );

  function refusalMessage(error: unknown): string {
    const firstContactKey = messageRequestErrorKey(error);
    if (firstContactKey) return t(firstContactKey, { name: recipientName });
    if (isAccountRestricted(error)) {
      return t("shared:apiError.accountRestricted");
    }
    const serverReason = isThrottlerNoise(error) ? null : reasonFor(error);
    return serverReason ?? t("economy:housingModal.message.error");
  }

  function send(body: string) {
    if (sendEnquiry.isPending) return;
    setErrorMessage(null);
    sendEnquiry.mutate(
      { ref: listingRef, body },
      {
        onSuccess: (result) => {
          setSentConversationId(result?.conversationId ?? null);
          setIsSent(true);
        },
        onError: (error) => {
          if (handlePledgeError(error, () => send(body))) return;
          const requiredLevel = verificationRequiredFrom(error);
          if (requiredLevel) {
            setStepUp({ level: requiredLevel, body });
            return;
          }
          // Inline, where they are looking, with the draft left in place.
          setErrorMessage(refusalMessage(error));
        },
      },
    );
  }

  const stepUpGate = stepUp
    ? createElement(StepUpVerificationModal, {
        requiredLevel: stepUp.level,
        onVerified: () => {
          const retryBody = stepUp.body;
          setStepUp(null);
          send(retryBody);
        },
        onClose: () => setStepUp(null),
      })
    : null;

  return {
    send,
    isPending: sendEnquiry.isPending,
    errorMessage,
    isSent,
    sentConversationId,
    gate: pledgeGate ?? stepUpGate,
  };
}
