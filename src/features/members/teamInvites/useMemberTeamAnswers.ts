import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingTeamMemberLinkRowView } from "../../marketing/listBusiness/api/listingTeam.types";
import { listingTeamErrorCopy } from "../../marketing/listBusiness/team/listingTeamErrors.data";

const TOAST_KEY_PREFIX = "members:places.teamInvites.toast.";

/**
 * Runs one answer at a time for the member's own team links. A refusal lands
 * under the row it came from (worded for the member side, so a profile that is
 * not open names that cause), a success shows a toast, and the leave dialog
 * stays open (loading) until its own answer settles.
 */
export function useMemberTeamAnswers(): {
  busyLinkId: string | null;
  errorByLinkId: Record<string, string>;
  leaveTarget: ListingTeamMemberLinkRowView | null;
  setLeaveTarget: (row: ListingTeamMemberLinkRowView | null) => void;
  /** Resolves true when the answer went through. */
  answer: (
    linkId: string,
    send: () => Promise<unknown>,
    toastKey: string,
  ) => Promise<boolean>;
} {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null);
  const [errorByLinkId, setErrorByLinkId] = useState<Record<string, string>>(
    {},
  );
  const [leaveTarget, setLeaveTarget] =
    useState<ListingTeamMemberLinkRowView | null>(null);

  const answer = async (
    linkId: string,
    send: () => Promise<unknown>,
    toastKey: string,
  ): Promise<boolean> => {
    if (busyLinkId !== null) return false;
    setBusyLinkId(linkId);
    setErrorByLinkId((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([rowId]) => rowId !== linkId),
      ),
    );
    try {
      await send();
      showToast(t(`${TOAST_KEY_PREFIX}${toastKey}`));
      return true;
    } catch (error) {
      const { messageKey, values } = listingTeamErrorCopy(
        error,
        "member",
        format,
      );
      setErrorByLinkId((current) => ({
        ...current,
        [linkId]: t(messageKey, values),
      }));
      return false;
    } finally {
      setBusyLinkId(null);
      // Only the answer that belongs to the open dialog closes it.
      setLeaveTarget((current) => (current?.id === linkId ? null : current));
    }
  };

  return { busyLinkId, errorByLinkId, leaveTarget, setLeaveTarget, answer };
}
