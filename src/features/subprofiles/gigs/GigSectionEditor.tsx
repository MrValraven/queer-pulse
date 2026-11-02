import { useRef, useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../api/subprofiles.api";
import type { SubprofileSectionView } from "../api/subprofiles.adapters";
import { emptyItem } from "../subprofileSectionEditorRows";
import { SectionEditorAddFooter } from "../SectionEditorAddFooter";
import type { SectionEditorDrawerState } from "../SectionEditorDialogs";
import { useSubprofileEditorContext } from "../subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import { templateItemsFor } from "../subprofileTemplates.data";
import { useSectionEditorFocusAnnounce } from "../useSectionEditorFocusAnnounce";
import { useSectionRowActions } from "../useSectionRowActions";
import editorStyles from "../SubprofileEditor.module.css";
import { gigDateParts } from "./gigDate";
import { GigItemDrawer } from "./GigItemDrawer";
import { GigRowGroup } from "./GigRowGroup";
import { groupGigRows } from "./gigRows";
import { useGigSectionActions } from "./useGigSectionActions";

/**
 * The Gigs chapter of the persona editor: the flat, persisted gig order split
 * into an Upcoming group and a Past group (same `isUpcoming` rule as the public
 * stage page), the Add footer, and the purpose-built `GigItemDrawer`.
 * CONTROLLED by `SubprofileEditorContext`, like the generic section editor.
 *
 * Props match the generic editor so `SubprofileSectionEditor` can dispatch to
 * either. `isInChapter` needs no wrapper here (each group carries its own
 * container) and `isStudioBacked` is accepted but gigs are never studio backed.
 */
export function GigSectionEditor({
  subprofileId,
  section,
  isFeatureHidden = false,
  kind,
}: {
  subprofileId: string;
  section: SubprofileSectionView;
  kind?: SubprofileKind;
  isInChapter?: boolean;
  isFeatureHidden?: boolean;
  isStudioBacked?: boolean;
}) {
  const { t, language } = useTranslation();
  const { sectionRows, setSectionRows, meta } = useSubprofileEditorContext();
  const rows = sectionRows[section.section] ?? [];
  const [drawerState, setDrawerState] =
    useState<SectionEditorDrawerState | null>(null);
  // null follows the automatic rule (open when no gig is upcoming or a past
  // gig has no readable date); a boolean is the person's own choice.
  const [pastOpenChoice, setPastOpenChoice] = useState<boolean | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { announcement, announce, focusRowOrAdd } =
    useSectionEditorFocusAnnounce(addButtonRef, rows);

  const groups = groupGigRows(rows);
  const hasUndatedPastGig = groups.past.some(({ row }) => {
    const { precision } = gigDateParts(row.date, language);
    return precision === "none" || precision === "unknown";
  });
  const isPastOpen =
    pastOpenChoice ?? (groups.upcoming.length === 0 || hasUndatedPastGig);

  const isAtMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const hasAddButton = !isAtMax;
  const canFeature = !isFeatureHidden;
  const canInsertExamples =
    rows.length === 0 && templateItemsFor(section.section, kind) !== undefined;
  const jumpTargetUid = hasAddButton
    ? null
    : ((groups.upcoming[0] ?? groups.past[0])?.row._uid ?? null);

  const { remove, insertExamples, toggleFeatured } = useSectionRowActions({
    section,
    kind,
    rows,
    setSectionRows,
    isGallery: false,
    announce,
    focusRowOrAdd,
    drawerState,
    setDrawerState,
  });
  const { move, reorder, saveDraft } = useGigSectionActions({
    rows,
    setSectionRows,
    drawerState,
    setDrawerState,
    announce,
    onLanded: (landedGroup) => {
      if (landedGroup === "past") setPastOpenChoice(true);
    },
  });

  const editingRow =
    drawerState?.mode === "edit"
      ? rows.find((row) => row._uid === drawerState.uid)
      : undefined;
  const drawerItem =
    drawerState?.mode === "add" ? emptyItem("gigs") : editingRow;

  const rowHandlers = {
    canFeature,
    jumpTargetUid,
    onEdit: (rowUid: string) => setDrawerState({ mode: "edit", uid: rowUid }),
    onMoveUp: (rowUid: string) => move(rowUid, -1),
    onMoveDown: (rowUid: string) => move(rowUid, 1),
    onToggleFeature: toggleFeatured,
    onRemove: remove,
  };

  return (
    <>
      {/* Always mounted, per `SkinChapterGroupCard`'s row-check pattern. */}
      <p aria-live="polite" className="visuallyHidden">
        {announcement}
      </p>
      {rows.length === 0 && (
        <p className={editorStyles.emptySection}>
          {t("subprofiles:sectionEditor.empty")}
        </p>
      )}
      {canInsertExamples && (
        <Button variant="ghost" onClick={insertExamples}>
          {t("subprofiles:template.insertExamples")}
        </Button>
      )}

      <GigRowGroup
        group="upcoming"
        entries={groups.upcoming}
        onReorder={(from, to) => reorder("upcoming", from, to)}
        {...rowHandlers}
      />
      <GigRowGroup
        group="past"
        entries={groups.past}
        isOpen={isPastOpen}
        onToggleOpen={() => setPastOpenChoice(!isPastOpen)}
        onReorder={(from, to) => reorder("past", from, to)}
        {...rowHandlers}
      />

      <SectionEditorAddFooter
        isGallery={false}
        isGalleryFull={false}
        isAtMax={isAtMax}
        hasAddButton={hasAddButton}
        sectionLabelKey={section.labelKey}
        addLabelKey="subprofiles:gigEditor.add"
        addButtonRef={addButtonRef}
        onAdd={() => setDrawerState({ mode: "add" })}
      />
      {drawerState && drawerItem && (
        <GigItemDrawer
          subprofileId={subprofileId}
          section={section}
          item={drawerItem}
          isNew={drawerState.mode === "add"}
          canFeature={canFeature}
          authorName={meta.displayName}
          onSave={saveDraft}
          onClose={() => setDrawerState(null)}
        />
      )}
    </>
  );
}
