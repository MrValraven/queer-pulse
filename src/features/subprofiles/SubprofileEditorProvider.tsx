import { useCallback, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { useSubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useEditorRowsState } from "./useEditorRowsState";
import { useEditorSaveGraph } from "./useEditorSaveGraph";
import {
  SubprofileEditorContext,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";

/**
 * Owns every editable area of ONE persona's editor and the single global save.
 * Mounted per persona by `SubprofileEditorShell` (keyed on `subprofile.id`), so
 * all working state re-seeds when the route lands on a different persona.
 *
 * Thin wiring: the list working-state + baselines live in `useEditorRowsState`,
 * the live diff / dirty flags / `saveAll` fan-out in `useEditorSaveGraph`, and
 * the meta fields in `useSubprofileMetaEditor`. This component just composes
 * them, hooks up the unsaved-changes guard + "Discard all", and publishes the
 * shared context.
 *
 * Meta dirtiness clears via `markSaved` (the meta hook advances its own
 * baseline to the sent snapshot); each list area advances its own baseline to
 * the just-saved draft on that area's success, so a partial failure keeps only
 * the failed areas dirty.
 */
export function SubprofileEditorProvider({
  subprofile,
  children,
}: {
  subprofile: SubprofileView;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const meta = useSubprofileMetaEditor(subprofile);
  const skinBlocks = useSubprofileSkinBlocksEditor(subprofile);
  const rows = useEditorRowsState(subprofile);
  const { pending, dirty, canSave, saving, saveAll } = useEditorSaveGraph(
    subprofile,
    meta,
    skinBlocks,
    rows,
  );

  useUnsavedChangesGuard({
    active: dirty && !saving,
    confirmMessage: t("subprofiles:metaForm.leaveConfirm"),
    guardBackButton: true,
  });

  const discardAll = useCallback(() => {
    meta.reset();
    skinBlocks.reset();
    rows.resetRows();
  }, [meta, skinBlocks, rows]);

  const value: SubprofileEditorContextValue = {
    meta,
    skinBlocks,
    sectionRows: rows.sectionRows,
    setSectionRows: rows.setSectionRows,
    socialRows: rows.socialRows,
    setSocialRows: rows.setSocialRows,
    affiliationRows: rows.affiliationRows,
    setAffiliationRows: rows.setAffiliationRows,
    pending,
    dirty,
    saving,
    canSave,
    saveAll,
    discardAll,
  };

  return (
    <SubprofileEditorContext.Provider value={value}>
      {children}
    </SubprofileEditorContext.Provider>
  );
}
