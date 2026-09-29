import { useId, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFocusHeadingAfterStateChange } from "../card/goTogetherCardFocus";
import type { GoTogetherGroupDTO } from "../api/goTogether.types";
import { useLeaveGoTogetherGroup } from "../api/useGoTogetherGroup";
import { groupErrorKey } from "./groupActionHelpers";
import styles from "./GoTogetherGroup.module.css";

/**
 * Leave, on its own row away from the chat and share-plans actions: a
 * destructive choice should not share their visual weight (design N2).
 *
 * Before the gathering starts it reads "Leave group" and takes the member
 * out of the group. From the start (`isLeaveChatOnly`) it reads "Leave the
 * chat": only the chat seat ends, and the member stays in the group, on the
 * meet-again page and keeps their reveal (PRD-418). The caller hides it once
 * `hasLeftChat` is true, and from the start when the group has no chat.
 */
export function GoTogetherGroupLeaveAction({
  group,
  onLeft,
}: {
  group: GoTogetherGroupDTO;
  onLeft: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const leave = useLeaveGoTogetherGroup(group.id);
  const focusHeadingAfterStateChange = useFocusHeadingAfterStateChange();
  const [isConfirming, setIsConfirming] = useState(false);
  const hintId = useId();
  const isChatOnly = group.isLeaveChatOnly;
  const copyKey = isChatOnly ? "leaveChat" : "leave";

  const confirmLeave = () =>
    leave.mutate(undefined, {
      onSuccess: () => {
        setIsConfirming(false);
        if (isChatOnly) {
          // The member stays in the group, so the card keeps its state and
          // there is no heading to move focus to: the toast says what
          // changed.
          showToast(t("goTogether:group.leaveChat.done"), "success");
        } else {
          // The entry (and this sheet) unmount once the card's state swaps
          // away from grouped: without this, focus would drop to the page
          // body. The card ignores the request if the swap never happens
          // (e.g. this sheet was opened from a chat).
          focusHeadingAfterStateChange();
        }
        onLeft();
      },
    });

  return (
    <div className={styles.leaveRow}>
      {isChatOnly && (
        <p id={hintId} className={`${styles.quietNote} ${styles.leaveHint}`}>
          {t("goTogether:group.leaveChat.hint")}
        </p>
      )}
      <Button
        variant="ghost"
        className={styles.leaveButton}
        aria-describedby={isChatOnly ? hintId : undefined}
        onClick={() => setIsConfirming(true)}
      >
        <FiLogOut aria-hidden="true" />{" "}
        {t(
          isChatOnly
            ? "goTogether:group.leaveChat.label"
            : "goTogether:group.leave",
        )}
      </Button>
      {isConfirming && (
        <ConfirmDialog
          open
          tone="destructive"
          loading={leave.isPending}
          title={t(`goTogether:group.${copyKey}Confirm.title`)}
          description={t(`goTogether:group.${copyKey}Confirm.description`)}
          confirmLabel={t(`goTogether:group.${copyKey}Confirm.confirm`)}
          onClose={() => setIsConfirming(false)}
          onConfirm={confirmLeave}
        >
          {leave.isError && (
            <p className={styles.errorNote} role="alert">
              {t(groupErrorKey(leave.error))}
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
