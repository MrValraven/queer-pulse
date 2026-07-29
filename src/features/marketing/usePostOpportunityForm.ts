import { useCallback, useState } from "react";
import { useRequiredFieldValidation } from "../../shared/hooks/useWizardForm";
import type {
  Cause,
  Commit,
  CreateOpportunityDto,
} from "./api/volunteering.api";

export interface TaskRow {
  title: string;
  description: string;
}
export interface CommitmentRow {
  label: string;
  detail: string;
}

export interface PostOpportunityState {
  org: string;
  role: string;
  cause: Cause;
  commit: Commit;
  time: string;
  location: string;
  skills: string;
  description: string;
  spotsTotal: string;
  applyRole: string;
  why: string;
  goodFor: string;
  teamIntro: string;
  team: string;
  partnerSlug: string;
  handle: string;
  tasks: TaskRow[];
  commitments: CommitmentRow[];
}

const EMPTY: PostOpportunityState = {
  org: "",
  role: "",
  cause: "rights",
  commit: "low",
  time: "",
  location: "",
  skills: "",
  description: "",
  spotsTotal: "",
  applyRole: "",
  why: "",
  goodFor: "",
  teamIntro: "",
  team: "",
  partnerSlug: "",
  handle: "",
  tasks: [{ title: "", description: "" }],
  commitments: [{ label: "", detail: "" }],
};

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

/** Fields that must be filled before the form can submit. */
export type RequiredField =
  "org" | "role" | "time" | "location" | "description" | "spotsTotal";

const REQUIRED: RequiredField[] = [
  "org",
  "role",
  "time",
  "location",
  "description",
  "spotsTotal",
];

/**
 * State + payload builder for the "Post an opportunity" form. Holds every field
 * (core + optional rich lists), exposes a generic setter plus repeatable-row
 * helpers, validates the required fields, and maps the whole thing onto the
 * backend's `CreateOpportunityDto` (empty optional lists are dropped).
 */
export function usePostOpportunityForm() {
  const [state, setState] = useState<PostOpportunityState>(EMPTY);

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
    setState((s) => ({ ...s, tasks: [...s.tasks, { title: "", description: "" }] }));
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

  const requiredValidation = useRequiredFieldValidation({
    values: state,
    requiredFields: REQUIRED,
    buildError: () => "This field is required.",
  });
  const spotsNumber = Number.parseInt(state.spotsTotal, 10);
  const spotsValid = Number.isFinite(spotsNumber) && spotsNumber > 0;
  const valid = requiredValidation.isValid && spotsValid;

  const errorFor = (field: RequiredField): string | null => {
    if (
      field === "spotsTotal" &&
      state.spotsTotal.trim() &&
      !spotsValid &&
      requiredValidation.hasBeenSubmitted
    ) {
      return "Enter a number of spots greater than zero.";
    }
    return requiredValidation.errorFor(field);
  };

  const toDto = (): CreateOpportunityDto => {
    const org = state.org.trim();
    const role = state.role.trim();
    const skills = splitCommas(state.skills);
    const why = splitLines(state.why);
    const goodFor = splitLines(state.goodFor);
    const team = splitCommas(state.team);
    const tasks = state.tasks
      .filter((t) => t.title.trim())
      .map((t) => ({ title: t.title.trim(), desc: t.description.trim() }));
    const commitments = state.commitments
      .filter((c) => c.label.trim())
      .map((c) => ({ label: c.label.trim(), detail: c.detail.trim() }));
    return {
      org,
      role,
      cause: state.cause,
      commit: state.commit,
      time: state.time.trim(),
      location: state.location.trim(),
      desc: state.description.trim(),
      spotsTotal: spotsNumber,
      applyRole: state.applyRole.trim() || `${role} · ${org}`,
      ...(skills.length ? { skills } : {}),
      ...(why.length ? { why } : {}),
      ...(goodFor.length ? { goodFor } : {}),
      ...(state.teamIntro.trim() ? { teamIntro: state.teamIntro.trim() } : {}),
      ...(team.length ? { team } : {}),
      ...(tasks.length ? { tasks } : {}),
      ...(commitments.length ? { commitments } : {}),
      ...(state.partnerSlug.trim()
        ? { partnerSlug: state.partnerSlug.trim() }
        : {}),
      ...(state.handle.trim() ? { handle: state.handle.trim() } : {}),
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
    valid,
    errorFor,
    markTouched: requiredValidation.markSubmitted,
    toDto,
  };
}

export type PostOpportunityForm = ReturnType<typeof usePostOpportunityForm>;
