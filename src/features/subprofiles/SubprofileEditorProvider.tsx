import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileReload } from "./api/useSubprofile";
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
 *
 * ENG-451 Reload: every area seeds once, on mount. After a save conflict the
 * alert's Reload refetches the persona and remounts the editor state below
 * (`key={seedGeneration}`), so meta, skin blocks, rows and sections all
 * re-seed from the fresh copy through their own mount-time seeding. The
 * member's edits stay on screen until they press Reload.
 */
export function SubprofileEditorProvider({
  subprofile,
  children,
}: {
  subprofile: SubprofileView;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const refetchSubprofile = useSubprofileReload(subprofile.id);
  const [seedGeneration, setSeedGeneration] = useState(0);
  const [reloadedSubprofile, setReloadedSubprofile] =
    useState<SubprofileView | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [hasReloadFailed, setHasReloadFailed] = useState(false);

  const reloadLatest = useCallback(() => {
    setIsReloading(true);
    setHasReloadFailed(false);
    refetchSubprofile()
      .then((latest) => {
        // `null`: the persona is gone for this member. The reload stored that
        // in the owner query, so the page swaps to its not-found state and
        // there is nothing to re-seed.
        if (!latest) return;
        setReloadedSubprofile(latest);
        setSeedGeneration((generation) => generation + 1);
        showToast(t("subprofiles:editConflict.reloadedToast"), "success");
      })
      // The editor stays as it was (edits, conflict alert and all); the
      // alert says the reload failed and Reload can be pressed again.
      .catch(() => setHasReloadFailed(true))
      .finally(() => setIsReloading(false));
  }, [refetchSubprofile, showToast, t]);

  // The query's readers re-render a tick after the refetch settles, so for
  // that tick the `subprofile` prop can still be the copy that conflicted.
  // Seed from the refetched copy until the prop has caught up with it.
  const seedSource =
    reloadedSubprofile &&
    reloadedSubprofile.editVersion > subprofile.editVersion
      ? reloadedSubprofile
      : subprofile;

  return (
    <SubprofileEditorState
      key={seedGeneration}
      subprofile={seedSource}
      reload={{
        reloadLatest,
        isReloading,
        hasReloadFailed,
        reloadGeneration: seedGeneration,
      }}
    >
      {children}
    </SubprofileEditorState>
  );
}

/** The Reload half of the editor context, owned by the outer provider so it
 *  survives the remount a Reload causes. */
type EditorReloadState = Pick<
  SubprofileEditorContextValue,
  "reloadLatest" | "isReloading" | "hasReloadFailed" | "reloadGeneration"
>;

/** The editor state for one seeding of the persona: composes the area hooks,
 *  the save graph and the leave guard, and publishes the shared context. */
function SubprofileEditorState({
  subprofile,
  reload,
  children,
}: {
  subprofile: SubprofileView;
  reload: EditorReloadState;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const meta = useSubprofileMetaEditor(subprofile);
  const rows = useEditorRowsState(subprofile);
  // Reads the section rows too, so a chapter's `section:<name>` control
  // (therapist topics) counts toward its chapter's fill.
  const skinBlocks = useSubprofileSkinBlocksEditor(
    subprofile,
    rows.sectionRows,
  );
  const {
    pending,
    dirty,
    canSave,
    saving,
    hasEditConflict,
    saveAll,
    getEditVersion,
    adoptEditVersion,
    markEditConflict,
  } = useEditorSaveGraph(subprofile, meta, skinBlocks, rows);

  useUnsavedChangesGuard({
    active: dirty && !saving,
    confirmMessage: t("subprofiles:metaForm.leaveConfirm"),
    // Offered only while the savebar's Save would be enabled.
    onSaveAndLeave: canSave ? saveAll : undefined,
    guardBackButton: true,
    // `?pane=` switches keep this provider (and the whole draft) mounted.
    shouldAllowQueryChanges: true,
  });

  const discardAll = useCallback(() => {
    meta.reset();
    skinBlocks.reset();
    rows.resetRows();
  }, [meta, skinBlocks, rows]);

  const value: SubprofileEditorContextValue = {
    subprofile,
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
    hasEditConflict,
    getEditVersion,
    adoptEditVersion,
    markEditConflict,
    ...reload,
    reseedSection: rows.reseedSection,
  };

  return (
    <SubprofileEditorContext.Provider value={value}>
      {children}
    </SubprofileEditorContext.Provider>
  );
}
