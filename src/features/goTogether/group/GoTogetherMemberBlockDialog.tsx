import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GoTogetherGroupMemberDTO } from "../api/goTogether.types";
import { useBlockGoTogetherGroupMember } from "../api/useGoTogetherGroupSafety";
import {
  memberActionErrorKey,
  type GroupBlockTiming,
} from "./groupActionHelpers";
import styles from "./GoTogetherGroup.module.css";

/**
 * Block one group member (PRD-421). The confirm says plainly what happens:
 * the person pressing Block is the one who moves out of this group, and the
 * blocked member is not told why (design safety summary). The wording follows
 * `timing`, which the row works out when the dialog opens. A member who came
 * with a friend also hears what happens to the friend and their pair link.
 */
export function GoTogetherMemberBlockDialog({
  groupId,
  member,
  timing,
  pairPartnerName,
  onClose,
  onBlocked,
}: {
  groupId: string;
  member: GoTogetherGroupMemberDTO;
  timing: GroupBlockTiming;
  /** The viewer's pair partner's first name, or null with no partner. */
  pairPartnerName: string | null;
  onClose: () => void;
  onBlocked: (
    member: GoTogetherGroupMemberDTO,
    timing: GroupBlockTiming,
  ) => void;
}) {
  const { t } = useTranslation();
  const block = useBlockGoTogetherGroupMember(groupId);
  const name = member.firstName;
  const pairNote = pairNoteKey(timing, member.isPairPartner, pairPartnerName);

  return (
    <ConfirmDialog
      open
      tone="destructive"
      // Enter on open lands on Cancel, so a stray key press never blocks.
      initialFocus="cancel"
      loading={block.isPending}
      title={t("goTogether:group.block.title", { name })}
      description={t(`goTogether:group.block.description.${timing}`, { name })}
      confirmLabel={t("goTogether:group.block.confirm")}
      onClose={onClose}
      onConfirm={() =>
        block.mutate(member.memberRef, {
          onSuccess: () => {
            onClose();
            onBlocked(member, timing);
          },
        })
      }
    >
      <div className={styles.dialogNotes}>
        <p className={styles.dialogNoteStrong}>
          {t("goTogether:group.block.everywhere", { name })}
        </p>
        {pairNote && (
          <p className={styles.dialogNoteStrong}>
            {t(pairNote, { name, partner: pairPartnerName ?? name })}
          </p>
        )}
        {block.isError && (
          <p className={styles.errorNote} role="alert">
            {t(memberActionErrorKey(block.error))}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}

/**
 * What the block does to a pair (the backend's `moveAfterBlock`): before the
 * start an accepted partner moves with the blocker, after the start the pair
 * link ends and the partner keeps their seat, and blocking the partner
 * themselves ends the pair. More than 12 hours after the start nothing moves.
 */
function pairNoteKey(
  timing: GroupBlockTiming,
  isBlockingPartner: boolean,
  pairPartnerName: string | null,
): string | null {
  if (timing === "late") return null;
  if (isBlockingPartner) return "goTogether:group.block.pairBlocked";
  if (!pairPartnerName) return null;
  return timing === "beforeStart"
    ? "goTogether:group.block.pairMoves"
    : "goTogether:group.block.pairEnds";
}
