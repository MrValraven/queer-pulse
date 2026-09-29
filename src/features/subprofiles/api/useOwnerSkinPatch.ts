import { useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isPersonaEditConflict } from "./personaEditConflict";
import { fetchOwnerSubprofile } from "./useSubprofile";
import { useSubprofileMutations } from "./useSubprofileMutations";
import type {
  SkinData,
  SubprofileDTO,
  UpdateSubprofileDTO,
} from "./subprofiles.api";

/** Top-level persona fields that may ride along with a skin patch (the
 *  therapist capacity switch sends `availability`, say). The `skinData` and
 *  the precondition are the hook's own. */
export type OwnerSkinPatchFields = Omit<
  UpdateSubprofileDTO,
  "skinData" | "expectedEditVersion"
>;

/** Builds the whole `skinData` to save from the persona's freshly read one. */
export type SkinDataTransform = (freshSkinData: SkinData | null) => SkinData;

/**
 * An owner-page write to one persona's `skinData` that keeps a co-owner's
 * newer blocks (ENG-451). The PATCH replaces the whole column, so the save
 * reads the owner view afresh at save time, applies `transform` to that
 * `skinData`, and sends it with the fresh `editVersion` as its
 * `expectedEditVersion`. When someone saves in between, the server answers
 * `PERSONA_EDIT_CONFLICT`: the hook reads again and retries once, and a
 * second conflict rejects so the caller shows its own error toast.
 *
 * The fresh read calls the owner query's own fetch (demo reads the mock
 * registry, live calls GET /subprofiles/:id) outside the query cache, as
 * `useSubprofileReload` does: a failed read only rejects this save, so the
 * owner query the editor observes keeps its state and no global error toast
 * joins the caller's own. The `update` mutation writes the saved owner view
 * into that query. `isSaving` covers the read and the write.
 */
export function useOwnerSkinPatch(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const { update } = useSubprofileMutations();
  const [isSaving, setIsSaving] = useState(false);

  async function patchFromFreshView(
    transform: SkinDataTransform,
    fields: OwnerSkinPatchFields,
  ): Promise<SubprofileDTO> {
    const fresh = await fetchOwnerSubprofile(demoMode, subprofileId);
    if (!fresh) throw new Error("Subprofile not found");
    return update.mutateAsync({
      id: subprofileId,
      dto: {
        ...fields,
        skinData: transform(fresh.skinData),
        expectedEditVersion: fresh.editVersion,
      },
    });
  }

  async function patchSkin(
    transform: SkinDataTransform,
    fields: OwnerSkinPatchFields = {},
  ): Promise<SubprofileDTO> {
    setIsSaving(true);
    try {
      try {
        return await patchFromFreshView(transform, fields);
      } catch (error) {
        if (!isPersonaEditConflict(error)) throw error;
        return await patchFromFreshView(transform, fields);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return { patchSkin, isSaving };
}
