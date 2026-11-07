import type { IconType } from "react-icons";
import {
  FiBell,
  FiBookOpen,
  FiEdit2,
  FiEyeOff,
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
  /** Raises the unpublish confirm, where the editor picks Draft or In
   *  review. Omitted, the Unpublish item is left out. */
  onUnpublish?: () => void;
}

export interface BuildPieceRowMenuItemsOptions extends PieceRowMenuActions {
  translate: (key: string) => string;
  /** With no issue at all there is nothing to file to, so the item is left out. */
  hasAnyIssue: boolean;
  /** `magazine:desk.reassign.moveIssue` or `.addToIssue`, decided by the row. */
  assignLabelKey: string;
  /** Only a published row offers the Unpublish item. */
  isPublished?: boolean;
}

/**
 * Everything a row can do besides its one next action, in the order an editor
 * reaches for it: the everyday actions, then on a published row "Unpublish…"
 * behind its own rule, then Delete behind another, so taking a piece down and
 * removing it are each a deliberate second step.
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
  onUnpublish,
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
  if (hasAnyIssue) {
    items.push({
      key: "assign-issue",
      label: translate(assignLabelKey),
      icon: FiBookOpen,
      onSelect: onAssignIssue,
    });
  }
  if (isPublished && onUnpublish) {
    items.push({
      key: "unpublish",
      label: translate("magazine:desk.pieceRow.unpublish"),
      icon: FiEyeOff,
      hasSeparatorBefore: true,
      onSelect: onUnpublish,
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
