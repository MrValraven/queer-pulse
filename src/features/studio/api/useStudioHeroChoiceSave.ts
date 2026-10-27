import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { isPersonaEditConflict } from "../../subprofiles/api/personaEditConflict";
import {
  SubprofileNotFoundError,
  useOwnerSkinPatch,
} from "../../subprofiles/api/useOwnerSkinPatch";
import type { StudioHeroChoice } from "../studioHeroChoice";
import type { StudioArtistView } from "./studio.adapters";
import { studioKeys } from "./studioQueryKeys";

/** Why a save of the Studio page top failed, one catalog line each
 *  (`studio:artistPage.editPage.error.<reason>`). */
export type StudioHeroSaveReason =
  | "invalidChoice"
  | "signedOut"
  | "notAllowed"
  | "personaMissing"
  | "editConflict"
  | "tooMany"
  | "serverDown"
  | "network"
  | "unexpected";

export interface StudioHeroSaveFailure {
  reason: StudioHeroSaveReason;
  /** The HTTP status, named in the "unexpected" line; null without one,
   *  which picks the line that names no status. */
  status: number | null;
}

/** Reads a failed save into the reason the sheet names. The fresh read
 *  finding no persona is the persona gone; a fetch that threw a TypeError or
 *  ran into the client's own 408 timeout never got a server answer, so it
 *  is the connection. Anything else without a status is "unexpected", read
 *  through the line that names no status. */
export function studioHeroSaveFailureOf(error: unknown): StudioHeroSaveFailure {
  if (error instanceof SubprofileNotFoundError)
    return { reason: "personaMissing", status: null };
  if (error instanceof TypeError) return { reason: "network", status: null };
  if (!(error instanceof ApiError))
    return { reason: "unexpected", status: null };
  const status = error.status;
  if (isPersonaEditConflict(error)) return { reason: "editConflict", status };
  if (status === 400) return { reason: "invalidChoice", status };
  if (status === 401) return { reason: "signedOut", status };
  if (status === 403) return { reason: "notAllowed", status };
  if (status === 404) return { reason: "personaMissing", status };
  if (status === 408) return { reason: "network", status };
  if (status === 409) return { reason: "editConflict", status };
  if (status === 429) return { reason: "tooMany", status };
  if (status >= 500) return { reason: "serverDown", status };
  return { reason: "unexpected", status };
}

/**
 * Saves what shows at the top of an artist's Studio page. Live, the choice
 * goes through `useOwnerSkinPatch`: the subprofile PATCH replaces the whole
 * `skinData`, so the hook reads the persona's current blob at save time and
 * sends it back with only `studioHero` changed, keeping `coverBleed` and
 * every other skin field. Demo has no persona to write, so the choice lands
 * in the cached artist view only and holds for the session (the demo query
 * never goes stale). Either way the cached view takes the choice at once, so
 * the hero never flicks back to the old top while live refetches it.
 */
export function useStudioHeroChoiceSave(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { patchSkin, isSaving } = useOwnerSkinPatch(subprofileId);

  async function saveChoice(choice: StudioHeroChoice): Promise<void> {
    if (!demoMode) {
      await patchSkin((freshSkinData) => ({
        ...(freshSkinData ?? {}),
        studioHero: choice,
      }));
    }
    const artistKey = studioKeys.artist(demoMode, subprofileId);
    queryClient.setQueryData<StudioArtistView>(artistKey, (view) =>
      view
        ? { ...view, heroLayout: view.coverUrl ? choice : "portrait" }
        : view,
    );
    if (!demoMode) void queryClient.invalidateQueries({ queryKey: artistKey });
  }

  return { saveChoice, isSaving };
}
