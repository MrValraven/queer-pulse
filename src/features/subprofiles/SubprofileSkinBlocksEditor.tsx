import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SkinChapterEditor } from "./SkinChapterEditor";
import { SkinBlockCard } from "./SkinBlockCard";

/**
 * The "Page blocks" pane: renders the persona's editable `SkinData` blocks (its
 * kind's own table, else its skin family's) as labelled inputs / list editors.
 * Controlled by `useSubprofileSkinBlocksEditor` off the shared editor context,
 * with no local save;
 * edits ride the single global "Save all" (folded into the meta `skinData`
 * PATCH). Only mounted for families that have editable blocks (rail-gated), but
 * renders nothing gracefully if it ever mounts for one that doesn't.
 */
export function SubprofileSkinBlocksEditor() {
  const { skinBlocks } = useSubprofileEditorContext();
  if (!skinBlocks.hasBlocks) return null;
  // Kinds with chapters (therapist) get the chaptered editor; every other
  // family keeps the card list below.
  if (skinBlocks.chapters.length > 0) {
    return <SkinChapterEditor editor={skinBlocks} />;
  }

  return (
    <div className="ed-grid">
      {skinBlocks.descriptors.map((block) => (
        <SkinBlockCard key={block.blockKey} block={block} editor={skinBlocks} />
      ))}
    </div>
  );
}
