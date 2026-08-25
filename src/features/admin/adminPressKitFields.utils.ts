import type {
  AdminPressContactDTO,
  AdminPressCoverageDTO,
  PressContactInput,
  PressCoverageInput,
} from "./api/pressKit.api";

/** Which press-kit entity a form/row is editing. `"team"` matches the tab id. */
export type PressKitKind = "coverage" | "team";

/** A superset of every coverage + contact field, so one shape backs the
 *  controlled form regardless of which tab is active — mirroring
 *  `LandingCopyFieldsValue`. Optional-in-the-model fields (`url`, `avatarUrl`)
 *  are `""` in the UI and only collapsed to `null` at submit time. */
export interface PressKitFieldsValue {
  source: string;
  title: string;
  meta: string;
  publishedOn: string;
  url: string;
  name: string;
  role: string;
  description: string;
  languages: string;
  email: string;
  avatarUrl: string;
}

export function emptyPressKitValue(): PressKitFieldsValue {
  return {
    source: "",
    title: "",
    meta: "",
    publishedOn: "",
    url: "",
    name: "",
    role: "",
    description: "",
    languages: "",
    email: "",
    avatarUrl: "",
  };
}

/** Seeds the form from an existing coverage row (edit flow). */
export function pressValueFromCoverage(
  coverage: AdminPressCoverageDTO,
): PressKitFieldsValue {
  return {
    ...emptyPressKitValue(),
    source: coverage.source,
    title: coverage.title,
    meta: coverage.meta,
    publishedOn: coverage.publishedOn,
    url: coverage.url ?? "",
  };
}

/** Seeds the form from an existing contact row (edit flow). */
export function pressValueFromContact(
  contact: AdminPressContactDTO,
): PressKitFieldsValue {
  return {
    ...emptyPressKitValue(),
    name: contact.name,
    role: contact.role,
    description: contact.description,
    languages: contact.languages,
    email: contact.email,
    avatarUrl: contact.avatarUrl ?? "",
  };
}

/** Reshapes the form value into the exact coverage payload the backend
 *  expects — the single place this mapping happens, shared by create + edit. */
export function buildCoverageInput(
  value: PressKitFieldsValue,
): PressCoverageInput {
  const url = value.url.trim();
  return {
    source: value.source.trim(),
    title: value.title.trim(),
    meta: value.meta.trim(),
    publishedOn: value.publishedOn.trim(),
    url: url ? url : null,
  };
}

/** Reshapes the form value into the exact contact payload the backend expects. */
export function buildContactInput(
  value: PressKitFieldsValue,
): PressContactInput {
  const avatarUrl = value.avatarUrl.trim();
  return {
    name: value.name.trim(),
    role: value.role.trim(),
    description: value.description.trim(),
    languages: value.languages.trim(),
    email: value.email.trim(),
    avatarUrl: avatarUrl ? avatarUrl : null,
  };
}

/** Mirrors the backend's requiredness client-side so a request is never made
 *  with a payload the server would 400 on: coverage needs a source + title,
 *  a contact needs a name + email. */
export function isPressKitValid(
  kind: PressKitKind,
  value: PressKitFieldsValue,
): boolean {
  if (kind === "coverage") {
    return value.source.trim().length > 0 && value.title.trim().length > 0;
  }
  return value.name.trim().length > 0 && value.email.trim().length > 0;
}
