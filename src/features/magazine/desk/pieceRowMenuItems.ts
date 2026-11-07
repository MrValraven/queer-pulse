import type { IconType } from "react-icons";
import {
  FiBell,
  FiBookOpen,
  FiClipboard,
  FiEdit2,
  FiFileText,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";

/** One row of a `PieceRowMenu`. `danger` renders the item in the danger tone;
 *  `hasSeparatorBefore` draws a rule above it, so a destructive item sits
 *  apart from the everyday ones. */
export interface PieceRowMenuItem {
  key: string;
  label: string;
  icon: IconType;
  danger?: boolean;
  hasSeparatorBefore?: boolean;
  onSelect: () => void;
}

export interface PieceRowMenuActions {
  onEdit: () => void;
  onChase: () => void;
  onHandoff: () => void;
  onAssignIssue: () => void;
  onDelete: () => void;
  /** Takes a live piece off the site and puts it at Draft. Omitted, the
   *  unpublish items are left out. */
  onUnpublishToDraft?: () => void;
  /** The same, landing at In review. */
  onUnpublishToReview?: () => void;
}

export interface BuildPieceRowMenuItemsOptions extends PieceRowMenuActions {
  translate: (key: string) => string;
  /** With no issue at all there is nothing to file to, so the item is left out. */
  hasAnyIssue: boolean;
  /** `magazine:desk.reassign.moveIssue` or `.addToIssue`, decided by the row. */
  assignLabelKey: string;
  /** Only a published row offers the unpublish items. */
  isPublished?: boolean;
}

/**
 * Everything a row can do besides its one next action, in the order an editor
 * reaches for it. A published row gains "Unpublish to draft" and "Unpublish to
 * review" after Hand off. Delete comes last, behind a rule, so removing a
 * piece is always a deliberate second step.
 */
export function buildPieceRowMenuItems({
  translate,
  hasAnyIssue,
  assignLabelKey,
  isPublished = false,
  onEdit,
  onChase,
  onHandoff,
  onAssignIssue,
  onDelete,
  onUnpublishToDraft,
  onUnpublishToReview,
}: BuildPieceRowMenuItemsOptions): PieceRowMenuItem[] {
  const items: PieceRowMenuItem[] = [
    {
      key: "edit",
      label: translate("magazine:desk.pieceRow.edit"),
      icon: FiEdit2,
      onSelect: onEdit,
    },
    {
      key: "chase",
      label: translate("magazine:desk.pieceRow.chase"),
      icon: FiBell,
      onSelect: onChase,
    },
    {
      key: "handoff",
      label: translate("magazine:desk.pieceRow.handOff"),
      icon: FiUserCheck,
      onSelect: onHandoff,
    },
  ];
  if (isPublished && onUnpublishToDraft) {
    items.push({
      key: "unpublish-draft",
      label: translate("magazine:desk.pieceRow.unpublishToDraft"),
      icon: FiFileText,
      onSelect: onUnpublishToDraft,
    });
  }
  if (isPublished && onUnpublishToReview) {
    items.push({
      key: "unpublish-review",
      label: translate("magazine:desk.pieceRow.unpublishToReview"),
      icon: FiClipboard,
      onSelect: onUnpublishToReview,
    });
  }
  if (hasAnyIssue) {
    items.push({
      key: "assign-issue",
      label: translate(assignLabelKey),
      icon: FiBookOpen,
      onSelect: onAssignIssue,
    });
  }
  items.push({
    key: "delete",
    label: translate("magazine:desk.pieceRow.delete"),
    icon: FiTrash2,
    danger: true,
    hasSeparatorBefore: true,
    onSelect: onDelete,
  });
  return items;
}
