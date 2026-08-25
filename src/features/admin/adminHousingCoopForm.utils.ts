import type {
  CoopFaceDTO,
  HousingCoopDTO,
} from "../economy/api/housingCoop.api";
import type { CoopWriteBody } from "./api/adminHousing.api";

/**
 * Controlled-form mirror of `CoopWriteBody`. Numeric/nullable DTO fields are
 * kept as plain strings here so every input can stay a simple controlled
 * `<input>`/`<select>` — `draftToWriteBody` converts back on submit.
 */
export interface CoopFormDraft {
  slug: string;
  name: string;
  nameEm: string;
  city: string;
  area: string;
  householdCount: string;
  phase: HousingCoopDTO["phase"];
  progress: string;
  operational: boolean;
  operationalSince: string;
  formingSince: string;
  description: string;
  shareAmountEuros: string;
  monthlyEuros: string;
  sharesAreTarget: boolean;
  ctaKind: HousingCoopDTO["ctaKind"];
  published: boolean;
}

const BLANK_DRAFT: CoopFormDraft = {
  slug: "",
  name: "",
  nameEm: "",
  city: "",
  area: "",
  householdCount: "1",
  phase: "forming",
  progress: "0",
  operational: false,
  operationalSince: "",
  formingSince: "",
  description: "",
  shareAmountEuros: "",
  monthlyEuros: "",
  sharesAreTarget: false,
  ctaKind: "join",
  published: false,
};

/** Seeds the form from an existing coop, or a blank draft for "New co-op". */
export function draftFromCoop(coop: HousingCoopDTO | null): CoopFormDraft {
  if (!coop) return BLANK_DRAFT;
  return {
    slug: coop.slug,
    name: coop.name,
    nameEm: coop.nameEm ?? "",
    city: coop.city,
    area: coop.area,
    householdCount: String(coop.householdCount),
    phase: coop.phase,
    progress: String(coop.progress),
    operational: coop.operational,
    operationalSince: coop.operationalSince ?? "",
    formingSince: coop.formingSince ?? "",
    description: coop.description,
    shareAmountEuros:
      coop.shareAmountEuros != null ? String(coop.shareAmountEuros) : "",
    monthlyEuros: coop.monthlyEuros != null ? String(coop.monthlyEuros) : "",
    sharesAreTarget: coop.sharesAreTarget,
    ctaKind: coop.ctaKind,
    published: coop.published,
  };
}

/** Blank or non-numeric input becomes `null` (these are nullable optional
 *  money fields) rather than `NaN` leaking into the write body. */
function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Converts the controlled-input draft back into the API write shape. `faces`
 * has no editor UI yet (out of scope for this pass) — edits carry the coop's
 * existing faces through unchanged, and new coops start with none.
 */
export function draftToWriteBody(
  draft: CoopFormDraft,
  existingFaces: CoopFaceDTO[],
): CoopWriteBody {
  return {
    slug: draft.slug.trim(),
    name: draft.name.trim(),
    nameEm: draft.nameEm.trim() || null,
    city: draft.city.trim(),
    area: draft.area.trim(),
    householdCount: Number(draft.householdCount) || 0,
    phase: draft.phase,
    progress: Number(draft.progress) || 0,
    operational: draft.operational,
    operationalSince: draft.operationalSince.trim() || null,
    formingSince: draft.formingSince.trim() || null,
    description: draft.description.trim(),
    shareAmountEuros: parseNullableNumber(draft.shareAmountEuros),
    monthlyEuros: parseNullableNumber(draft.monthlyEuros),
    sharesAreTarget: draft.sharesAreTarget,
    ctaKind: draft.ctaKind,
    published: draft.published,
    faces: existingFaces,
  };
}
