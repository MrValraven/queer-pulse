import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileSection } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { itemsToInputDto } from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useAffiliations } from "./api/useAffiliations";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import type { EditorRowsState } from "./useEditorRowsState";
import type { SocialRow } from "./subprofileEditorContext";
import {
  diffMeta,
  diffRows,
  diffRowsBy,
  rowDiffToChange,
  type PendingChange,
  type RowDiffCounts,
} from "./subprofileEditorDiff";

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

export interface EditorSaveGraph {
  /** Live, itemized list of every unsaved change across all areas. */
  pending: PendingChange[];
  dirty: boolean;
  canSave: boolean;
  saving: boolean;
  saveAll: () => Promise<void>;
}

/**
 * The editor's ONE global save: derives the live itemized `pending` diff across
 * meta + every list area, the `dirty`/`canSave`/`saving` flags, and the
 * `saveAll()` fan-out that commits each dirty area's mutation (advancing that
 * area's baseline only on ITS success, so a partial failure keeps just the
 * failed areas dirty). Extracted from `SubprofileEditorProvider` so the provider
 * is thin wiring; the save-shape diff helpers above live here alongside it.
 */
export function useEditorSaveGraph(
  subprofile: SubprofileView,
  meta: SubprofileMetaEditor,
  rows: EditorRowsState,
): EditorSaveGraph {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { update, replaceSection, replaceSocials } = useSubprofileMutations();
  const { replace: replaceAffiliations } = useAffiliations(subprofile.id);

  const {
    sectionRows,
    sectionBaseline,
    setSectionBaseline,
    socialRows,
    socialBaseline,
    setSocialBaseline,
    affiliationRows,
    affiliationBaseline,
    setAffiliationBaseline,
    sectionLabelKeys,
  } = rows;

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
      // Snapshot the meta values NOW, alongside the patch we're about to send,
      // so `markSaved` advances the baseline to exactly what was PATCHed — not
      // to whatever the user has typed by the time the request resolves.
      const savedMetaSnapshot = meta.metaSnapshot();
      tasks.push({
        labelKey: "subprofiles:pending.area.meta",
        run: () => update.mutateAsync({ id: subprofile.id, dto: patch }),
        commit: () => meta.markSaved(savedMetaSnapshot), // demo-safe baseline advance
      });
    }
    for (const section of Object.keys(sectionRows)) {
      const sectionRowsForKey = sectionRows[section] ?? [];
      if (!hasRowChange(diffRows(sectionRowsForKey, sectionBaseline[section] ?? [])))
        continue;
      tasks.push({
        labelKey: sectionLabelKeys[section] ?? "subprofiles:pending.area.meta",
        run: () =>
          replaceSection.mutateAsync({
            id: subprofile.id,
            section: section as SubprofileSection,
            items: itemsToInputDto(sectionRowsForKey),
          }),
        commit: () =>
          setSectionBaseline((current) => ({ ...current, [section]: sectionRowsForKey })),
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
    // Client-error responses name the actual problem — a 400 names an offending
    // collaborator/affiliation entry, a 409 a taken address/handle, a 422 an
    // unmet publish rule. Surface that message when a single area failed; for
    // multi-area failures (or opaque 5xx) fall back to listing the areas.
    const rejection = results.find((result) => result.status === "rejected");
    const detail =
      failed.length === 1 &&
      rejection?.reason instanceof ApiError &&
      [400, 409, 422].includes(rejection.reason.status)
        ? rejection.reason.message
        : null;
    showToast(detail ?? t("subprofiles:pending.saveError", { areas: failed.join(", ") }), "error");
  }

  return { pending, dirty, canSave, saving, saveAll };
}
