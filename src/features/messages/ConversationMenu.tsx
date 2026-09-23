// src/features/messages/ConversationMenu.tsx
import { useCallback, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ConfirmDialog } from "../../shared/components/ui";
import type { IdentityKind } from "../../shared/contracts/contracts";
import { ReportListingModal } from "../economy/ReportListingModal";
import { buildConversationMenuItems } from "./buildConversationMenuItems";
import { ConversationMenuModals } from "./ConversationMenuModals";
import { ConversationMenuTrigger } from "./ConversationMenuTrigger";
import { useConversationBlockAction } from "./useConversationBlockAction";
import { useConversationMuteMenuItems } from "./useConversationMuteMenuItems";
import { useGroupReportMenuItem } from "./useGroupReportMenuItem";
import { useIdentityBlockAction } from "./useIdentityBlockAction";
import { useKebabMenuA11y } from "./useKebabMenuA11y";
import { useMessageViewer } from "./useMessageViewer";
import { conversations as mockConversations, type Conversation } from "./data";
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

/** The identity fields this menu needs from the open thread's `Conversation`
 *  row, passed down from `ConversationHeader` (PRD-376). */
export interface ConversationMenuCounterpart {
  /** Full display name, kept separate from the first-name split `name`
   *  carries for a person DM's block/report copy. */
  name: string;
  avatarUrl?: string;
  slug?: string;
  counterpartIdentityId?: string;
  counterpartIdentityKind?: IdentityKind;
  isCounterpartFormerBusiness?: boolean;
}

type ConversationIdentityFields = Pick<
  Conversation,
  | "name"
  | "avatarUrl"
  | "slug"
  | "counterpartIdentityId"
  | "counterpartIdentityKind"
  | "isCounterpartFormerBusiness"
>;

const EMPTY_IDENTITY_FIELDS: ConversationIdentityFields = {
  name: "",
  avatarUrl: undefined,
  slug: undefined,
  counterpartIdentityId: undefined,
  counterpartIdentityKind: undefined,
  isCounterpartFormerBusiness: undefined,
};

/**
 * Fallback only: when a caller does not pass `counterpart` (every real
 * render does; see `ConversationHeader`), this reads the same fields
 * straight back out of the conversations cache the open thread's row already
 * sits in, the prefix-match idiom `useConversationMedia.ts` and
 * `realtime.ts` already use to patch every scoped mailbox list at once
 * (`useConversations.ts`'s own doc). `isDisabled` skips the scan entirely
 * once real props exist, so this fallback costs nothing on the path that
 * matters.
 */
function useConversationCounterpartIdentity(
  conversationId: string,
  isDisabled: boolean,
): ConversationIdentityFields {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(onStoreChange),
    [queryClient],
  );
  return useSyncExternalStore(subscribe, () => {
    if (isDisabled) return EMPTY_IDENTITY_FIELDS;
    const cachedLists = queryClient.getQueriesData<Conversation[]>({
      queryKey: ["conversations", demoMode],
    });
    for (const [, rows] of cachedLists) {
      const match = rows?.find((row) => row.id === conversationId);
      if (match) return match;
    }
    const detail = queryClient.getQueryData<Conversation>([
      "conversation-detail",
      conversationId,
      demoMode,
    ]);
    if (detail) return detail;
    if (demoMode) {
      const seeded = mockConversations.find(
        (conversation) => conversation.id === conversationId,
      );
      if (seeded) return seeded;
    }
    return EMPTY_IDENTITY_FIELDS;
  });
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
 * PRD-376: when the DM's counterpart is a business, persona or company
 * mailbox (the customer's own view of it), the safety items route through
 * the identity block (`/identity-blocks`, via `useIdentityBlockAction`) and
 * the customer-only identity report (`ReportListingModal` with
 * `subjectType="identity"`), even though `ConversationSafetyTarget.slug`
 * still carries the business's own HANDLE. A staff member's own view of a
 * customer thread carries no `counterpartIdentityKind` (that counterpart is
 * a person), so it keeps the person flow below unchanged. Three cases turn
 * every safety item off entirely, with no fallback to the person flow: the
 * counterpart identity cannot be resolved at all (`counterpart` prop absent
 * and the fallback cache lookup misses), the counterpart is a business the
 * viewer themself staffs (their own mailbox, `IDENTITY_BLOCK_OWN` on the
 * backend), or the counterpart is a former business.
 *
 * Keyboard/open-state mechanics live in `useKebabMenuA11y`, shared with
 * `ThreadRowMenu`; the popover/menu-item CSS classes are the same `.rowMenu*`
 * ones for visual consistency.
 */
export function ConversationMenu({
  conversationId,
  name,
  safety,
  counterpart,
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
  /** The open thread's counterpart identity fields, straight from
   *  `ConversationHeader`'s own `active` row. Absent only for a caller this
   *  menu has never been wired into (a group, an official thread, or a test
   *  exercising the cache fallback); see `useConversationCounterpartIdentity`. */
  counterpart?: ConversationMenuCounterpart;
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
  const viewer = useMessageViewer();
  const cachedCounterpart = useConversationCounterpartIdentity(
    conversationId,
    !!counterpart,
  );
  const resolvedCounterpart = counterpart ?? cachedCounterpart;
  const isCounterpartMissing =
    !counterpart && cachedCounterpart === EMPTY_IDENTITY_FIELDS;
  const isBusinessCounterpart =
    !!resolvedCounterpart.counterpartIdentityKind &&
    resolvedCounterpart.counterpartIdentityKind !== "profile" &&
    !resolvedCounterpart.isCounterpartFormerBusiness;
  // A member who staffs this same business but still has a personal thread
  // with it (they were a customer before they joined the team): the backend
  // refuses both actions (`IDENTITY_BLOCK_OWN`, 403 on the report), so
  // nothing here can succeed against it.
  const isCounterpartOwnMailbox =
    isBusinessCounterpart &&
    !!resolvedCounterpart.counterpartIdentityId &&
    viewer.staffedIdentityIds.has(resolvedCounterpart.counterpartIdentityId);
  const isSafetyBlocked = isCounterpartMissing || isCounterpartOwnMailbox;
  const shouldOfferIdentitySafety = isBusinessCounterpart && !isSafetyBlocked;
  // What `buildConversationMenuItems` renders (business- or person-shaped,
  // by `counterpartIdentityKind`): suppressed entirely on a miss or an
  // own-mailbox counterpart.
  const safetyForItems = isSafetyBlocked ? undefined : safety;
  // What `ConversationMenuModals` mounts: the person-level modals never
  // mount for a business counterpart (the identity modals below take over
  // instead) or when safety is blocked outright.
  const safetyForModals =
    isBusinessCounterpart || isSafetyBlocked ? undefined : safety;
  const identityBlockTarget =
    shouldOfferIdentitySafety && resolvedCounterpart.counterpartIdentityId
      ? {
          identityId: resolvedCounterpart.counterpartIdentityId,
          kind: resolvedCounterpart.counterpartIdentityKind!,
          name: resolvedCounterpart.name,
          handle: resolvedCounterpart.slug,
          avatarUrl: resolvedCounterpart.avatarUrl,
        }
      : undefined;
  const identityBlock = useIdentityBlockAction(identityBlockTarget);
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
    safety: safetyForItems,
    blocked,
    onBeginBlock: beginBlock,
    onManageBlockedMembers: () => void navigate(routes.blockMute),
    onOpenReport: () => setIsReporting(true),
    counterpartIdentityKind: resolvedCounterpart.counterpartIdentityKind,
    isCounterpartFormerBusiness:
      resolvedCounterpart.isCounterpartFormerBusiness,
    businessName: resolvedCounterpart.name,
    onBeginIdentityBlock: identityBlock.beginBlock,
    onOpenIdentityReport: () => setIsReporting(true),
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

      {/* `safetyForModals` is withheld for a business counterpart (and for a
          missing/own-mailbox one), so the person-level block-confirm and
          "Report member" modals this renders stay unmounted; the two modals
          just below take over that role for a business counterpart. */}
      <ConversationMenuModals
        conversationId={conversationId}
        name={name}
        isGroup={isGroup}
        safety={safetyForModals}
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
      {shouldOfferIdentitySafety && (
        <>
          <ConfirmDialog
            open={identityBlock.isConfirming}
            tone="destructive"
            loading={identityBlock.isBlocking}
            onClose={identityBlock.cancelBlock}
            onConfirm={identityBlock.confirmBlock}
            title={t("messages:mailbox.block.confirmTitle", {
              name: resolvedCounterpart.name,
            })}
            description={t("messages:mailbox.block.confirmBody", {
              name: resolvedCounterpart.name,
            })}
            confirmLabel={t("messages:mailbox.block.confirm")}
          />
          {isReporting && resolvedCounterpart.counterpartIdentityId && (
            <ReportListingModal
              subjectType="identity"
              subjectId={resolvedCounterpart.counterpartIdentityId}
              subjectName={resolvedCounterpart.name}
              onClose={() => setIsReporting(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
