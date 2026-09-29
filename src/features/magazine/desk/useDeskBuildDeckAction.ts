/**
 * "Build a deck": the desk action for a slide deck the editor makes
 * themselves, the deck twin of `useDeskWriteAction`. It creates a
 * deck-format piece, which the backend now creates together with its empty
 * draft deck, and opens the deck editor on that deck. So every deck started
 * from the desk is a desk piece from its first moment, and the desk no longer
 * needs the separate deck registry to know it exists.
 *
 * Same guards and same stamping as Write: the editor is both `editorId` and
 * `writerId`, which the backend reads as "no brief goes out", so the piece
 * starts at `drafting`. Everything else (title, section, byline, slides) is
 * edited in the deck editor.
 *
 * The mutation lives here, beside its one caller, so the shared
 * `usePieceMutations` stays as it is. It invalidates the same desk queries.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Editor, Issue } from "../data/desk.data";
import { createPiece, type CreatePieceDto } from "../api/pieces.api";
import type { TFunction } from "../../../shared/i18n/types";
import type { ToastType } from "../../../shared/components/feedback/toastContext";
import type { DeskTrack } from "./deskTrack";

export interface UseDeskBuildDeckActionParams {
  /** The viewing editor's id, stamped as BOTH `editorId` and `writerId`. */
  activeMe: string;
  /** The editor directory, for resolving `activeMe` to a display byline. */
  editors: Editor[];
  /** The section taxonomy from `useMagazineSections`; the first entry is the
   *  starting section, as for Write. */
  sections: { name: string }[];
  /** The taxonomy fetch is still in flight (told apart from a failure). */
  areSectionsLoading: boolean;
  /** The taxonomy fetch failed. */
  hasSectionsError: boolean;
  /** The selected issue: a new deck files onto it on the Issue track. */
  issue: Issue;
  /** The active desk track, mirroring Write and the commission modal. */
  track: DeskTrack;
  showToast: (message: string, type?: ToastType) => void;
  translate: TFunction;
}

export interface UseDeskBuildDeckActionResult {
  /** Create the deck piece and land in the deck editor on its deck. */
  startBuildingDeck: () => void;
  /** True while the piece is being created, to hold the button disabled. */
  isStarting: boolean;
}

export function useDeskBuildDeckAction({
  activeMe,
  editors,
  sections,
  areSectionsLoading,
  hasSectionsError,
  issue,
  track,
  showToast,
  translate,
}: UseDeskBuildDeckActionParams): UseDeskBuildDeckActionResult {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();

  /** POST /magazine/admin/pieces with `format: "deck"`; resolves to the new
   *  deck's id, or `null` when there is none to open (demo mode). */
  const createDeckPiece = useMutation<string | null, Error, CreatePieceDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(translate("magazine:desk.pieceToast.deckStarted"), "success");
        return null;
      }
      const piece = await createPiece(body);
      return piece.deckId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-desk-summary"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
    },
  });

  function startBuildingDeck(): void {
    // Same guard as Write: the session may not have resolved yet, and a
    // missing id earns a "must be a UUID" rejection instead of a deck.
    if (!activeMe) {
      showToast(translate("magazine:desk.write.editorNotReady"), "error");
      return;
    }

    // The same three meanings of an empty section list as Write: still
    // arriving, failed, or a magazine with no sections set up.
    const section = sections[0]?.name ?? "";
    if (!section) {
      if (areSectionsLoading) {
        showToast(translate("magazine:desk.write.sectionsLoading"), "info");
        return;
      }
      showToast(
        translate(
          hasSectionsError
            ? "magazine:desk.write.sectionsUnavailable"
            : "magazine:desk.write.noSection",
        ),
        "error",
      );
      return;
    }

    createDeckPiece.mutate(
      {
        format: "deck",
        // The backend requires a non-empty title; the editor renames the
        // deck in the deck editor.
        title: translate("magazine:desk.buildDeck.untitledTitle"),
        section,
        editorId: activeMe,
        writerId: activeMe,
        byline: editors.find((editor) => editor.id === activeMe)?.name ?? "",
        issueId: track === "issue" && issue.id ? issue.id : undefined,
      },
      {
        // Demo has no deck behind the piece, so it opens a fresh draft, the
        // same editor a new deck always used.
        onSuccess: (deckId) =>
          void navigate(
            deckId ? `${routes.deckEditor}?id=${deckId}` : routes.deckEditor,
          ),
      },
    );
  }

  return { startBuildingDeck, isStarting: createDeckPiece.isPending };
}
