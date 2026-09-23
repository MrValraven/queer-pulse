// src/features/messages/buildConversationMenuItems.tsx
import type { ReactNode } from "react";
import { FiFlag, FiGrid, FiImage, FiSlash, FiUsers } from "react-icons/fi";
import type { IdentityKind } from "../../shared/contracts/contracts";
import type { TFunction } from "../../shared/i18n/types";
import type { ConversationSafetyTarget } from "./ConversationMenu";

export interface MenuItemDef {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface BuildConversationMenuItemsParams {
  t: TFunction;
  name: string;
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
  /** Lazy on purpose: read at click time, once the kebab's own trigger
   *  button ref (`ConversationMenu`'s `triggerRef`) has actually mounted. */
  getMediaTrigger: () => HTMLElement | null;
  onOpenWallpaper: () => void;
  muteItems: MenuItemDef[];
  groupReportItems: MenuItemDef[];
  safety?: ConversationSafetyTarget;
  blocked: boolean;
  onBeginBlock: () => void;
  onManageBlockedMembers: () => void;
  onOpenReport: () => void;
  /** The counterpart's identity kind when the other side of this DM is a
   *  business, persona or company mailbox (a customer's view of it); absent
   *  for an ordinary person, including a staff member's view of a customer
   *  (that counterpart is a person, even from inside a seated mailbox row).
   *  PRD-376. */
  counterpartIdentityKind?: IdentityKind;
  /** The counterpart business, persona or company has since been deleted:
   *  there is no identity left to block or report, and per-message reports
   *  still reach a human through the ordinary message-level flow. */
  isCounterpartFormerBusiness?: boolean;
  /** The business/persona/company's own full display name ("Café Lisboa"),
   *  for the identity block/report item labels. Only read when
   *  `counterpartIdentityKind` is set; `name` above stays the person-facing
   *  first name used by every other item. */
  businessName?: string;
  /** Opens the identity-block confirm step (`useIdentityBlockAction`). Only
   *  read for a business counterpart. */
  onBeginIdentityBlock?: () => void;
  /** Opens `ReportListingModal` with `subjectType="identity"`. Only read for
   *  a business counterpart. */
  onOpenIdentityReport?: () => void;
}

/**
 * Builds the `ConversationMenu`'s flat item list: media gallery (if wired),
 * wallpaper, the mute items, the group-only report item, then (DM-only)
 * block/blocked-members/report. Split out purely to keep that orchestrator
 * under the size cap; no behaviour changed from the inline version it
 * replaces.
 *
 * PRD-376: when the DM's counterpart is a business, persona or company
 * mailbox (`counterpartIdentityKind` set), the block and report items target
 * that IDENTITY: `/identity-blocks` and a `subjectType: "identity"` report,
 * in the same two slots an ordinary DM fills with the person-level `/blocks`
 * and `member` report. A staff member's own view of a customer thread
 * carries no `counterpartIdentityKind` at all (the customer there is a
 * person), so it keeps the person items unchanged. A former business
 * (`isCounterpartFormerBusiness`) drops every item in this block entirely:
 * there is no identity left to block or report.
 */
export function buildConversationMenuItems({
  t,
  name,
  onOpenMediaGallery,
  getMediaTrigger,
  onOpenWallpaper,
  muteItems,
  groupReportItems,
  safety,
  blocked,
  onBeginBlock,
  onManageBlockedMembers,
  onOpenReport,
  counterpartIdentityKind,
  isCounterpartFormerBusiness,
  businessName,
  onBeginIdentityBlock,
  onOpenIdentityReport,
}: BuildConversationMenuItemsParams): MenuItemDef[] {
  const isBusinessCounterpart =
    !!counterpartIdentityKind && counterpartIdentityKind !== "profile";

  const items: MenuItemDef[] = [
    ...(onOpenMediaGallery
      ? [
          {
            key: "media",
            label: t("messages:mediaGallery.title"),
            icon: <FiGrid aria-hidden />,
            onSelect: () => onOpenMediaGallery(getMediaTrigger()),
          },
        ]
      : []),
    {
      key: "wallpaper",
      label: t("messages:wallpaper.menuAction"),
      icon: <FiImage aria-hidden />,
      onSelect: onOpenWallpaper,
    },
    ...muteItems,
    ...groupReportItems,
  ];
  // A former business leaves no identity behind to block or report, and no
  // person either (the counterpart row itself is the deleted business), so
  // the whole safety block drops entirely.
  if (safety && !isCounterpartFormerBusiness) {
    items.push(
      isBusinessCounterpart
        ? {
            key: "block",
            label: t("messages:mailbox.block.action", { name: businessName }),
            icon: <FiSlash aria-hidden />,
            onSelect: onBeginIdentityBlock ?? onBeginBlock,
            danger: true,
          }
        : {
            key: "block",
            label: t(
              blocked
                ? "safety:profileMenu.unblock"
                : "safety:profileMenu.block",
              { name },
            ),
            icon: <FiSlash aria-hidden />,
            onSelect: onBeginBlock,
            danger: !blocked,
          },
      {
        // PRD-346: a path from inside the thread back to the block/mute list.
        // Previously nothing in messaging linked there at all once the
        // block undo toast's own window closed.
        key: "blockedMembers",
        label: t("safety:blockMute.blocked.manageLink"),
        icon: <FiUsers aria-hidden />,
        onSelect: onManageBlockedMembers,
      },
      isBusinessCounterpart
        ? {
            key: "report",
            label: t("messages:mailbox.report.action", { name: businessName }),
            icon: <FiFlag aria-hidden />,
            onSelect: onOpenIdentityReport ?? onOpenReport,
            danger: true,
          }
        : {
            key: "report",
            label: t("messages:conversation.reportMemberAction", { name }),
            icon: <FiFlag aria-hidden />,
            onSelect: onOpenReport,
            danger: true,
          },
    );
  }
  return items;
}
