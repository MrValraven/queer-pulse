import { useState } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { listingTeamErrorCopy } from "./listingTeamErrors.data";

const TOAST_KEY_PREFIX = "marketing:listBusiness.team.toast.";

/**
 * Runs one answer at a time for a listing's team. A refusal lands under the
 * row it came from and a success shows a toast. The mutation hooks refresh the
 * team after a refusal that proves the list stale.
 */
export function useListingTeamAnswers(): {
  busyMemberId: string | null;
  errorByMemberId: Record<string, string>;
  /** Resolves true when the answer went through. */
  answer: (
    memberId: string,
    send: () => Promise<unknown>,
    toastKey?: string,
  ) => Promise<boolean>;
} {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [errorByMemberId, setErrorByMemberId] = useState<
    Record<string, string>
  >({});

  const answer = async (
    memberId: string,
    send: () => Promise<unknown>,
    toastKey?: string,
  ): Promise<boolean> => {
    setBusyMemberId(memberId);
    setErrorByMemberId((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([rowId]) => rowId !== memberId),
      ),
    );
    try {
      await send();
      if (toastKey) showToast(t(`${TOAST_KEY_PREFIX}${toastKey}`));
      return true;
    } catch (error) {
      const { messageKey, values } = listingTeamErrorCopy(
        error,
        "listing",
        format,
      );
      setErrorByMemberId((current) => ({
        ...current,
        [memberId]: t(messageKey, values),
      }));
      return false;
    } finally {
      setBusyMemberId(null);
    }
  };

  return { busyMemberId, errorByMemberId, answer };
}
