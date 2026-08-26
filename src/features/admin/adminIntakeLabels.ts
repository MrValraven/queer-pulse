import type { TFunction } from "../../shared/i18n/types";
import { isKnownIntakeKind } from "./api/adminIntakes.api";

/**
 * The human name for an intake kind. A kind this build has never heard of (a
 * form added after this bundle was built, or a hand-written row) keeps its raw
 * wire value rather than resolving to a missing catalog key and printing a
 * translation code at an admin.
 */
export function intakeKindLabel(t: TFunction, kind: string): string {
  return isKnownIntakeKind(kind)
    ? t(`admin:adminIntakes.kind.${kind}`)
    : kind.replace(/[_-]+/g, " ");
}

/**
 * How to reach whoever sent an anonymous submission: the forms that ask for one
 * write `email`, the rest at least write a `name`. Returns null when the payload
 * carries neither, which is the honest "there is no way back to this person".
 */
export function payloadContact(payload: Record<string, unknown>): {
  email: string | null;
  name: string | null;
} {
  const read = (key: string): string | null => {
    const value = payload?.[key];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };
  return { email: read("email"), name: read("name") ?? read("applicantName") };
}
