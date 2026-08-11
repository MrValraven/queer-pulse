import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import {
  withAffiliationUid,
  withSocialUid,
  type SocialRow,
} from "./subprofileEditorContext";

export type SectionRowMap = Record<string, SubprofileEditorRow[]>;

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

export interface EditorRowsState {
  sectionRows: SectionRowMap;
  setSectionRows: (section: string, rows: SubprofileEditorRow[]) => void;
  sectionBaseline: SectionRowMap;
  setSectionBaseline: Dispatch<SetStateAction<SectionRowMap>>;
  socialRows: SocialRow[];
  setSocialRows: (rows: SocialRow[]) => void;
  socialBaseline: SocialRow[];
  setSocialBaseline: (rows: SocialRow[]) => void;
  affiliationRows: AffiliationRow[];
  setAffiliationRows: (rows: AffiliationRow[]) => void;
  affiliationBaseline: AffiliationRow[];
  setAffiliationBaseline: (rows: AffiliationRow[]) => void;
  /** Section → i18n label key, for the pending list + save toasts. */
  sectionLabelKeys: Record<string, string>;
  /** Reset every list area back to its loaded/last-saved baseline. */
  resetRows: () => void;
}

/**
 * Owns the editor's list working-state — each content section's rows, the
 * social links, and the affiliations — plus each area's own baseline (advanced
 * to the just-saved draft on that area's save success, so a partial failure
 * keeps only the failed areas dirty). Seeded ONCE per mount via lazy `useState`
 * (the shell remounts this subtree per persona via `key={subprofile.id}`), so a
 * post-save refetch never re-seeds and clobbers an in-progress draft. Lifted out
 * of `SubprofileEditorProvider` so the provider stays thin wiring.
 */
export function useEditorRowsState(subprofile: SubprofileView): EditorRowsState {
  const [seed] = useState(() => seedRows(subprofile));
  const [sectionRows, setSectionRowsState] = useState<SectionRowMap>(seed.sections);
  const [sectionBaseline, setSectionBaseline] = useState<SectionRowMap>(seed.sections);
  const [socialRows, setSocialRows] = useState<SocialRow[]>(seed.socials);
  const [socialBaseline, setSocialBaseline] = useState<SocialRow[]>(seed.socials);
  const [affiliationRows, setAffiliationRows] = useState<AffiliationRow[]>(
    seed.affiliations,
  );
  const [affiliationBaseline, setAffiliationBaseline] = useState<AffiliationRow[]>(
    seed.affiliations,
  );

  const setSectionRows = useCallback(
    (section: string, rows: SubprofileEditorRow[]) => {
      // Persona-wide single spotlight: featuring an item in one section clears
      // any featured item in EVERY other section (the backend applies this on
      // save — `applySection`'s cross-section clear). Enforcing it here at
      // feature-time keeps the editor + docked preview honest (never two
      // spotlights) and stops the drift where an un-re-seeded other section kept
      // showing a spotlight the save had silently cleared. `toggleRowFeature`/
      // `commitDraftRow` already handle single-select WITHIN a section; this
      // extends it across sections.
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
    },
    [],
  );

  const sectionLabelKeys = useMemo(
    () =>
      Object.fromEntries(
        subprofile.sections.map((section) => [section.section, section.labelKey]),
      ) as Record<string, string>,
    [subprofile.sections],
  );

  const resetRows = useCallback(() => {
    setSectionRowsState(sectionBaseline);
    setSocialRows(socialBaseline);
    setAffiliationRows(affiliationBaseline);
  }, [sectionBaseline, socialBaseline, affiliationBaseline]);

  return {
    sectionRows,
    setSectionRows,
    sectionBaseline,
    setSectionBaseline,
    socialRows,
    setSocialRows,
    socialBaseline,
    setSocialBaseline,
    affiliationRows,
    setAffiliationRows,
    affiliationBaseline,
    setAffiliationBaseline,
    sectionLabelKeys,
    resetRows,
  };
}
