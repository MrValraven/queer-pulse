import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  FiCheckCircle,
  FiFlag,
  FiLogOut,
  FiMoreHorizontal,
  FiSlash,
} from "react-icons/fi";
import { Avatar, Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GoTogetherGroupMemberDTO } from "../api/goTogether.types";
import { GoTogetherMemberBlockDialog } from "./GoTogetherMemberBlockDialog";
import { GoTogetherMemberReportDialog } from "./GoTogetherMemberReportDialog";
import { groupBlockTiming, type GroupBlockTiming } from "./groupActionHelpers";
import { memberInitial } from "./memberInitial";
import styles from "./GoTogetherGroup.module.css";

type OpenDialog =
  { kind: "block"; timing: GroupBlockTiming } | { kind: "report" } | null;

interface GoTogetherGroupMemberRowProps {
  member: GoTogetherGroupMemberDTO;
  groupId: string;
  eventStartAt: string;
  isLeaveChatOnly: boolean;
  /** False on the caller's own row and in an ended group: no Block or
   *  Report there. */
  hasSafetyActions: boolean;
  /** The viewer's pair partner's first name, or null with no partner. */
  pairPartnerName: string | null;
  /** One row's options are open at a time, so the sheet owns which. */
  isActionsOpen: boolean;
  onOpenActionsChange: (memberRef: string | null) => void;
  onBlocked: (
    member: GoTogetherGroupMemberDTO,
    timing: GroupBlockTiming,
  ) => void;
}

/**
 * Escape and a press outside the row close the open options. Escape is
 * caught in the capture phase at the document, ahead of the sheet's own
 * Escape listener, so it closes the options (and puts focus back on their
 * toggle) and leaves the sheet open. Inactive while a Block or Report dialog
 * is up: that dialog owns Escape then.
 */
function useActionsDismiss(
  isActive: boolean,
  containerRef: RefObject<HTMLLIElement | null>,
  toggleRef: RefObject<HTMLButtonElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isActive) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
      toggleRef.current?.focus();
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    document.addEventListener("keydown", closeOnEscape, true);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeOnEscape, true);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [isActive, containerRef, toggleRef, onClose]);
}

/**
 * One member of the group: first name, pronouns and the avatar the member
 * allows, with no profile link. Every other member's row carries a quiet
 * options button that reveals Block and Report under the row (PRD-421), each
 * a full 44px button that is easy to reach with a thumb.
 */
export function GoTogetherGroupMemberRow({
  member,
  groupId,
  eventStartAt,
  isLeaveChatOnly,
  hasSafetyActions,
  pairPartnerName,
  isActionsOpen,
  onOpenActionsChange,
  onBlocked,
}: GoTogetherGroupMemberRowProps) {
  const { t } = useTranslation();
  const actionsId = useId();
  const rowRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const name = member.firstName;
  const closeActions = useCallback(
    () => onOpenActionsChange(null),
    [onOpenActionsChange],
  );
  useActionsDismiss(
    hasSafetyActions && isActionsOpen && openDialog === null,
    rowRef,
    toggleRef,
    closeActions,
  );

  return (
    <li ref={rowRef} className={styles.memberItem}>
      <div className={styles.memberRow}>
        <Avatar
          initials={memberInitial(member.firstName)}
          src={member.avatarUrl ?? undefined}
          size={40}
        />
        <span className={styles.memberText}>
          <span className={styles.memberName}>
            {member.firstName}
            {member.isYou && (
              <span className={styles.memberTag}>
                {t("goTogether:group.you")}
              </span>
            )}
            {member.isPairPartner && (
              <span className={styles.memberTag}>
                {t("goTogether:group.pairPartner")}
              </span>
            )}
          </span>
          {member.pronouns && (
            <span className={styles.memberPronouns}>{member.pronouns}</span>
          )}
        </span>
        {member.hasLeftEvent ? (
          <span className={styles.memberStatus}>
            <FiLogOut aria-hidden="true" /> {t("goTogether:group.status.left")}
          </span>
        ) : member.isHere ? (
          <span className={styles.memberStatus} data-tone="here">
            <FiCheckCircle aria-hidden="true" />{" "}
            {t("goTogether:group.status.here")}
          </span>
        ) : null}
        {hasSafetyActions && (
          <IconButton
            ref={toggleRef}
            aria-label={t("goTogether:group.member.optionsLabel", { name })}
            aria-expanded={isActionsOpen}
            aria-controls={isActionsOpen ? actionsId : undefined}
            onClick={() =>
              onOpenActionsChange(isActionsOpen ? null : member.memberRef)
            }
          >
            <FiMoreHorizontal aria-hidden="true" />
          </IconButton>
        )}
      </div>
      {hasSafetyActions && isActionsOpen && (
        <div id={actionsId} className={styles.memberActions}>
          <Button
            variant="ghost"
            onClick={() =>
              setOpenDialog({
                kind: "block",
                timing: groupBlockTiming(
                  isLeaveChatOnly,
                  eventStartAt,
                  Date.now(),
                ),
              })
            }
          >
            <FiSlash aria-hidden="true" />{" "}
            {t("goTogether:group.member.block", { name })}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpenDialog({ kind: "report" })}
          >
            <FiFlag aria-hidden="true" />{" "}
            {t("goTogether:group.member.report", { name })}
          </Button>
        </div>
      )}
      {openDialog?.kind === "block" && (
        <GoTogetherMemberBlockDialog
          groupId={groupId}
          member={member}
          timing={openDialog.timing}
          pairPartnerName={pairPartnerName}
          onClose={() => setOpenDialog(null)}
          onBlocked={onBlocked}
        />
      )}
      {openDialog?.kind === "report" && (
        <GoTogetherMemberReportDialog
          groupId={groupId}
          member={member}
          onClose={() => setOpenDialog(null)}
        />
      )}
    </li>
  );
}
