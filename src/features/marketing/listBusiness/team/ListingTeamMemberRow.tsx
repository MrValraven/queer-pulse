import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingTeamManagerRowView } from "../api/listingTeam.types";
import { ListingTeamRowIdentity } from "./ListingTeamPendingRow";
import { listingTeamRowSubject } from "./listingTeamSection.data";
import { ListingTeamRoleLabelField } from "./ListingTeamRoleLabelField";
import { ListingTeamRowError } from "./ListingTeamRowError";
import styles from "./ListingTeam.module.css";

/** Same curve as the shared `Collapse`, so a moved row glides like a fold. */
const GLIDE_EASE = [0.22, 0.68, 0.16, 1] as const;

export type ListingTeamMoveDirection = "up" | "down";

interface ListingTeamMemberRowProps {
  row: ListingTeamManagerRowView;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  /** True only while this row's own answer is in flight. */
  isRowBusy?: boolean;
  errorMessage?: string;
  /** The row whose arrow was pressed: it covers the row it passes. */
  isRaised?: boolean;
  /** Set right after this row moved: its arrow for that direction takes focus. */
  focusMoveDirection?: ListingTeamMoveDirection | null;
  /** Called once that arrow has focus. */
  onMoveFocused?: () => void;
  onMove: (direction: ListingTeamMoveDirection) => void;
  /** Resolves true once the role is saved, which closes the editor. */
  onSaveRole: (roleLabel: string) => Promise<boolean>;
  onRemove: () => void;
}

/**
 * One team entry on the page, persona or member: order arrows, an inline role
 * editor and Remove.
 */
export function ListingTeamMemberRow({
  row,
  isFirst,
  isLast,
  isBusy,
  isRowBusy = false,
  errorMessage,
  isRaised = false,
  focusMoveDirection = null,
  onMoveFocused,
  onMove,
  onSaveRole,
  onRemove,
}: ListingTeamMemberRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isEditing, setIsEditing] = useState(false);
  const [roleDraft, setRoleDraft] = useState(row.roleLabel ?? "");
  const [isGliding, setIsGliding] = useState(false);
  const name = listingTeamRowSubject(row, t).labelName;
  const shouldRestoreFocus = useRef(false);
  const moveUpRef = useRef<HTMLButtonElement>(null);
  const moveDownRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!focusMoveDirection) return;
    const arrow = focusMoveDirection === "up" ? moveUpRef : moveDownRef;
    arrow.current?.focus();
    onMoveFocused?.();
  }, [focusMoveDirection, onMoveFocused]);

  // The Edit role button mounts again as the editor closes; it takes focus
  // back once, from its ref callback.
  const restoreEditFocus = (node: HTMLButtonElement | null) => {
    if (!node || !shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    node.focus();
  };
  const openEditor = () => {
    setRoleDraft(row.roleLabel ?? "");
    setIsEditing(true);
  };
  const closeEditor = () => {
    shouldRestoreFocus.current = true;
    setIsEditing(false);
  };
  const cancelEdit = () => {
    setRoleDraft(row.roleLabel ?? "");
    closeEditor();
  };
  const saveRole = async () => {
    if (isBusy) return;
    if (await onSaveRole(roleDraft)) closeEditor();
  };
  const moveButton = (direction: ListingTeamMoveDirection) => {
    const isEdge = direction === "up" ? isFirst : isLast;
    const key = direction === "up" ? "moveUpAria" : "moveDownAria";
    return (
      <IconButton
        ref={direction === "up" ? moveUpRef : moveDownRef}
        size="sm"
        aria-label={t(`marketing:listBusiness.team.${key}`, { name })}
        aria-disabled={isEdge || isBusy}
        onClick={() => {
          if (!isEdge && !isBusy) onMove(direction);
        }}
      >
        {direction === "up" ? (
          <FiArrowUp aria-hidden />
        ) : (
          <FiArrowDown aria-hidden />
        )}
      </IconButton>
    );
  };

  return (
    <CollapseListItem>
      <m.div
        layout="position"
        className={
          isRaised && isGliding
            ? `${styles.row} ${styles.rowRaised}`
            : styles.row
        }
        transition={{
          layout: { duration: reducedMotion ? 0 : 0.28, ease: GLIDE_EASE },
        }}
        onLayoutAnimationStart={() => setIsGliding(true)}
        onLayoutAnimationComplete={() => setIsGliding(false)}
      >
        <ListingTeamRowIdentity row={row} isRoleShown />
        <Collapse isOpen={!isEditing} className={styles.actionsPanel}>
          <div className={styles.actions}>
            {moveButton("up")}
            {moveButton("down")}
            <Button
              ref={restoreEditFocus}
              size="sm"
              variant="ghost"
              aria-label={t("marketing:listBusiness.team.editRoleAria", {
                name,
              })}
              onClick={openEditor}
            >
              {t("marketing:listBusiness.team.editRoleCta")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label={t("marketing:listBusiness.team.removeAria", { name })}
              aria-disabled={isBusy}
              onClick={() => {
                if (!isBusy) onRemove();
              }}
            >
              {t("marketing:listBusiness.team.removeCta")}
            </Button>
          </div>
        </Collapse>
        <Collapse isOpen={isEditing} className={styles.rolePanel}>
          <div className={styles.roleEditor}>
            <ListingTeamRoleLabelField
              id={`listing-team-role-${row.id}`}
              value={roleDraft}
              onChange={setRoleDraft}
              isDisabled={isRowBusy}
              shouldAutoFocus
              onSubmit={() => void saveRole()}
              onCancel={cancelEdit}
            />
            <div className={styles.actions}>
              <Button
                size="sm"
                aria-disabled={isBusy}
                onClick={() => void saveRole()}
              >
                {t("marketing:listBusiness.team.saveRoleCta")}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                {t("marketing:listBusiness.team.cancelEditCta")}
              </Button>
            </div>
          </div>
        </Collapse>
        <ListingTeamRowError errorMessage={errorMessage} />
      </m.div>
    </CollapseListItem>
  );
}
