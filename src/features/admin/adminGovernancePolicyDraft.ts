import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { hasIncompleteAuthoredText } from "./adminGovernanceOverviewRows.utils";
import type {
  AdminOverviewResponseDTO,
  CouncilSeatEditBody,
  UpdateAdminOverviewBody,
} from "./api/adminGovernanceOverview.api";

/**
 * The Policy tab's page-level draft.
 *
 * The five sections used to be five independent editors, each with its own
 * local draft and its own "Save section" button. That made the one question an
 * editor actually has — "what is different between what I am looking at and
 * what members can read right now?" — unanswerable without saving section by
 * section and hoping. There is one draft here, one dirty state, and one save
 * that PATCHes only the sections that actually changed, so per-section "edited
 * by" metadata stays honest.
 */

export const POLICY_SECTION_IDS = [
  "health",
  "moderationSteps",
  "council",
  "principles",
  "decisions",
] as const;

export type PolicySectionId = (typeof POLICY_SECTION_IDS)[number];

/** The editable half of the overview response: the five row arrays, no meta. */
export type PolicyDraft = Pick<AdminOverviewResponseDTO, PolicySectionId>;

/** One `setState` per section, so each editor keeps the updater-function form
 *  `useOverviewRowReorder` and the row patch helpers already expect. */
export type PolicySectionSetters = {
  [SectionId in PolicySectionId]: Dispatch<
    SetStateAction<PolicyDraft[SectionId]>
  >;
};

function toDraft(overview: AdminOverviewResponseDTO): PolicyDraft {
  return {
    health: overview.health,
    moderationSteps: overview.moderationSteps,
    council: overview.council,
    principles: overview.principles,
    decisions: overview.decisions,
  };
}

/**
 * True when a section holds an AUTHORED row missing one of its languages. The
 * backend refuses such a save with a 400 an editor would have to decode, and a
 * blank line on the platform's public accountability record is worse than a
 * refused save, so the bar says so before anything is sent.
 */
function isSectionIncomplete(
  sectionId: PolicySectionId,
  draft: PolicyDraft,
): boolean {
  if (sectionId === "council") {
    return draft.council.some(
      (seat) => !seat.roleKey && hasIncompleteAuthoredText([seat.role]),
    );
  }
  if (sectionId === "principles") {
    return draft.principles.some(
      (principle) =>
        !principle.key &&
        hasIncompleteAuthoredText([principle.title, principle.text]),
    );
  }
  if (sectionId === "decisions") {
    return draft.decisions.some(
      (decision) =>
        !decision.key &&
        hasIncompleteAuthoredText([decision.lead, decision.body]),
    );
  }
  return false;
}

/**
 * A council seat on the way back to the backend. The read added a resolved
 * `member` for rendering; the API runs `forbidNonWhitelisted`, so echoing it
 * back would be a 400 that reads like nothing an editor did.
 */
function toCouncilSeatBody(
  seat: PolicyDraft["council"][number],
): CouncilSeatEditBody {
  return {
    memberId: seat.memberId,
    ...(seat.roleKey !== undefined ? { roleKey: seat.roleKey } : {}),
    ...(seat.role !== undefined ? { role: seat.role } : {}),
    tint: seat.tint,
  };
}

export interface AdminGovernancePolicyDraft {
  draft: PolicyDraft;
  /** The sections exactly as members can read them right now. */
  published: PolicyDraft;
  setSection: PolicySectionSetters;
  changedSectionIds: PolicySectionId[];
  /** Sections holding a half-translated authored row; blocks the save. */
  incompleteSectionIds: PolicySectionId[];
  /**
   * True while a council seat has nobody in it. A seat names a staff member,
   * so an empty one is refused by the backend; the bar says so first, in words
   * about the seat rather than a decoded 400.
   */
  hasUnseatedCouncilRow: boolean;
  isDirty: boolean;
  /** Throws the draft away and goes back to the published rows. */
  reset: () => void;
  /** Only the changed sections, ready to PATCH. Empty object when clean. */
  changedSectionsBody: UpdateAdminOverviewBody;
}

export function useAdminGovernancePolicyDraft(
  overview: AdminOverviewResponseDTO,
): AdminGovernancePolicyDraft {
  const published = useMemo(() => toDraft(overview), [overview]);
  const [draft, setDraft] = useState<PolicyDraft>(published);

  // A structural key, not the object identity: react-query hands back a new
  // object on every refetch even when the payload is byte-identical, and
  // resetting the draft on that would eat an editor's work mid-sentence.
  const publishedKey = JSON.stringify(published);
  const lastPublishedKeyRef = useRef(publishedKey);
  useEffect(() => {
    if (lastPublishedKeyRef.current === publishedKey) return;
    lastPublishedKeyRef.current = publishedKey;
    setDraft(JSON.parse(publishedKey) as PolicyDraft);
  }, [publishedKey]);

  const setSection = useMemo(() => {
    // Built once and keyed by section id. The cast is the one place the
    // per-section row type is erased; every consumer gets it back through
    // `PolicySectionSetters`.
    const setters = {} as Record<string, Dispatch<SetStateAction<unknown[]>>>;
    for (const sectionId of POLICY_SECTION_IDS) {
      setters[sectionId] = (action) =>
        setDraft((previous) => ({
          ...previous,
          [sectionId]:
            typeof action === "function" ? action(previous[sectionId]) : action,
        }));
    }
    return setters as unknown as PolicySectionSetters;
  }, []);

  const changedSectionIds = useMemo(
    () =>
      POLICY_SECTION_IDS.filter(
        (sectionId) =>
          JSON.stringify(draft[sectionId]) !==
          JSON.stringify(published[sectionId]),
      ),
    [draft, published],
  );

  const incompleteSectionIds = useMemo(
    () =>
      changedSectionIds.filter((sectionId) =>
        isSectionIncomplete(sectionId, draft),
      ),
    [changedSectionIds, draft],
  );

  const hasUnseatedCouncilRow = useMemo(
    () => draft.council.some((seat) => !seat.memberId),
    [draft.council],
  );

  const changedSectionsBody = useMemo(() => {
    const body: UpdateAdminOverviewBody = {};
    for (const sectionId of changedSectionIds) {
      // Assigning through the union needs the per-section type back; each key
      // of the body matches the same key of the draft by construction. Council
      // is the exception: its rows carry a read-only `member` the write side
      // does not accept.
      Object.assign(body, {
        [sectionId]:
          sectionId === "council"
            ? draft.council.map(toCouncilSeatBody)
            : draft[sectionId],
      });
    }
    return body;
  }, [changedSectionIds, draft]);

  const reset = useCallback(() => {
    setDraft(JSON.parse(JSON.stringify(published)) as PolicyDraft);
  }, [published]);

  return {
    draft,
    published,
    setSection,
    changedSectionIds,
    incompleteSectionIds,
    hasUnseatedCouncilRow,
    isDirty: changedSectionIds.length > 0,
    reset,
    changedSectionsBody,
  };
}
