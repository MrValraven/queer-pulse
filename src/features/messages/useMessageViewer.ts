import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  staffedIdentityIdsOf,
  type MessageViewer,
} from "../../shared/api/mailboxViewer";
import { DEMO_VIEWER_HANDLE } from "./api/demoThreadCache";
import { useMailboxes } from "./api/useMailboxes";

/** The signed-in member as `isFromViewerSide` reads them: their own handle
 *  plus every persona, listing and company identity they answer for. */
export function useMessageViewer(): MessageViewer {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { data: mailboxes } = useMailboxes();
  const myHandle = demoMode ? DEMO_VIEWER_HANDLE : (user?.profile.slug ?? null);
  return useMemo(
    () => ({ myHandle, staffedIdentityIds: staffedIdentityIdsOf(mailboxes) }),
    [myHandle, mailboxes],
  );
}
