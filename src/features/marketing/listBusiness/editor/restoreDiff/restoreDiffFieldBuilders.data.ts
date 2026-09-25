import type { TFunction } from "../../../../../shared/i18n/types";
import {
  PRICES,
  REL,
  VIS,
  catLabel,
  goodForLabel,
  hoodLabel,
  langLabel,
  type ListingDraft,
} from "../../listBusiness.data";
import { pricingModeOf } from "../../listingMenu.data";
import type { RestoreFieldChange } from "./restoreDiff.types";
import {
  choiceField,
  fieldLabelKey,
  isFieldChanged,
  mapPinField,
  paragraphsField,
  rowsField,
  setField,
  socialFields,
  textField,
  yesNoLabel,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import { hoursExceptionRows, hoursRows } from "./restoreDiffHoursRows.data";
import { menuRows } from "./restoreDiffMenuRows.data";
import {
  accessibilityRows,
  photoRows,
  serviceRows,
} from "./restoreDiffRows.data";

/**
 * How the review shows each draft field: which builder turns a changed field
 * into entries a reader can follow. `buildRestoreDiff` runs these and
 * backs every one of them with its safety net.
 */

function optionLabel(
  t: TFunction,
  options: ReadonlyArray<{ id: string; labelKey: string }>,
  value: string,
): string {
  const option = options.find((candidate) => candidate.id === value);
  return option ? t(option.labelKey) : value;
}

const BADGE_LABEL_KEYS: Record<string, string> = {
  owned: "marketing:listBusiness.step1.owned.title",
  friendly: "marketing:listBusiness.step1.friendly.title",
};

type FieldBuilder = (context: RestoreDiffContext) => RestoreFieldChange[];

/** A field the review never shows on its own: either folded into a sibling
 *  (the pin's coordinates, the photos' alt text) or not restorable at all. */
const SHOWN_ELSEWHERE: FieldBuilder = () => [];

/** Typed over every draft key, so a new field fails the typecheck here too
 *  until somebody decides how the review shows it. */
export const FIELD_BUILDERS: Record<keyof ListingDraft, FieldBuilder> = {
  name: (context) => textField(context, "name"),
  cats: (context) => setField(context, "cats", (id) => catLabel(context.t, id)),
  hood: (context) =>
    choiceField(context, "hood", (draft) =>
      draft.hood ? hoodLabel(context.t, draft.hood) : "",
    ),
  badge: (context) =>
    choiceField(context, "badge", (draft) => {
      const labelKey = BADGE_LABEL_KEYS[draft.badge];
      return labelKey ? context.t(labelKey) : "";
    }),
  evidence: (context) => textField(context, "evidence"),
  price: (context) =>
    choiceField(context, "price", (draft) =>
      optionLabel(context.t, PRICES, draft.price),
    ),
  blurb: (context) => textField(context, "blurb"),
  tagline: (context) => textField(context, "tagline"),
  whatItIs: paragraphsField,
  tags: (context) => setField(context, "tags", (tag) => tag),
  goodFor: (context) =>
    setField(context, "goodFor", (id) => goodForLabel(context.t, id)),
  langs: (context) =>
    setField(context, "langs", (id) => langLabel(context.t, id)),
  services: (context) =>
    isFieldChanged(context, "services")
      ? rowsField("services", fieldLabelKey("services"), serviceRows(context))
      : [],
  pricingMode: (context) =>
    choiceField(context, "pricingMode", (draft) =>
      context.t(`marketing:listBusiness.pricing.mode.${pricingModeOf(draft)}`),
    ),
  menu: (context) =>
    isFieldChanged(context, "menu")
      ? rowsField("menu", fieldLabelKey("menu"), menuRows(context))
      : [],
  online: (context) =>
    choiceField(context, "online", (draft) =>
      yesNoLabel(context.t, draft.online),
    ),
  address: (context) => textField(context, "address"),
  geocoded: mapPinField,
  latitude: SHOWN_ELSEWHERE,
  longitude: SHOWN_ELSEWHERE,
  hours: (context) =>
    isFieldChanged(context, "hours")
      ? rowsField("hours", fieldLabelKey("hours"), hoursRows(context))
      : [],
  hoursNote: (context) => textField(context, "hoursNote"),
  hoursExceptions: (context) =>
    isFieldChanged(context, "hoursExceptions")
      ? rowsField(
          "hoursExceptions",
          fieldLabelKey("hoursExceptions"),
          hoursExceptionRows(context),
        )
      : [],
  social: socialFields,
  accessibility: (context) =>
    isFieldChanged(context, "accessibility")
      ? rowsField(
          "accessibility",
          fieldLabelKey("accessibility"),
          accessibilityRows(context),
        )
      : [],
  photos: (context) =>
    isFieldChanged(context, "photos") || isFieldChanged(context, "alt")
      ? rowsField("photos", fieldLabelKey("photos"), photoRows(context))
      : [],
  alt: SHOWN_ELSEWHERE,
  rel: (context) =>
    choiceField(context, "rel", (draft) =>
      draft.rel ? optionLabel(context.t, REL, draft.rel) : "",
    ),
  ownerName: (context) => textField(context, "ownerName"),
  ownerRole: (context) => textField(context, "ownerRole"),
  ownerBio: (context) => textField(context, "ownerBio"),
  visibility: (context) =>
    choiceField(context, "visibility", (draft) =>
      optionLabel(context.t, VIS, draft.visibility),
    ),
  linkToProfile: (context) =>
    choiceField(context, "linkToProfile", (draft) =>
      yesNoLabel(context.t, draft.linkToProfile),
    ),
  consentOuting: (context) =>
    choiceField(context, "consentOuting", (draft) =>
      yesNoLabel(context.t, draft.consentOuting),
    ),
  consentGuide: (context) =>
    choiceField(context, "consentGuide", (draft) =>
      yesNoLabel(context.t, draft.consentGuide),
    ),
  path: SHOWN_ELSEWHERE,
  affirmingBaselineAccepted: SHOWN_ELSEWHERE,
  managementRole: SHOWN_ELSEWHERE,
  isStaffAuthored: SHOWN_ELSEWHERE,
};
