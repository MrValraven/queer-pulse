import { useCallback, useMemo, useState } from "react";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import type { SectionsUpdate } from "./guideDocumentOps";
import {
  changedDraftFields,
  draftFromGuide,
  emptyGuideDraft,
  isDraftDirty,
  type GuideDraft,
  type GuideDraftField,
} from "./guideDraft";
import type { GuideLanguage } from "./guideWorkspace.data";

export interface GuideWorkspaceState {
  draft: GuideDraft;
  cleanDraft: GuideDraft;
  baseline: AdminResourceGuideDTO | null;
  isNew: boolean;
  isDirty: boolean;
  language: GuideLanguage;
  setLanguage: (language: GuideLanguage) => void;
  updateDraft: (changes: Partial<GuideDraft>) => void;
  updateSections: (language: GuideLanguage, update: SectionsUpdate) => void;
  replaceDraft: (next: GuideDraft) => void;
  /**
   * `adoptServerFields` lists the fields the save SENT. When given with a
   * server copy, every other field the server holds differently is taken
   * from it, for a forced save that went over someone else's changes.
   */
  markSaved: (
    savedDraft: GuideDraft,
    saved: AdminResourceGuideDTO | null,
    adoptServerFields?: GuideDraftField[],
  ) => void;
  loadServerGuide: (guide: AdminResourceGuideDTO) => void;
  acceptStatusUpdate: (guide: AdminResourceGuideDTO) => void;
}

const CONTENT_FIELDS = [
  "title",
  "titlePt",
  "description",
  "descriptionPt",
  "category",
  "meta",
  "routePath",
  "sections",
  "sectionsPt",
] as const;

function hasSameContent(
  left: AdminResourceGuideDTO,
  right: AdminResourceGuideDTO,
): boolean {
  return CONTENT_FIELDS.every(
    (field) => JSON.stringify(left[field]) === JSON.stringify(right[field]),
  );
}

function copyDraftField<Field extends GuideDraftField>(
  target: GuideDraft,
  source: GuideDraft,
  field: Field,
): void {
  target[field] = source[field];
}

/** `target` with each listed field taken from `source`; `target` itself when
 *  the list is empty, so an untouched draft keeps its identity. */
function takeDraftFields(
  target: GuideDraft,
  source: GuideDraft,
  fields: readonly GuideDraftField[],
): GuideDraft {
  if (fields.length === 0) return target;
  const next = { ...target };
  for (const field of fields) copyDraftField(next, source, field);
  return next;
}

/**
 * The workspace's editing state. Seeded once from `initialGuide`; nothing
 * the query cache does later replaces the draft, and `baseline.updatedAt`
 * moves only on a save, an explicit reload or a status action, so a
 * background refetch can never hide someone else's save from the conflict
 * check.
 *
 * Dirtiness compares against `cleanDraft` (the draft as last loaded or
 * saved) rather than the server copy, because the sanitizers serialize html
 * slightly differently from a browser and a fresh save must read as clean.
 */
export function useGuideWorkspace(
  initialGuide: AdminResourceGuideDTO | null,
): GuideWorkspaceState {
  const [initialDraft] = useState<GuideDraft>(() =>
    initialGuide ? draftFromGuide(initialGuide) : emptyGuideDraft(),
  );
  const [baseline, setBaseline] = useState(initialGuide);
  const [draft, setDraft] = useState<GuideDraft>(initialDraft);
  const [cleanDraft, setCleanDraft] = useState<GuideDraft>(initialDraft);
  const [language, setLanguage] = useState<GuideLanguage>("en");
  const isDirty = useMemo(
    () => isDraftDirty(draft, cleanDraft),
    [draft, cleanDraft],
  );

  const updateDraft = useCallback((changes: Partial<GuideDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  }, []);

  const updateSections = useCallback(
    (target: GuideLanguage, update: SectionsUpdate) => {
      setDraft((current) =>
        target === "en"
          ? { ...current, sections: update(current.sections) }
          : { ...current, sectionsPt: update(current.sectionsPt) },
      );
    },
    [],
  );

  const replaceDraft = useCallback((next: GuideDraft) => setDraft(next), []);

  const markSaved = useCallback(
    (
      savedDraft: GuideDraft,
      saved: AdminResourceGuideDTO | null,
      adoptServerFields?: GuideDraftField[],
    ) => {
      if (saved) setBaseline(saved);
      if (!saved || !adoptServerFields) {
        setCleanDraft(savedDraft);
        return;
      }
      const serverDraft = draftFromGuide(saved);
      const serverOnly = changedDraftFields(serverDraft, savedDraft).filter(
        (field) => field !== "slug" && !adoptServerFields.includes(field),
      );
      setCleanDraft(takeDraftFields(savedDraft, serverDraft, serverOnly));
      // A field typed into while the request ran keeps what was typed.
      setDraft((current) =>
        takeDraftFields(
          current,
          serverDraft,
          serverOnly.filter((field) => current[field] === savedDraft[field]),
        ),
      );
    },
    [],
  );

  const loadServerGuide = useCallback((guide: AdminResourceGuideDTO) => {
    const next = draftFromGuide(guide);
    setBaseline(guide);
    setDraft(next);
    setCleanDraft(next);
  }, []);

  const acceptStatusUpdate = useCallback((guide: AdminResourceGuideDTO) => {
    setBaseline((current) =>
      current
        ? {
            ...current,
            publishedAt: guide.publishedAt,
            lastReviewedOn: guide.lastReviewedOn,
            reviewedBy: guide.reviewedBy,
            reviewDueOn: guide.reviewDueOn,
            // A status action that raced someone's content save answers with
            // that save's `updatedAt`. Adopting it would hide their change
            // from the conflict check, so the stamp moves only when the
            // content still matches the copy this editor last saw.
            updatedAt: hasSameContent(current, guide)
              ? guide.updatedAt
              : current.updatedAt,
          }
        : current,
    );
  }, []);

  return {
    draft,
    cleanDraft,
    baseline,
    isNew: baseline === null,
    isDirty,
    language,
    setLanguage,
    updateDraft,
    updateSections,
    replaceDraft,
    markSaved,
    loadServerGuide,
    acceptStatusUpdate,
  };
}
