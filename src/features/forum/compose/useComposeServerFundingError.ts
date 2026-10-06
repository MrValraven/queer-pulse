import { useCallback, useState } from "react";
import type { FundingErrorCode } from "../funding/funding.types";
import { FUNDING_ERROR_TARGET } from "../funding/fundingErrors";

interface RefusalSnapshot {
  /** The code this snapshot was taken for. */
  serverCode: FundingErrorCode | null;
  /** The link the server refused, so an edited link drops a stale refusal. */
  refusedLinkUrl: string;
  /** The member verified their phone here after a verification refusal. */
  hasVerifiedHere: boolean;
}

export interface ComposeServerFundingError {
  /** The server's last funding refusal, minus what the member has since
   *  fixed: a link refusal once the link changes, a verification refusal
   *  once they verify here. */
  serverFundingErrorCode: FundingErrorCode | null;
  /** The member verified their phone from the gate. */
  confirmAskVerified: () => void;
}

/**
 * Keeps the composer's copy of the last publish refusal honest. A refusal
 * about the link stops applying the moment the link changes, and a
 * verification refusal stops gating once the member verifies here. A new
 * refusal from the server starts over.
 */
export function useComposeServerFundingError(
  serverCode: FundingErrorCode | null,
  linkUrl: string,
): ComposeServerFundingError {
  const [snapshot, setSnapshot] = useState<RefusalSnapshot>({
    serverCode,
    refusedLinkUrl: linkUrl,
    hasVerifiedHere: false,
  });
  const isNewRefusal = snapshot.serverCode !== serverCode;
  // A new code takes a fresh snapshot during render, the pattern React
  // documents for state that follows a prop.
  if (isNewRefusal) {
    setSnapshot({
      serverCode,
      refusedLinkUrl: linkUrl,
      hasVerifiedHere: false,
    });
  }
  const refusedLinkUrl = isNewRefusal ? linkUrl : snapshot.refusedLinkUrl;
  const hasVerifiedHere = !isNewRefusal && snapshot.hasVerifiedHere;

  let effectiveCode = serverCode;
  if (
    effectiveCode &&
    FUNDING_ERROR_TARGET[effectiveCode] === "link" &&
    linkUrl !== refusedLinkUrl
  ) {
    effectiveCode = null;
  }
  if (
    effectiveCode === "funding_ask_verification_required" &&
    hasVerifiedHere
  ) {
    effectiveCode = null;
  }

  const confirmAskVerified = useCallback(
    () => setSnapshot((current) => ({ ...current, hasVerifiedHere: true })),
    [],
  );

  return { serverFundingErrorCode: effectiveCode, confirmAskVerified };
}
