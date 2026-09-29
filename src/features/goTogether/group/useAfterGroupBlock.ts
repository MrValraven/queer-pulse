import { useEffect, useRef, type RefObject } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFocusHeadingAfterStateChange } from "../card/goTogetherCardFocus";
import type { GoTogetherGroupMemberDTO } from "../api/goTogether.types";
import type { useGoTogetherGroup } from "../api/useGoTogetherGroup";
import {
  isGroupNotFoundError,
  type GroupBlockTiming,
} from "./groupActionHelpers";

/** How long to wait before one more read of the group when the first read
 *  after a block still seats the blocker. The block route normally answers
 *  once the move has landed, so this is a rare fallback. */
const BLOCK_SETTLE_RETRY_MS = 1000;

type GroupRefetch = ReturnType<typeof useGoTogetherGroup>["refetch"];

/**
 * What the sheet does once a block succeeds. A block moves the blocker
 * (except more than 12 hours after the start), and reading the group again
 * tells whether it did: a 404 means they are no longer in it, so the sheet
 * closes with a short note and the card (already invalidated by the block)
 * shows what's next. Otherwise the blocked member's row drops out, and focus
 * goes to the members heading so it does not fall to the page.
 */
export function useAfterGroupBlock(
  refetch: GroupRefetch,
  membersHeadingRef: RefObject<HTMLHeadingElement | null>,
  onClose: () => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const focusHeadingAfterStateChange = useFocusHeadingAfterStateChange();
  // Cancels a pending retry wait. On unmount the timer is cleared and the
  // wait resolves `false`, so nothing reads the group or toasts for a sheet
  // that is gone (it unmounts when the card's state swaps after a move, or
  // when the member closes it).
  const cancelRetryWaitRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelRetryWaitRef.current?.(), []);

  const waitBeforeRetry = () =>
    new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        cancelRetryWaitRef.current = null;
        resolve(true);
      }, BLOCK_SETTLE_RETRY_MS);
      cancelRetryWaitRef.current = () => {
        clearTimeout(timeoutId);
        cancelRetryWaitRef.current = null;
        resolve(false);
      };
    });

  return (member: GoTogetherGroupMemberDTO, timing: GroupBlockTiming) => {
    const isMoveExpected = timing !== "late";
    // Asked at once, as the leave flow does: the block has already
    // invalidated the card, whose state can swap (and unmount this sheet)
    // before the group read below comes back.
    if (isMoveExpected) focusHeadingAfterStateChange();
    const settle = async () => {
      let result = await refetch();
      if (isMoveExpected && !result.error) {
        const shouldRetry = await waitBeforeRetry();
        if (!shouldRetry) return;
        result = await refetch();
      }
      const name = member.firstName;
      if (isGroupNotFoundError(result.error)) {
        showToast(t("goTogether:group.block.movedToast", { name }), "success");
        onClose();
        return;
      }
      showToast(t("goTogether:group.block.doneToast", { name }), "success");
      const isMemberStillListed = Boolean(
        result.data?.members.some(
          (listedMember) => listedMember.memberRef === member.memberRef,
        ),
      );
      if (!isMemberStillListed) membersHeadingRef.current?.focus();
    };
    void settle();
  };
}
