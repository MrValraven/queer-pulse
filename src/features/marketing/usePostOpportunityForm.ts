import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useMyCommunitiesResolving } from "../communities/api/useMyCommunities";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { usePostOpportunityValidation } from "./usePostOpportunityValidation";
import {
  EMPTY,
  type CommitmentRow,
  type PostOpportunityState,
  type TaskRow,
} from "./postOpportunityState";
import type { RequiredField } from "./postVolunteerOpportunity.data";
import type {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from "./api/volunteering.api";

/** Re-exported so call sites keep reading the form's own types from the form's
 *  own module. `RequiredField` is defined alongside its labels and control ids
 *  in `postVolunteerOpportunity.data`; the state shape in
 *  `postOpportunityState`; the missing-field entry in the validation module. */
export type { RequiredField };
export type {
  PostOpportunityState,
  TaskRow,
  CommitmentRow,
} from "./postOpportunityState";
export type { MissingFormField } from "./usePostOpportunityValidation";

const splitLines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
const splitCommas = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** The "who applies as" fallback shown live once Role/Org are filled, and
 *  used at submit time when the field itself was never touched. */
export const defaultApplyRole = (role: string, org: string): string =>
  [role.trim(), org.trim()].filter(Boolean).join(" · ");

/**
 * State + payload builder for the "Post an opportunity" form. Holds every field
 * (core + optional rich lists), exposes a generic setter plus repeatable-row
 * helpers, validates the required fields, and maps the whole thing onto the
 * backend's `CreateOpportunityDto` (empty optional lists are dropped) or, for
 * the edit flow, `UpdateOpportunityDto` (every field always sent, so a
 * cleared field explicitly clears it server-side).
 *
 * Pass `initial` (the edit flow's `opportunityToFormState(opp)`) to seed the
 * form from an existing opportunity instead of a blank one — this also skips
 * the poster-account auto-prefill below, since the seed already carries the
 * real values.
 */
export function usePostOpportunityForm(initial?: PostOpportunityState) {
  const [state, setState] = useState<PostOpportunityState>(initial ?? EMPTY);
  const { user } = useAuth();
  const stewardedCommunities = useMyCommunityOptions({
    roles: ["owner", "mod"],
  });
  const membershipsResolving = useMyCommunitiesResolving();

  // Seed the contact handle + organisation from the poster's own account,
  // each exactly once, by adjusting state during render (React's recommended
  // pattern over a setState-in-effect — same latch shape as
  // EndorseSubprofileModal's note prefill). The organisation prefill waits on
  // `!membershipsResolving` so it doesn't latch onto the synchronous empty
  // placeholder before the real membership list has loaded. Both latches
  // start pre-tripped when editing, since `initial` already carries the
  // opportunity's real values.
  const [handlePrefilled, setHandlePrefilled] = useState(Boolean(initial));
  if (!handlePrefilled && user) {
    setHandlePrefilled(true);
    if (!state.handle) {
      setState((s) => ({ ...s, handle: `@${user.profile.slug}` }));
    }
  }

  const [communitySlugPrefilled, setCommunitySlugPrefilled] = useState(
    Boolean(initial),
  );
  if (!communitySlugPrefilled && !membershipsResolving) {
    setCommunitySlugPrefilled(true);
    const [stewarded] = stewardedCommunities;
    if (stewarded && !state.communitySlug && !state.partnerSlug) {
      setState((s) => ({
        ...s,
        communitySlug: stewarded.slug,
        org: stewarded.name,
      }));
    }
  }

  const set = useCallback(
    <K extends keyof PostOpportunityState>(
      key: K,
      value: PostOpportunityState[K],
    ) => setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const setTask = (i: number, patch: Partial<TaskRow>) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  const addTask = () =>
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { title: "", description: "" }],
    }));
  const removeTask = (i: number) =>
    setState((s) => ({ ...s, tasks: s.tasks.filter((_, idx) => idx !== i) }));

  const setCommitment = (i: number, patch: Partial<CommitmentRow>) =>
    setState((s) => ({
      ...s,
      commitments: s.commitments.map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    }));
  const addCommitment = () =>
    setState((s) => ({
      ...s,
      commitments: [...s.commitments, { label: "", detail: "" }],
    }));
  const removeCommitment = (i: number) =>
    setState((s) => ({
      ...s,
      commitments: s.commitments.filter((_, idx) => idx !== i),
    }));

  const validation = usePostOpportunityValidation(state);
  const { spotsNumber } = validation;

  const toDto = (): CreateOpportunityDto => {
    const org = state.org.trim();
    const role = state.role.trim();
    const skills = splitCommas(state.skills);
    const why = splitLines(state.why);
    const goodFor = splitLines(state.goodFor);
    const tasks = state.tasks
      .filter((t) => t.title.trim())
      .map((t) => ({ title: t.title.trim(), desc: t.description.trim() }));
    const commitments = state.commitments
      .filter((c) => c.label.trim())
      .map((c) => ({ label: c.label.trim(), detail: c.detail.trim() }));
    return {
      org,
      role,
      causes: state.causes,
      commit: state.commit,
      time: state.time.trim(),
      location: state.location.trim(),
      desc: state.description.trim(),
      spotsTotal: spotsNumber,
      applyRole: state.applyRole.trim() || defaultApplyRole(role, org),
      ...(skills.length ? { skills } : {}),
      ...(why.length ? { why } : {}),
      ...(goodFor.length ? { goodFor } : {}),
      ...(state.teamIntro.trim() ? { teamIntro: state.teamIntro.trim() } : {}),
      ...(state.team.length ? { team: state.team } : {}),
      ...(tasks.length ? { tasks } : {}),
      ...(commitments.length ? { commitments } : {}),
      ...(state.partnerSlug.trim()
        ? { partnerSlug: state.partnerSlug.trim() }
        : {}),
      ...(state.communitySlug.trim()
        ? { communitySlug: state.communitySlug.trim() }
        : {}),
      ...(state.handle.trim() ? { handle: state.handle.trim() } : {}),
    };
  };

  /** The edit flow's PATCH payload. Unlike `toDto`, every updatable field is
   *  always sent (never conditionally omitted) — the form always represents
   *  the FULL desired state, so an emptied field explicitly clears it rather
   *  than leaving it untouched server-side. `handle`/`team` are creation-only
   *  (see `UpdateOpportunityDto`) and aren't part of this payload. */
  const toUpdateDto = (): UpdateOpportunityDto => {
    const org = state.org.trim();
    const role = state.role.trim();
    const tasks = state.tasks
      .filter((t) => t.title.trim())
      .map((t) => ({ title: t.title.trim(), desc: t.description.trim() }));
    const commitments = state.commitments
      .filter((c) => c.label.trim())
      .map((c) => ({ label: c.label.trim(), detail: c.detail.trim() }));
    return {
      org,
      role,
      causes: state.causes,
      commit: state.commit,
      time: state.time.trim(),
      location: state.location.trim(),
      desc: state.description.trim(),
      spotsTotal: spotsNumber,
      applyRole: state.applyRole.trim() || defaultApplyRole(role, org),
      skills: splitCommas(state.skills),
      why: splitLines(state.why),
      goodFor: splitLines(state.goodFor),
      teamIntro: state.teamIntro.trim(),
      tasks,
      commitments,
      partnerSlug: state.partnerSlug.trim(),
      communitySlug: state.communitySlug.trim(),
    };
  };

  return {
    state,
    set,
    setTask,
    addTask,
    removeTask,
    setCommitment,
    addCommitment,
    removeCommitment,
    valid: validation.isValid,
    missingFields: validation.missingFields,
    isTaskTitleMissing: validation.isTaskTitleMissing,
    isCommitmentLabelMissing: validation.isCommitmentLabelMissing,
    errorFor: validation.errorFor,
    markTouched: validation.markTouched,
    toDto,
    toUpdateDto,
  };
}

export type PostOpportunityForm = ReturnType<typeof usePostOpportunityForm>;
