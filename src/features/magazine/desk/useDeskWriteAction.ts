/**
 * "Write" — the desk action for a piece the editor writes themselves, as
 * opposed to commissioning it out. Kept out of `EditorDashboardPage` so the
 * page stays thin, mirroring `useDeskPieceActions` / `useDeskModals`.
 *
 * There is no setup modal on purpose: the only fields a brief-less piece
 * needs (title, section, byline, which issue it runs in) are all editable in
 * the article editor's meta rail, so asking for them twice would just delay
 * the cursor. The piece is created with the editor stamped as its own writer,
 * which the backend reads as "no brief goes out": it starts at `drafting` and
 * the audit trail says "started writing" instead of "commissioned".
 */

import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import type { Editor, Issue } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import type { TFunction } from "../../../shared/i18n/types";
import type { ToastType } from "../../../shared/components/feedback/toastContext";
import type { DeskTrack } from "./DeskTrackTabs";

export interface UseDeskWriteActionParams {
  /** The "Viewing as" editor id — stamped as BOTH `editorId` and `writerId`. */
  activeMe: string;
  /** The editor directory, for resolving `activeMe` to a display byline. */
  editors: Editor[];
  /** The section list behind the desk's filters. The first entry is the
   *  starting section, the same default the commission modal uses; it is
   *  changed in the editor's meta rail like every other piece of metadata. */
  sections: { name: string }[];
  /** The selected issue — a new draft files onto it on the Issue track. */
  issue: Issue;
  /** The active desk track, mirroring how the commission modal defaults. */
  track: DeskTrack;
  pieceMutations: ReturnType<typeof usePieceMutations>;
  showToast: (message: string, type?: ToastType) => void;
  translate: TFunction;
}

export interface UseDeskWriteActionResult {
  /** Create the piece and land in the article editor with the cursor ready. */
  startWriting: () => void;
  /** True while the piece is being created, to hold the button disabled. */
  isStarting: boolean;
}

export function useDeskWriteAction({
  activeMe,
  editors,
  sections,
  issue,
  track,
  pieceMutations,
  showToast,
  translate,
}: UseDeskWriteActionParams): UseDeskWriteActionResult {
  const navigate = useNavigate();

  function startWriting(): void {
    // `editorId`/`writerId` must be real user UUIDs. Same guard as
    // `submitCommission`: the session may not have resolved yet, and firing
    // early earns a "must be a UUID" rejection instead of a draft.
    if (!activeMe) {
      showToast(translate("magazine:desk.write.editorNotReady"), "error");
      return;
    }

    const section = sections[0]?.name ?? "";
    if (!section) {
      showToast(translate("magazine:desk.write.noSection"), "error");
      return;
    }

    pieceMutations.startDraft.mutate(
      {
        format: "article",
        // The backend requires a non-empty title; the editor renames it in the
        // document's own headline field the moment they start typing.
        title: translate("magazine:desk.write.untitledTitle"),
        section,
        editorId: activeMe,
        writerId: activeMe,
        byline: editors.find((editor) => editor.id === activeMe)?.name ?? "",
        // Issue-track drafts file onto the working issue; on Unassigned they
        // stay unfiled (`issueId` omitted). Guarded so an empty id is never
        // sent for an issue-less magazine.
        issueId: track === "issue" && issue.id ? issue.id : undefined,
      },
      {
        onSuccess: ({ id }) =>
          void navigate(routes.magazineWrite.replace(":id", id)),
      },
    );
  }

  return { startWriting, isStarting: pieceMutations.startDraft.isPending };
}
