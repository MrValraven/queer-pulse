// src/features/messages/ConversationMenu.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildConversationMenuItems } from "./buildConversationMenuItems";
import { ConversationMenuModals } from "./ConversationMenuModals";
import { ConversationMenuTrigger } from "./ConversationMenuTrigger";
import { useConversationBlockAction } from "./useConversationBlockAction";
import { useConversationMuteMenuItems } from "./useConversationMuteMenuItems";
import { useGroupReportMenuItem } from "./useGroupReportMenuItem";
import { useKebabMenuA11y } from "./useKebabMenuA11y";
import styles from "./MessagesPage.module.css";

/** The DM-only half of the menu. Absent for a group (no single counterpart to
 *  act against) and for an official thread (no member behind it at all). */
export interface ConversationSafetyTarget {
  /** Counterpart's profile slug — the key blocks/mutes are stored under. */
  slug: string;
  /** Counterpart's user id for the report subject; falls back to `slug` when
   *  unset (demo mode never sends this over the network — see `useCreateReport`). */
  reportSubjectId: string | undefined;
}

/**
 * Conversation-header overflow menu.
 *
 * This was `ConversationSafetyMenu`, rendered only for DMs. Wallpaper has to
 * be reachable from a group and an official thread too, so the menu itself now
 * renders for every thread and it is the SAFETY ITEMS that carry the DM-only
 * condition (`safety` absent = they are simply not in the list). Nothing about
 * blocking or reporting changed: same `useSocial()` primitive via
 * `useConversationBlockAction`, same `BlockMemberModal` a profile's
 * `ProfileSafetyMenu` opens, same shared `/reports` mutation, same gating.
 * Blocking here still severs the composer instantly and drops the thread from
 * the inbox.
 *
 * Keyboard/open-state mechanics live in `useKebabMenuA11y`, shared with
 * `ThreadRowMenu`; the popover/menu-item CSS classes are the same `.rowMenu*`
 * ones for visual consistency.
 */
export function ConversationMenu({
  conversationId,
  name,
  safety,
  isGroup = false,
  muted = false,
  mutedUntil = null,
  onOpenMediaGallery,
}: {
  /** The thread whose wallpaper this menu edits. Also the report subject id
   *  for a group report (PRD-356) — a group's report subject IS the
   *  conversation itself. */
  conversationId: string;
  /** Counterpart's first name, or the group's name — used in confirm/menu copy. */
  name: string;
  safety?: ConversationSafetyTarget;
  /** GROUP only — enables "Report group" in place of the DM-only `safety`
   *  items (mutually exclusive with `safety`: a group has no single
   *  counterpart to block, only itself to report). */
  isGroup?: boolean;
  /** Whether THIS caller currently has the thread muted (PRD-346/349). Any
   *  thread, DM or group. Defaults to `false` until the caller passes the
   *  real value (see this component's HANDOFF note in the messaging-craft
   *  build report: `ConversationHeader.tsx` does not thread it through
   *  yet). */
  muted?: boolean;
  /** When a TIMED mute expires (PRD-349); null/undefined while unmuted or
   *  muted forever. See `muted`'s own doc for the same HANDOFF note. */
  mutedUntil?: string | null;
  /** Opens the "Media, links and docs" sheet (PRD-373). Receives the kebab
   *  trigger so focus lands back on it when the sheet is dismissed. */
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isReporting, setIsReporting] = useState(false);
  const [isPickingWallpaper, setIsPickingWallpaper] = useState(false);
  // Called unconditionally (hook rules): for a group or an official thread
  // there is no slug, and the empty key simply reads back as "not blocked" —
  // the items it powers are not in the list for those threads anyway.
  // PRD-362: the third argument lets the hook offer its own "report messages
  // before you block?" step from this thread's cache.
  const {
    blocked,
    confirmingBlock,
    reportingMessagesBeforeBlock,
    reportableMessages,
    beginBlock,
    cancelBlock,
    confirmBlock,
    skipReportMessagesStep,
    finishReportMessagesStep,
  } = useConversationBlockAction(safety?.slug ?? "", name, conversationId);
  // PRD-349: mute is reachable from every thread (DM or group), unlike block,
  // which stays DM-only (a group has no single counterpart to block). See
  // `useConversationMuteMenuItems`'s own doc for why this menu owns a
  // separate status label from the mute items.
  const { items: muteItems, statusLabel: muteStatusLabel } =
    useConversationMuteMenuItems(conversationId, muted, mutedUntil);
  // PRD-356: the group-only "Report group" item, mirroring the DM-only
  // `safety.report` item pushed further down.
  const groupReportItems = useGroupReportMenuItem(isGroup, () =>
    setIsReporting(true),
  );

  const items = buildConversationMenuItems({
    t,
    name,
    onOpenMediaGallery,
    getMediaTrigger: () => triggerRef.current,
    onOpenWallpaper: () => setIsPickingWallpaper(true),
    muteItems,
    groupReportItems,
    safety,
    blocked,
    onBeginBlock: beginBlock,
    onManageBlockedMembers: () => void navigate(routes.blockMute),
    onOpenReport: () => setIsReporting(true),
  });

  const { open, setOpen, containerRef, triggerRef, itemRefs, onMenuKeyDown } =
    useKebabMenuA11y(items.length);

  return (
    <div className={styles.safetyMenuWrap} ref={containerRef}>
      <ConversationMenuTrigger
        name={name}
        open={open}
        setOpen={setOpen}
        triggerRef={triggerRef}
        itemRefs={itemRefs}
        onMenuKeyDown={onMenuKeyDown}
        muteStatusLabel={muteStatusLabel}
        items={items}
      />

      <ConversationMenuModals
        conversationId={conversationId}
        name={name}
        isGroup={isGroup}
        safety={safety}
        isPickingWallpaper={isPickingWallpaper}
        onCloseWallpaper={() => setIsPickingWallpaper(false)}
        reportingMessagesBeforeBlock={reportingMessagesBeforeBlock}
        reportableMessages={reportableMessages}
        onSkipReportMessagesStep={skipReportMessagesStep}
        onFinishReportMessagesStep={finishReportMessagesStep}
        confirmingBlock={confirmingBlock}
        onCancelBlock={cancelBlock}
        onConfirmBlock={confirmBlock}
        isReporting={isReporting}
        onCloseReporting={() => setIsReporting(false)}
      />
    </div>
  );
}
