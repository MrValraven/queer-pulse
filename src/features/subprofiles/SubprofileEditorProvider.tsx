import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import type { SubprofileSection } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { itemsToInputDto } from "./api/subprofiles.adapters";
import {
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import { useSubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useAffiliations } from "./api/useAffiliations";
import {
  diffMeta,
  diffRows,
  diffRowsBy,
  rowDiffToChange,
  type PendingChange,
  type RowDiffCounts,
} from "./subprofileEditorDiff";
import {
  SubprofileEditorContext,
  withAffiliationUid,
  withSocialUid,
  type SocialRow,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";

type SectionRowMap = Record<string, SubprofileEditorRow[]>;

/** Save-shape projection for a social row (what the PUT actually persists),
 *  so a uid/order-only change never reads as an edit in the diff. */
const socialComparable = (row: SocialRow) => ({
  platform: row.platform,
  urlOrHandle: row.urlOrHandle,
});
const affiliationComparable = (row: AffiliationRow) => ({
  targetType: row.targetType,
  targetSlug: row.targetSlug,
  role: row.role,
});

// The save path drops blank rows, so the diff must too — otherwise clicking
// "Add" (which appends an empty row) reads as an unsaved change and fires a
// no-op PUT. Diff (and detect change) on the same filtered lists we send.
const filledSocials = (rows: SocialRow[]) =>
  rows.filter((row) => row.urlOrHandle.trim());
const filledAffiliations = (rows: AffiliationRow[]) =>
  rows.filter((row) => row.targetSlug.trim());

const hasRowChange = (counts: RowDiffCounts) =>
  counts.added > 0 || counts.removed > 0 || counts.edited > 0 || counts.reordered;

/** Build the flat, immutable seed for one persona's list-rows. Both the live
 *  working state and the baseline are seeded from the SAME object so their
 *  `_uid`s match — seeding twice would mint fresh uids and read as a full
 *  add/remove churn. */
function seedRows(subprofile: SubprofileView) {
  return {
    sections: Object.fromEntries(
      subprofile.sections.map((section) => [
        section.section,
        section.items.map(withUid),
      ]),
    ),
    socials: subprofile.socialLinks.map(withSocialUid),
    affiliations: subprofile.affiliations.map((affiliation) =>
      withAffiliationUid({
        targetType: affiliation.targetType,
        targetSlug: affiliation.targetSlug,
        role: affiliation.role,
      }),
    ),
  };
}

/**
 * Owns every editable area of ONE persona's editor and the single global save.
 * Mounted per persona by `SubprofileEditorShell` (keyed on `subprofile.id`), so
 * all working state re-seeds when the route lands on a different persona.
 *
 * Meta dirtiness clears via the post-save refetch (the meta hook diffs against
 * the `subprofile` prop); the list areas advance their own baseline to the
 * just-saved draft on that area's success, so a partial failure keeps only the
 * failed areas dirty.
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
  const meta = useSubprofileMetaEditor(subprofile);
  const { update, replaceSection, replaceSocials } = useSubprofileMutations();
  const { replace: replaceAffiliations } = useAffiliations(subprofile.id);

  // Seed the working state + baselines ONCE per mount (the shell remounts this
  // whole subtree per persona via `key={subprofile.id}`). A lazy `useState`
  // initializer, so a post-save refetch of `subprofile` never re-seeds and
  // clobbers the in-progress draft — and both the live rows and their baseline
  // are seeded from the SAME object so their `_uid`s match (see `seedRows`).
  const [seed] = useState(() => seedRows(subprofile));
  const [sectionRows, setSectionRowsState] = useState<SectionRowMap>(seed.sections);
  const [sectionBaseline, setSectionBaseline] = useState<SectionRowMap>(seed.sections);
  const [socialRows, setSocialRows] = useState<SocialRow[]>(seed.socials);
  const [socialBaseline, setSocialBaseline] = useState<SocialRow[]>(seed.socials);
  const [affiliationRows, setAffiliationRows] = useState<AffiliationRow[]>(seed.affiliations);
  const [affiliationBaseline, setAffiliationBaseline] = useState<AffiliationRow[]>(seed.affiliations);

  const setSectionRows = useCallback((section: string, rows: SubprofileEditorRow[]) => {
    // Persona-wide single spotlight: featuring an item in one section clears any
    // featured item in EVERY other section (the backend applies this on save —
    // `applySection`'s cross-section clear). Enforcing it here at feature-time
    // keeps the editor + docked preview honest (never two spotlights) and stops
    // the drift where an un-re-seeded other section kept showing a spotlight the
    // save had silently cleared. `toggleRowFeature`/`commitDraftRow` already
    // handle single-select WITHIN a section; this extends it across sections.
    const featuring = rows.some((row) => row.isFeatured);
    setSectionRowsState((current) => {
      const next: SectionRowMap = { ...current, [section]: rows };
      if (featuring) {
        for (const key of Object.keys(next)) {
          if (key === section) continue;
          const others = next[key] ?? [];
          if (others.some((row) => row.isFeatured)) {
            next[key] = others.map((row) =>
              row.isFeatured ? { ...row, isFeatured: false } : row,
            );
          }
        }
      }
      return next;
    });
  }, []);

  const sectionLabelKeys = useMemo(
    () =>
      Object.fromEntries(
        subprofile.sections.map((section) => [section.section, section.labelKey]),
      ) as Record<string, string>,
    [subprofile.sections],
  );

  // Live itemized diff, recomputed each render (arrays are small).
  const pending: PendingChange[] = [];
  pending.push(...diffMeta(meta.metaSnapshot(), meta.baselineSnapshot()));
  for (const section of Object.keys(sectionRows)) {
    const change = rowDiffToChange(
      { kind: "section", section },
      sectionLabelKeys[section] ?? "subprofiles:pending.area.meta",
      diffRows(sectionRows[section] ?? [], sectionBaseline[section] ?? []),
    );
    if (change) pending.push(change);
  }
  const socialChange = rowDiffToChange(
    { kind: "socials" },
    "subprofiles:pending.area.socials",
    diffRowsBy(filledSocials(socialRows), filledSocials(socialBaseline), socialComparable),
  );
  if (socialChange) pending.push(socialChange);
  const affiliationChange = rowDiffToChange(
    { kind: "affiliations" },
    "subprofiles:pending.area.affiliations",
    diffRowsBy(
      filledAffiliations(affiliationRows),
      filledAffiliations(affiliationBaseline),
      affiliationComparable,
    ),
  );
  if (affiliationChange) pending.push(affiliationChange);

  const dirty = pending.length > 0;
  // `nameMissing`/`handleBlocked` disable the button outright (a save would be
  // rejected); `ctaMismatch` instead lets the click through so `saveAll` can
  // explain the label/link pairing in a toast, mirroring the old per-pane save.
  const canSave = dirty && !meta.nameMissing && !meta.handleBlocked;
  const saving =
    update.isPending ||
    replaceSection.isPending ||
    replaceSocials.isPending ||
    replaceAffiliations.isPending;

  useUnsavedChangesGuard({
    active: dirty && !saving,
    confirmMessage: t("subprofiles:metaForm.leaveConfirm"),
  });

  const discardAll = useCallback(() => {
    meta.reset();
    setSectionRowsState(sectionBaseline);
    setSocialRows(socialBaseline);
    setAffiliationRows(affiliationBaseline);
  }, [meta, sectionBaseline, socialBaseline, affiliationBaseline]);

  async function saveAll() {
    if (saving || !dirty) return;
    if (meta.nameMissing || meta.handleBlocked) return;
    if (meta.ctaMismatch) {
      showToast(t("subprofiles:metaForm.ctaMismatch"), "error");
      return;
    }
    const changedCount = pending.length;

    type SaveTask = { labelKey: string; run: () => Promise<unknown>; commit: () => void };
    const tasks: SaveTask[] = [];

    const patch = meta.buildMetaPatch();
    if (patch) {
      tasks.push({
        labelKey: "subprofiles:pending.area.meta",
        run: () => update.mutateAsync({ id: subprofile.id, dto: patch }),
        commit: () => meta.markSaved(), // advance the meta baseline (demo-safe)
      });
    }
    for (const section of Object.keys(sectionRows)) {
      const rows = sectionRows[section] ?? [];
      if (!hasRowChange(diffRows(rows, sectionBaseline[section] ?? []))) continue;
      tasks.push({
        labelKey: sectionLabelKeys[section] ?? "subprofiles:pending.area.meta",
        run: () =>
          replaceSection.mutateAsync({
            id: subprofile.id,
            section: section as SubprofileSection,
            items: itemsToInputDto(rows),
          }),
        commit: () => setSectionBaseline((current) => ({ ...current, [section]: rows })),
      });
    }
    if (
      hasRowChange(
        diffRowsBy(filledSocials(socialRows), filledSocials(socialBaseline), socialComparable),
      )
    ) {
      const items = filledSocials(socialRows).map(({ platform, urlOrHandle }) => ({
        platform,
        urlOrHandle: urlOrHandle.trim(),
      }));
      tasks.push({
        labelKey: "subprofiles:pending.area.socials",
        run: () => replaceSocials.mutateAsync({ id: subprofile.id, items }),
        commit: () => setSocialBaseline(socialRows),
      });
    }
    if (
      hasRowChange(
        diffRowsBy(
          filledAffiliations(affiliationRows),
          filledAffiliations(affiliationBaseline),
          affiliationComparable,
        ),
      )
    ) {
      const items = filledAffiliations(affiliationRows).map(
        ({ targetType, targetSlug, role }) => ({ targetType, targetSlug: targetSlug.trim(), role }),
      );
      tasks.push({
        labelKey: "subprofiles:pending.area.affiliations",
        run: () => replaceAffiliations.mutateAsync(items),
        commit: () => setAffiliationBaseline(affiliationRows),
      });
    }
    if (!tasks.length) return;

    const results = await Promise.allSettled(tasks.map((task) => task.run()));
    const failed: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") tasks[index]!.commit();
      else failed.push(t(tasks[index]!.labelKey));
    });

    if (failed.length === 0) {
      showToast(t("subprofiles:pending.savedToast", { count: changedCount }), "success");
      return;
    }
    // Client-error responses name the actual problem — a 400 names an
    // offending collaborator/affiliation entry, a 409 a taken address/handle, a
    // 422 an unmet publish rule. Surface that message when a single area failed;
    // for multi-area failures (or opaque 5xx) fall back to listing the areas.
    const rejection = results.find((result) => result.status === "rejected");
    const detail =
      failed.length === 1 &&
      rejection?.reason instanceof ApiError &&
      [400, 409, 422].includes(rejection.reason.status)
        ? rejection.reason.message
        : null;
    showToast(detail ?? t("subprofiles:pending.saveError", { areas: failed.join(", ") }), "error");
  }

  const value: SubprofileEditorContextValue = {
    meta,
    sectionRows,
    setSectionRows,
    socialRows,
    setSocialRows,
    affiliationRows,
    setAffiliationRows,
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
