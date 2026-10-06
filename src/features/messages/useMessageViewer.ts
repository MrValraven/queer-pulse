import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  ownMemberKeysOf,
  ownMemberKeysSnapshotOf,
  staffedIdentityIdsOf,
  subscribeOwnMemberKeys,
  type MessageViewer,
} from "../../shared/api/mailboxViewer";
import { DEMO_VIEWER_HANDLE } from "./api/demoThreadCache";
import { useMailboxes } from "./api/useMailboxes";

/** The signed-in member as `isFromViewerSide` reads them: their own handle
 *  plus every persona, listing and company identity they answer for, and
 *  their per-chat key in every matched Go together chat (PRD-423). */
export function useMessageViewer(): MessageViewer {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { data: mailboxes } = useMailboxes();
  const myHandle = demoMode ? DEMO_VIEWER_HANDLE : (user?.profile.slug ?? null);
  const queryClient = useQueryClient();
  const ownMemberKeysSnapshot = useOwnMemberKeysSnapshot();
  return useMemo(
    () => ({
      myHandle,
      staffedIdentityIds: staffedIdentityIdsOf(mailboxes),
      // Read from the shared memo, which the snapshot below tracks.
      ownMemberKeys: ownMemberKeysSnapshot
        ? ownMemberKeysOf(queryClient)
        : new Set<string>(),
    }),
    [myHandle, mailboxes, ownMemberKeysSnapshot, queryClient],
  );
}

/**
 * PRD-423: the member's own matched-chat keys, kept live as conversation
 * rows load, so a bubble rendered before its conversation arrived moves to
 * the viewer's side once it does. Reads the one memo per QueryClient
 * (`ownMemberKeysOf`), which a single filtered cache subscription keeps
 * current; the snapshot is a sorted, joined string that only changes when
 * the set does.
 */
function useOwnMemberKeysSnapshot(): string {
  const queryClient = useQueryClient();
  const subscribe = useCallback(
    (onChange: () => void) => subscribeOwnMemberKeys(queryClient, onChange),
    [queryClient],
  );
  const getSnapshot = useCallback(
    () => ownMemberKeysSnapshotOf(queryClient),
    [queryClient],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
