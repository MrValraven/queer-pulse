import {
  describeError,
  isAccountRestricted,
} from "../../shared/api/errorMessage";
import type { TFunction } from "../../shared/i18n/types";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  PersonaKindChangeError,
  toPersonaKindChangeError,
} from "./api/personaKindChangeError";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SkinFamily } from "./subprofile-skins";

const ERROR_KEY_PREFIX = "subprofiles:kindChange.error";

const familyLabel = (family: SkinFamily, t: TFunction): string => {
  const entry = KIND_FAMILIES.find((candidate) => candidate.family === family);
  return entry ? t(entry.labelKey) : family;
};

const describeRefusal = (
  refusal: PersonaKindChangeError,
  requestedKind: SubprofileKind,
  t: TFunction,
): string => {
  const kind = t(KIND_LABEL_KEYS[requestedKind]);
  const { details } = refusal;
  switch (details.reason) {
    case "unchanged":
      return t(`${ERROR_KEY_PREFIX}.unchanged`, { kind });
    case "other_family":
      return t(`${ERROR_KEY_PREFIX}.otherFamily`, {
        kind,
        currentFamily: familyLabel(details.currentFamily, t),
        requestedFamily: familyLabel(details.requestedFamily, t),
      });
    case "studio_releases":
      return t(
        details.requestedHasStudio
          ? `${ERROR_KEY_PREFIX}.studioOtherFormat`
          : `${ERROR_KEY_PREFIX}.studioNoFormat`,
        { count: details.releaseCount, kind },
      );
    case "studio_taken_down":
      return t(`${ERROR_KEY_PREFIX}.studioTakenDown`, {
        count: details.takenDownCount,
      });
  }
};

/**
 * One translated sentence for a failed persona type change. A restricted
 * account gets the shared restriction copy, a refusal the server named gets the
 * line for its reason, and anything else gets the action frame with the retry
 * tail.
 */
export function describePersonaKindChangeError(
  error: unknown,
  requestedKind: SubprofileKind,
  t: TFunction,
): string {
  if (isAccountRestricted(error)) return t("shared:apiError.accountRestricted");
  const refusal =
    error instanceof PersonaKindChangeError
      ? error
      : toPersonaKindChangeError(error);
  if (refusal) return describeRefusal(refusal, requestedKind, t);
  return describeError(
    t(`${ERROR_KEY_PREFIX}.action`),
    error,
    t("shared:apiError.tryAgainTail"),
  );
}
