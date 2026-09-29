import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SkinChapterEditor } from "./SkinChapterEditor";

/**
 * The "Page blocks" pane: the persona's page in chapters, one per
 * `?chapter=`. The therapist's are written by hand; every other kind's are
 * derived from its sections and family blocks (`skinChapters.ts`). Every
 * control writes the shared draft and saves with the global "Save all".
 */
export function SubprofileSkinBlocksEditor() {
  const { skinBlocks } = useSubprofileEditorContext();
  if (!skinBlocks.hasBlocks) return null;
  return <SkinChapterEditor editor={skinBlocks} />;
}
