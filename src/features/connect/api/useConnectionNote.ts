import { useCallback, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getDemoConnectionNote,
  setDemoConnectionNote,
  subscribeDemoConnectionNotes,
} from "../demoConnectionNotes";
import { setConnectionNote } from "./connections.api";

export interface ConnectionNoteResult {
  /** The note as it currently stands for this connection. */
  note: string;
  /** Persist (or, with an empty body, clear) the note. Resolves false when the
   *  write failed, so the editor never claims a save that did not happen. */
  saveNote: (body: string) => Promise<boolean>;
}

/**
 * The viewer's private note about one connection, in both modes.
 *
 * Live: the note arrives on the connection row and a write goes to
 * `PUT /connections/:id/note`, which stores it under the viewer's own user id.
 * The other party's list never carries it, so nothing here has to hide it.
 *
 * Demo: there is no server and no connection id, so the note lives in the
 * in-memory demo store keyed by member slug and is read through
 * `useSyncExternalStore`, which keeps it on screen across tab switches.
 */
export function useConnectionNote(
  slug: string,
  connectionId: string | undefined,
  serverNote: string | undefined,
): ConnectionNoteResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const readDemoNote = useCallback(() => getDemoConnectionNote(slug), [slug]);
  const demoNote = useSyncExternalStore(
    subscribeDemoConnectionNotes,
    readDemoNote,
    readDemoNote,
  );

  // No connection id means no live row to write against (the demo cards, and
  // the Blocked tab's rows, which come from the blocks resource).
  const isLocalOnly = demoMode || !connectionId;

  const saveNote = useCallback(
    async (body: string): Promise<boolean> => {
      // Narrowed here rather than through `isLocalOnly`, so the id below is a
      // string by the type system's own reckoning and needs no assertion.
      if (demoMode || !connectionId) {
        setDemoConnectionNote(slug, body);
        return true;
      }
      try {
        await setConnectionNote(connectionId, body);
        await queryClient.invalidateQueries({ queryKey: ["connections"] });
        return true;
      } catch {
        showToast(t("connect:note.saveFailed"), "error");
        return false;
      }
    },
    [demoMode, slug, connectionId, queryClient, showToast, t],
  );

  return {
    note: isLocalOnly ? demoNote : (serverNote ?? ""),
    saveNote,
  };
}
