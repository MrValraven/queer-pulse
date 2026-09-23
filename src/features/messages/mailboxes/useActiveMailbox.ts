import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  MAILBOXES_QUERY_KEY_PREFIX,
  staffedIdentityIdsOf,
  type MailboxSummary,
} from "../../../shared/api/mailboxViewer";
import { useMailboxes } from "../api/useMailboxes";
import {
  resolveActiveMailbox,
  type ConversationListScope,
} from "./mailboxScope";

/** The URL parameter naming the active mailbox, beside `?c=` and `?tab=`. */
export const MAILBOX_PARAM = "as";

/** Params that describe what is open inside one mailbox, so a plain switch
 *  drops them. */
const THREAD_PARAMS = ["c", "m"] as const;
const TAB_PARAM = "tab";

const NO_MAILBOXES: MailboxSummary[] = [];

/** Several hooks read the active mailbox at once (the controller, search,
 *  starred, deep links), and each can notice a lost mailbox in the same
 *  commit. One notice per identity inside this window reaches the member. */
const LOST_ACCESS_NOTICE_WINDOW_MS = 2_000;
let lastLostAccessNotice: { identityId: string; shownAt: number } | null = null;

function shouldAnnounceLostAccess(identityId: string): boolean {
  const now = Date.now();
  if (
    lastLostAccessNotice?.identityId === identityId &&
    now - lastLostAccessNotice.shownAt < LOST_ACCESS_NOTICE_WINDOW_MS
  ) {
    return false;
  }
  lastLostAccessNotice = { identityId, shownAt: now };
  return true;
}

export interface ActiveMailbox {
  /** Every mailbox the member may read, profile first; empty while loading. */
  mailboxes: MailboxSummary[];
  /** The mailbox `?as=` resolves to, null until the mailboxes load. */
  active: MailboxSummary | null;
  profileMailbox: MailboxSummary | null;
  isPersonal: boolean;
  isLoading: boolean;
  /** The mailbox list failed to load, so no list scope can resolve. */
  isError: boolean;
  refetch: () => void;
  staffedIdentityIds: ReadonlySet<string>;
  /** The list scope for the active mailbox, null until the mailboxes load. */
  scope: ConversationListScope | null;
  /** Switch mailboxes: sets `?as=` (dropped for the profile mailbox) and
   *  clears the open thread and the tab. */
  selectMailbox: (identityId: string) => void;
  /** Switch mailboxes and keep `?c=`/`?m=`, for a deep link into a thread of
   *  another mailbox. */
  switchMailboxKeepingThread: (identityId: string) => void;
  /** The server answered `IDENTITY_NOT_STAFF` for the active mailbox: reload
   *  the mailbox list, fall back to the personal mailbox and say so once. */
  reportLostAccess: () => void;
}

/**
 * The list scope for one mailbox. Keyed on the fields a scope reads, so a
 * mailbox list refetch that only moves unread counts keeps the same scope
 * object and every memo downstream of it.
 */
function useScopeOf(
  mailbox: MailboxSummary | null,
  staffedIdentityIds: ReadonlySet<string>,
): ConversationListScope | null {
  const identityId = mailbox?.identityId ?? null;
  const isPersonal = mailbox?.kind === "profile";
  const isReadOnly = mailbox?.isReadOnly ?? false;
  return useMemo(
    () =>
      identityId
        ? { identityId, isPersonal, isReadOnly, staffedIdentityIds }
        : null,
    [identityId, isPersonal, isReadOnly, staffedIdentityIds],
  );
}

function useMailboxList() {
  const mailboxesQuery = useMailboxes();
  const mailboxes = mailboxesQuery.data;
  // A content key, so the set keeps its identity across refetches that only
  // move unread counts.
  const staffedIdentityKey = [...staffedIdentityIdsOf(mailboxes)]
    .sort()
    .join(",");
  const staffedIdentityIds = useMemo<ReadonlySet<string>>(
    () => new Set(staffedIdentityKey ? staffedIdentityKey.split(",") : []),
    [staffedIdentityKey],
  );
  const profileMailbox = useMemo(
    () => resolveActiveMailbox(mailboxes, null).active,
    [mailboxes],
  );
  return { mailboxesQuery, mailboxes, staffedIdentityIds, profileMailbox };
}

/**
 * The member's personal mailbox as a list scope, whatever mailbox `?as=`
 * names. For surfaces outside the inbox (share to chat) that only ever send
 * from the member's own seat. Null until the mailboxes load.
 */
export function usePersonalMailboxScope(): ConversationListScope | null {
  const { staffedIdentityIds, profileMailbox } = useMailboxList();
  return useScopeOf(profileMailbox, staffedIdentityIds);
}

/**
 * The active mailbox, held in the URL as `?as=<identityId>` and resolved
 * against `GET /identities/mailboxes`. A missing `?as=` is the personal
 * mailbox. A mailbox the member no longer has falls back to the personal one,
 * drops `?as=` and shows `messages:mailbox.lostAccess` once.
 *
 * Every switch replaces the history entry: a mailbox is view state like the
 * tabs, so mobile back keeps leaving the page it came from.
 */
export function useActiveMailbox(): ActiveMailbox {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { mailboxesQuery, mailboxes, staffedIdentityIds, profileMailbox } =
    useMailboxList();
  const requestedIdentityId = searchParams.get(MAILBOX_PARAM);
  const { active, isRequestedMissing } = useMemo(
    () => resolveActiveMailbox(mailboxes, requestedIdentityId),
    [mailboxes, requestedIdentityId],
  );

  const dropMailboxParam = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(MAILBOX_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const announceLostAccess = useCallback(
    (identityId: string) => {
      if (!shouldAnnounceLostAccess(identityId)) return;
      showToast(t("messages:mailbox.lostAccess"), "info");
    },
    [showToast, t],
  );

  useEffect(() => {
    if (!isRequestedMissing || !requestedIdentityId) return;
    dropMailboxParam();
    announceLostAccess(requestedIdentityId);
  }, [
    isRequestedMissing,
    requestedIdentityId,
    dropMailboxParam,
    announceLostAccess,
  ]);

  const switchMailbox = useCallback(
    (identityId: string, shouldKeepThread: boolean) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (!shouldKeepThread) {
            for (const param of THREAD_PARAMS) next.delete(param);
            next.delete(TAB_PARAM);
          }
          if (identityId === profileMailbox?.identityId) {
            next.delete(MAILBOX_PARAM);
          } else {
            next.set(MAILBOX_PARAM, identityId);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, profileMailbox],
  );

  const selectMailbox = useCallback(
    (identityId: string) => switchMailbox(identityId, false),
    [switchMailbox],
  );
  const switchMailboxKeepingThread = useCallback(
    (identityId: string) => switchMailbox(identityId, true),
    [switchMailbox],
  );

  const reportLostAccess = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: MAILBOXES_QUERY_KEY_PREFIX,
    });
    if (!requestedIdentityId) return;
    dropMailboxParam();
    announceLostAccess(requestedIdentityId);
  }, [queryClient, requestedIdentityId, dropMailboxParam, announceLostAccess]);

  const scope = useScopeOf(active, staffedIdentityIds);
  const refetchMailboxes = mailboxesQuery.refetch;
  const refetch = useCallback(() => {
    void refetchMailboxes();
  }, [refetchMailboxes]);

  return {
    mailboxes: mailboxes ?? NO_MAILBOXES,
    active,
    profileMailbox,
    isPersonal: active ? active.kind === "profile" : !requestedIdentityId,
    isLoading: mailboxesQuery.isLoading,
    isError: mailboxesQuery.isError,
    refetch,
    staffedIdentityIds,
    scope,
    selectMailbox,
    switchMailboxKeepingThread,
    reportLostAccess,
  };
}
